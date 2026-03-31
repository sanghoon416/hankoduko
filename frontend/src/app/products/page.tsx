"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ui/ProductCard";
import type { Product, ProductCategory, PaginatedResponse } from "@/types";
import { CATEGORY_LABELS } from "@/types";

const CATEGORIES: (ProductCategory | "ALL")[] = [
  "ALL",
  "CROCHET",
  "KNITTING",
  "EMBROIDERY",
  "BEADS",
  "OTHER",
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<ProductCategory | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, limit: 12 };
    if (category !== "ALL") params.category = category;

    getProducts(params)
      .then((res: PaginatedResponse<Product>) => {
        setProducts(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [page, category]);

  const handleCategoryChange = (cat: ProductCategory | "ALL") => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">상품</h1>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? "bg-primary text-white"
                : "bg-white text-foreground/70 hover:bg-primary/10"
            }`}
          >
            {cat === "ALL" ? "전체" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* 상품 그리드 */}
      {loading ? (
        <p className="text-center text-foreground/50 py-12">로딩 중...</p>
      ) : products.length > 0 ? (
        <>
          <p className="text-sm text-foreground/50 mb-4">총 {total}개</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-primary text-white"
                      : "bg-white text-foreground/70 hover:bg-primary/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-foreground/50 py-12">
          상품이 없습니다
        </p>
      )}
    </div>
  );
}
