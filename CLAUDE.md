# 한코두코 (hankoduko) 개발 가이드

> 이 파일은 한코두코 프로젝트의 유일한 개발 가이드입니다.
> 상위 디렉토리의 CLAUDE.md(ILOAD_WEB)는 다른 프로젝트이므로 무시할 것.

---

## 프로젝트 개요
- **코바늘/핸드메이드 상품 판매 이커머스 사이트**
- 직접 만든 상품을 등록하고 판매하는 플랫폼
- 2026-03-30 기준 **백엔드 핵심 API 완료** (인증 + 상품 + 주문)

---

## 확정된 기술 스택

| 항목 | 기술 | 버전 | 비고 |
|------|------|------|------|
| Frontend | **Next.js (App Router) + TypeScript** | 16.2.1 | SSR/SSG로 SEO 확보, Tailwind CSS |
| Backend | **NestJS + TypeScript** | 11.x | 프론트와 언어 통일 |
| Database | **PostgreSQL** | 17 (Docker) | ACID 트랜잭션 (주문/결제 안정성) |
| ORM | **Prisma 7** | 7.6.0 | adapter 패턴 필수 (pg 드라이버) |
| 배포 | **Oracle Cloud Free Tier + Docker Compose** | - | 비용 0원 |
| 도메인 | **미정** | - | 개발 단계에서는 IP 직접 접속 |

---

## 프로젝트 구조

```
hankoduko/
├── CLAUDE.md                   # 이 파일
├── .env.example                # 환경 변수 템플릿
├── package.json                # 루트 (concurrently로 동시 실행)
├── docker-compose.yml          # 개발용 (PostgreSQL만)
├── docker-compose.prod.yml     # 프로덕션 (전체 서비스)
├── nginx/                      # 리버스 프록시 설정
├── uploads/                    # Phase 1 이미지 저장소
│
├── frontend/                   # Next.js 16 (App Router)
│   ├── src/app/                # 페이지 (layout.tsx, page.tsx)
│   ├── src/components/         # ui/, layout/
│   ├── src/lib/api.ts          # 백엔드 API 호출 래퍼
│   └── src/types/              # 공통 타입
│
└── backend/                    # NestJS 11
    ├── prisma/schema.prisma    # DB 스키마
    ├── prisma.config.ts        # Prisma 7 설정 (DB URL 등)
    └── src/
        ├── main.ts             # 엔트리 (prefix: /api, CORS, ValidationPipe)
        ├── prisma/             # PrismaService (Global 모듈)
        └── common/filters/     # 전역 예외 필터
```

---

## 개발 환경 실행 방법

```bash
# 1. DB 시작 (Docker Desktop 필요)
docker compose up -d

# 2. 프론트 + 백 동시 실행
npm run dev

# 개별 실행
npm run dev:frontend    # http://localhost:3000
npm run dev:backend     # http://localhost:4000/api

# Prisma
npm run prisma:generate   # 클라이언트 생성
npm run prisma:migrate:dev  # 마이그레이션
npm run prisma:studio     # DB GUI
```

---

## 아키텍처 (확정)

```
[Oracle Cloud Free Tier - ARM 4코어/24GB]
│
├── Docker Compose (프로덕션)
│   ├── nginx (리버스 프록시, :80)
│   ├── next-app (Frontend, :3000)
│   ├── nestjs-api (Backend, :4000)
│   └── postgresql (DB, :5432)
│
└── 단일 서버, Docker로 논리 분리
    (성장 시 프론트→Vercel, DB→RDS 등 개별 분리 가능)
```

개발 시에는 **DB만 Docker**로 띄우고 프론트/백은 로컬 실행 (HMR 속도 + Windows 볼륨 이슈 회피)

---

## Prisma 7 주의사항

