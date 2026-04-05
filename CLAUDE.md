# 한코두코 (hankoduko) 개발 가이드

> 이 파일은 한코두코 프로젝트의 유일한 개발 가이드입니다.
> 상위 디렉토리의 CLAUDE.md(ILOAD_WEB)는 다른 프로젝트이므로 무시할 것.

---

## 프로젝트 개요
- **코바늘/핸드메이드 상품 판매 이커머스 사이트**
- 직접 만든 상품을 등록하고 판매하는 플랫폼
- 2026-04-01 기준 **백엔드 + 프론트엔드 핵심 기능 완료, UI 개선 단계**

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

## 현재 진행 상황

### 완료
- [x] 초기 세팅 + GitHub 연결 (sanghoon416/hankoduko)
- [x] DB 스키마 설계 + 마이그레이션 (5 테이블, 3 Enum)
- [x] DB 컬럼명 snake_case @map 적용
- [x] 인증 모듈 (회원가입/로그인/토큰갱신/로그아웃, Access+Refresh Token)
- [x] 상품 CRUD API + 이미지 업로드
- [x] 주문 CRUD API (유저 주문 + 관리자 상태 관리)
- [x] 프론트: 공통 레이아웃 (Header + Footer)
- [x] 프론트: 홈 페이지 (히어로 + 최신 상품)
- [x] 프론트: 상품 목록 (카테고리 필터, 페이지네이션)
- [x] 프론트: 상품 상세 (이미지, 설명, 가격, 재고)
- [x] 프론트: 로그인/회원가입 페이지 + AuthContext + 헤더 인증 상태
- [x] 프론트: 상품 상세 주문 기능 (수량 선택, 주문 모달, 배송정보 입력)
- [x] 프론트: 내 주문 내역 페이지 (/orders)
- [x] 코드 리뷰 버그 수정 (전역 예외 필터 등록, 로그아웃 응답, not-found 중복 main 등)
- [x] 관리자 페이지 (대시보드 통계, 상품 등록/수정/삭제, 주문 관리/상태 변경)
- [x] 이미지 fallback (FallbackImage 클라이언트 컴포넌트) + ProductCard 품절 오버레이
- [x] 모바일 반응형 헤더 (햄버거 메뉴)
- [x] 상품 목록 검색 기능 + URL 상태관리 (searchParams) + 페이지네이션 ... 처리
- [x] 상품 상세 SEO (generateMetadata)
- [x] 에러 페이지 (error.tsx)
- [x] 마이페이지 (/mypage) — 프로필(주소, 환불계좌) 수정 + 비밀번호 변경
- [x] 폼 에러 UX 개선 — 필드별 에러 표시 + 빨간 테두리 (로그인, 회원가입, 마이페이지)
- [x] 상품 등록 이미지 업로드 (파일 선택 → 즉시 업로드 → 미리보기, X로 제거)

### 다음에 해야 할 일
- [ ] 아직 커밋/푸시 안 된 변경사항이 있을 수 있음 → git status 확인 필요
- [ ] .env 파일이 Git에 추적됨 → `git rm --cached` 후 .env.example로 교체 필요
- [ ] 배포 준비 (Nginx HTTPS, Backend Dockerfile non-root user)

### 알려진 이슈
- Windows 개발 환경 메모리 부족 → `npm run dev`로 프론트+백 동시 실행 시 OOM 발생 가능. 메모리 부족하면 별도 터미널에서 각각 실행 권장
- curl로 한글 데이터 입력 시 인코딩 깨짐 → DB에서 직접 INSERT하거나 API 테스트 도구 사용
- 비밀번호 최소 길이: 4자 (백엔드 DTO + 프론트 폼 모두 4자 기준)

---

## 프로젝트 구조

