import Link from "next/link";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ui/ProductCard";

export default async function Home() {
  let products: import("@/types").Product[] = [];

  try {
    const res = await getProducts({ limit: 8 });
    products = res.data;
  } catch {
    // 백엔드 미실행 시 빈 배열
  }

  return (
    <>
      {/* 히어로 */}
      <section className="bg-secondary/40 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground">한코두코</h1>
          <p className="mt-4 text-xl text-foreground/70">
            한 코 한 코, 정성이 담긴 핸드메이드
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            상품 둘러보기
          </Link>
        </div>
      </section>

      {/* 최신 상품 */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">최신 상품</h2>
          <Link
            href="/products"
            className="text-sm text-primary-dark hover:underline"
          >
            전체 보기
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-foreground/50 py-12">
            아직 등록된 상품이 없습니다
          </p>
        )}
      </section>
    </>
  );
}
