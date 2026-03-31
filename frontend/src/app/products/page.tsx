import { Suspense } from "react";
import ProductsContent from "./ProductsContent";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">상품</h1>
          <p className="text-center text-foreground/50 py-12">로딩 중...</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