Prisma 7은 이전 버전과 다른 설정 방식을 사용:
- `schema.prisma`에 `url` 필드 **사용 불가** → `prisma.config.ts`에서 설정
- PrismaClient 생성 시 **adapter 필수** (`@prisma/adapter-pg` + `pg`)
- 설정 파일: `backend/prisma.config.ts`
- 스키마 파일: `backend/prisma/schema.prisma`

---

## DB 스키마 (현재 상태)

### Enums
- **Role**: `USER` (구매자), `ADMIN` (관리자 - 상품등록/주문관리)
- **OrderStatus**: `PENDING` → `PAID` → `SHIPPING` → `DELIVERED` / `CANCELLED`
- **ProductCategory**: `CROCHET`, `KNITTING`, `EMBROIDERY`, `BEADS`, `OTHER`

### 테이블 (5개)
| 모델 | 테이블명 | 주요 필드 | 비고 |
|------|----------|-----------|------|
| User | users | email(unique), password, name, address?, refundBank?, refundAccount?, refreshToken?, role | 기본 USER |
| Product | products | name, thumbnailUrl, description, price(Int/원), stock, category(Enum) | ADMIN만 등록 |
| ProductImage | product_images | url, alt?, productId | 상품 삭제 시 Cascade |
| Order | orders | userId, totalPrice, shippingName, shippingPhone, shippingAddress, status | Phase 1 계좌이체 |
| OrderItem | order_items | orderId, productId, quantity, price, productName | 주문 시점 스냅샷 |

### 설계 결정
- 모든 ID는 **UUID**
- 가격은 **Int** (원화 소수점 없음)
- 카테고리는 **Enum** (초기 고정, 필요 시 테이블로 전환 가능)
- 대표 이미지는 **Product.thumbnailUrl** (문자열, Phase 1 로컬 경로)
- OrderItem에 **price/productName 스냅샷** (상품 수정해도 주문 이력 보존)
- onDelete: 이미지→Cascade, 유저/상품→Restrict

---

## 인증 시스템

### 구조
- **Access Token**: 15분 만료, `Authorization: Bearer {token}` 헤더로 전달
- **Refresh Token**: 30일 만료, DB에 해시 저장 (강제 로그아웃 가능)
- 비밀번호: bcrypt (salt rounds: 10)

### API 엔드포인트
| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/auth/signup` | 공개 | 회원가입 (email+password+name) |
| POST | `/api/auth/login` | 공개 | 로그인 |
| POST | `/api/auth/refresh` | Refresh Token | Access Token 재발급 |
| POST | `/api/auth/logout` | Access Token | 로그아웃 (Refresh Token 삭제) |
| GET | `/api/auth/me` | Access Token | 현재 유저 정보 |

### 가드 사용법
- `@UseGuards(JwtAuthGuard)` — 인증 필요
- `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.ADMIN)` — 관리자 전용
- `@CurrentUser()` — 현재 유저 정보 주입

### 관리자 계정
- 시드로 생성: `npx prisma db seed`
- 이메일: admin@hankoduko.com / 비밀번호: admin1234!

---

## 상품 CRUD API

### API 엔드포인트
| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/products` | 공개 | 상품 목록 (?page, ?limit, ?category, ?search) |
| GET | `/api/products/:id` | 공개 | 상품 상세 (이미지 포함) |
| POST | `/api/products` | ADMIN | 상품 등록 |
| PATCH | `/api/products/:id` | ADMIN | 상품 수정 |
| DELETE | `/api/products/:id` | ADMIN | 상품 삭제 |
| POST | `/api/products/:id/images` | ADMIN | 이미지 업로드 (multipart, 5MB, jpeg/png/webp/gif) |
| DELETE | `/api/products/images/:imageId` | ADMIN | 이미지 삭제 |

### 이미지 업로드
- Phase 1: 로컬 `uploads/products/` 폴더에 저장
- 파일명: UUID로 자동 생성 (충돌 방지)
- 정적 파일 서빙: `main.ts`에서 `/uploads` prefix로 설정

---

## 주문 API

