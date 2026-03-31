"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 초기값 읽기
  const initialCategory = (searchParams.get("category") || "ALL") as
    | ProductCategory
    | "ALL";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState<ProductCategory | "ALL">(
    initialCategory
  );
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  // URL 동기화
  const updateURL = useCallback(
    (newPage: number, newCategory: string, newSearch: string) => {
      const params = new URLSearchParams();
      if (newCategory && newCategory !== "ALL")
        params.set("category", newCategory);
      if (newPage > 1) params.set("page", String(newPage));
      if (newSearch) params.set("search", newSearch);
      const qs = params.toString();
      router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  // 데이터 fetch
  useEffect(() => {
    setLoading(true);
    const params: {
      page: number;
      limit: number;
      category?: string;
      search?: string;
    } = { page, limit: 12 };
    if (category !== "ALL") params.category = category;
    if (search) params.search = search;

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

    updateURL(page, category, search);
  }, [page, category, search, updateURL]);

  const handleCategoryChange = (cat: ProductCategory | "ALL") => {
    setCategory(cat);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // 페이지네이션 번호 생성 (... 처리)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">상품</h1>

      {/* 검색 + 카테고리 필터 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex gap-2 flex-wrap flex-1">
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

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="상품명 검색"
              className="px-4 py-2 pr-8 border border-primary/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-48"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 text-lg leading-none"
              >
                &times;
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors font-medium"
          >
            검색
          </button>
        </form>
      </div>

      {/* 검색 결과 표시 */}
      {search && (
        <div className="mb-4 flex items-center gap-2">
          <p className="text-sm text-foreground/60">
            &quot;{search}&quot; 검색 결과
          </p>
          <button
            onClick={handleClearSearch}
            className="text-xs text-primary-dark hover:underline"
          >
            초기화
          </button>
        </div>
      )}

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

          {/* 페이지네이션 (... 처리) */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-lg text-sm font-medium bg-white text-foreground/70 hover:bg-primary/10 transition-colors disabled:opacity-30"
              >
                &lt;
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="w-10 h-10 flex items-center justify-center text-foreground/40"
                  >
                    ...
                  </span>
                ) : (
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
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-lg text-sm font-medium bg-white text-foreground/70 hover:bg-primary/10 transition-colors disabled:opacity-30"
              >
                &gt;
              </button>
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