```
hankoduko/
├── CLAUDE.md                   # 이 파일
├── .env                        # 환경 변수 (git 미추적)
├── package.json                # 루트 (concurrently로 동시 실행)
├── docker-compose.yml          # 개발용 (PostgreSQL만)
├── docker-compose.prod.yml     # 프로덕션 (전체 서비스)
├── nginx/                      # 리버스 프록시 설정
├── uploads/                    # Phase 1 이미지 저장소
│
├── frontend/                   # Next.js 16 (App Router)
│   ├── src/app/                # 페이지
│   │   ├── layout.tsx          # 루트 레이아웃 (AuthProvider + Header + Footer)
│   │   ├── page.tsx            # 홈 (히어로 + 최신 상품)
│   │   ├── error.tsx           # 글로벌 에러 바운더리
│   │   ├── not-found.tsx       # 404 페이지
│   │   ├── login/page.tsx      # 로그인
│   │   ├── signup/page.tsx     # 회원가입
│   │   ├── mypage/page.tsx     # 마이페이지 (프로필 수정, 비밀번호 변경)
│   │   ├── orders/page.tsx     # 내 주문 내역
│   │   ├── products/
│   │   │   ├── page.tsx        # 상품 목록 (Suspense wrapper)
│   │   │   ├── ProductsContent.tsx  # 검색 + 필터 + 페이지네이션
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # 상품 상세 (SSR + generateMetadata)
│   │   │       └── ProductDetailClient.tsx  # 주문 UI (클라이언트)
│   │   └── admin/
│   │       ├── layout.tsx      # 관리자 레이아웃 (권한 체크 + 사이드바)
│   │       ├── page.tsx        # 대시보드 (통계 카드 + 최근 주문)
│   │       ├── products/
│   │       │   ├── page.tsx    # 상품 목록 (테이블, 검색, 삭제)
│   │       │   ├── new/page.tsx       # 상품 등록
│   │       │   └── [id]/edit/page.tsx # 상품 수정 + 이미지 관리
│   │       └── orders/
│   │           ├── page.tsx    # 전체 주문 목록 (상태 필터)
│   │           └── [id]/page.tsx  # 주문 상세 + 상태 변경
│   ├── src/components/
│   │   ├── layout/Header.tsx   # 헤더 (반응형, 햄버거 메뉴, 관리자 링크)
│   │   ├── layout/Footer.tsx   # 푸터
│   │   ├── ui/
│   │   │   ├── ProductCard.tsx # 상품 카드 (fallback 이미지 + 품절 표시)
│   │   │   ├── FallbackImage.tsx  # 이미지 에러 시 fallback 처리
│   │   │   └── OrderModal.tsx  # 주문 모달 (배송정보 입력)
│   │   └── admin/
│   │       ├── AdminSidebar.tsx   # 관리자 사이드바 네비게이션
│   │       └── ProductForm.tsx    # 상품 등록/수정 공통 폼 (이미지 업로드)
│   ├── src/contexts/AuthContext.tsx  # 인증 상태 관리 (React Context)
│   ├── src/lib/api.ts          # API 호출 (자동 토큰 첨부 + refresh + 관리자 API)
│   └── src/types/index.ts      # 타입 (User, Product, Order, AdminOrder 등)
│
└── backend/                    # NestJS 11
    ├── prisma/schema.prisma    # DB 스키마
    ├── prisma/seed.ts          # 관리자 시드
    ├── prisma.config.ts        # Prisma 7 설정
    └── src/
        ├── main.ts             # 엔트리 (dotenv, prefix, CORS, 예외필터, 정적파일)
        ├── auth/               # 인증 모듈 (JWT, bcrypt, guards, decorators)
        ├── products/           # 상품 모듈 (CRUD + 이미지 업로드)
        ├── orders/             # 주문 모듈 (유저 주문 + 관리자 상태 관리)
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
| GET | `/api/auth/profile` | Access Token | 프로필 조회 (주소, 환불계좌 포함) |
| PATCH | `/api/auth/profile` | Access Token | 프로필 수정 (주소, 환불은행, 환불계좌) |
| PATCH | `/api/auth/password` | Access Token | 비밀번호 변경 (현재 비밀번호 확인 필요) |

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
| POST | `/api/products/upload-thumbnail` | ADMIN | 썸네일 업로드 (상품 생성 전에도 사용 가능, URL 반환) |
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