### API 엔드포인트 (유저)
| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/orders` | USER | 주문 생성 (상품+수량, 배송정보) |
| GET | `/api/orders` | USER | 내 주문 목록 (?page, ?limit, ?status) |
| GET | `/api/orders/:id` | USER | 내 주문 상세 |

### API 엔드포인트 (관리자)
| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/admin/orders` | ADMIN | 전체 주문 목록 |
| GET | `/api/admin/orders/:id` | ADMIN | 주문 상세 (유저 정보 포함) |
| PATCH | `/api/admin/orders/:id/status` | ADMIN | 주문 상태 변경 |

### 상태 흐름
- PENDING → PAID, CANCELLED
- PAID → SHIPPING, CANCELLED
- SHIPPING → DELIVERED, CANCELLED
- DELIVERED, CANCELLED → 변경 불가

### 주문 생성 로직
- 상품 존재/재고 확인 → 재고 차감 → OrderItem 스냅샷 → 트랜잭션으로 처리

---

## 개발 환경 주의사항

- **Docker PostgreSQL 포트: 5432**
- DB 접속 정보: `.env` 파일의 `DATABASE_URL` 참조
- 환경변수 파일: 루트 `.env` (Docker용) + `backend/.env` (백엔드용)
- 비밀번호 변경 후 `docker compose down -v && docker compose up -d` 로 볼륨 재생성 필요
- `backend/src/main.ts`에서 `dotenv/config` import 필수 (환경변수 로드)

---

## 단계별 로드맵

### 이미지 저장소
| 단계 | 방식 | 시점 | 상태 |
|------|------|------|------|
| **Phase 1** | **로컬 uploads/ 폴더** | **현재** | **← 현재 단계** |
| Phase 2 | MinIO (자체 호스팅 S3 호환) | 상품 많아지면 | 예정 |
| Phase 3 | AWS S3 + CloudFront | 사용자 많아지면 | 예정 |

> 설계 원칙: 이미지 업로드/조회를 별도 서비스 레이어로 분리하여 저장소 교체 시 코드 변경 최소화

### 결제 시스템
| 단계 | 방식 | 시점 | 상태 |
|------|------|------|------|
| **Phase 1** | **수동 계좌이체** (계좌번호 안내 → 판매자가 입금 확인) | **현재** | **← 현재 단계** |
| Phase 2 | 가상계좌 자동 발급 (포트원 V2 도입) | 사용자 생기면 | 예정 |
| Phase 3 | 카드/간편결제 추가 (포트원 PG 채널 추가) | 성장 후 | 예정 |

> 설계 원칙: 주문/결제 상태 관리 구조는 처음부터 확장 가능하게 설계 (Phase 2 전환 시 결제 모듈만 교체)

---

## 작업 원칙

### 최우선 원칙
- **기존에 작동하던 기능은 절대 망가뜨리지 않는다**
- 요청하지 않은 기존 코드 임의 수정 금지
- "더 좋게" 만들겠다고 작동하는 코드 리팩토링 금지

### 수정 전 - 영향 범위 파악
- 수정할 컴포넌트/함수가 **어디서 import 되는지** 먼저 확인
- 공통 컴포넌트(사이드바, 헤더, 모달 등)는 특히 주의

### 수정 후 체크리스트
- [ ] 해당 코드를 사용하는 다른 페이지에서 정상 작동하는지
- [ ] props/파라미터 변경 시 기존 호출부가 깨지지 않는지
- [ ] 스타일 변경 시 다른 페이지 레이아웃에 영향 없는지
- [ ] 신규 기능이 기존 로직과 충돌하지 않는지

---

## 응답 형식

코드 수정 작업 후에는 아래 형식을 따를 것:

```
### 수정 내용
- 무엇을 어떻게 변경했는지

### 변경 파일
- 파일 경로 목록

### 영향 범위
- 이 수정이 영향을 줄 수 있는 다른 페이지/컴포넌트

### 확인 필요
- 수동으로 테스트해봐야 할 시나리오
```
