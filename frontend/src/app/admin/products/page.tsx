"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getProducts, deleteProduct } from "@/lib/api";
import type { Product, PaginatedResponse, ProductCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

export default function AdminProductsPage() {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        page,
        limit: 20,
        category: category || undefined,
        search: search || undefined,
      });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;
    try {
      await deleteProduct(id);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">상품 관리</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          상품 등록
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === ""
                  ? "bg-primary text-white"
                  : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50"
              }`}
            >
              전체
            </button>
            {(
              Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => handleCategoryChange(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === value
                    ? "bg-primary text-white"
                    : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="상품명 검색"
              className="px-3 py-1.5 border border-primary/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-foreground/10 text-foreground/70 rounded-lg text-sm hover:bg-foreground/20 transition-colors"
            >
              검색
            </button>
          </form>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center text-foreground/50 py-12">로딩 중...</p>
        ) : !data || data.data.length === 0 ? (
          <p className="text-center text-foreground/50 py-12">
            등록된 상품이 없습니다
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-foreground/50 border-b border-primary/10 bg-secondary/20">
                    <th className="px-5 py-3 font-medium">이미지</th>
                    <th className="px-5 py-3 font-medium">상품명</th>
                    <th className="px-5 py-3 font-medium">카테고리</th>
                    <th className="px-5 py-3 font-medium text-right">가격</th>
                    <th className="px-5 py-3 font-medium text-right">재고</th>
                    <th className="px-5 py-3 font-medium text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-primary/5 last:border-0 hover:bg-secondary/10"
                    >
                      <td className="px-5 py-3">
                        <img
                          src={product.thumbnailUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23eee' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23aaa' font-size='12'%3E?%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground max-w-[200px] truncate">
                        {product.name}
                      </td>
                      <td className="px-5 py-3 text-foreground/60">
                        {CATEGORY_LABELS[product.category]}
                      </td>
                      <td className="px-5 py-3 text-right text-foreground">
                        {product.price.toLocaleString()}원
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={
                            product.stock === 0
                              ? "text-red-600 font-medium"
                              : "text-foreground"
                          }
                        >
                          {product.stock === 0 ? "품절" : product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="px-3 py-1 text-xs bg-primary/10 text-primary-dark rounded hover:bg-primary/20 transition-colors"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-primary/10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded border border-primary/20 disabled:opacity-30 hover:bg-secondary/30 transition-colors"
                >
                  이전
                </button>
                <span className="px-3 py-1 text-sm text-foreground/60">
                  {page} / {data.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                  disabled={page === data.totalPages}
                  className="px-3 py-1 text-sm rounded border border-primary/20 disabled:opacity-30 hover:bg-secondary/30 transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {data && (
        <p className="text-xs text-foreground/40 mt-2 text-right">
          총 {data.total}개 상품
        </p>
      )}
    </>
  );
}
