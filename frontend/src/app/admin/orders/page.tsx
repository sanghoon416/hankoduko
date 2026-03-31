"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAdminOrders } from "@/lib/api";
import type { AdminOrder, PaginatedResponse, OrderStatus } from "@/types";
import {
  ORDER_STATUS_LABELS,
  STATUS_COLORS,
} from "@/types";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "입금 대기" },
  { value: "PAID", label: "입금 확인" },
  { value: "SHIPPING", label: "배송 중" },
  { value: "DELIVERED", label: "배송 완료" },
  { value: "CANCELLED", label: "취소" },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const [data, setData] = useState<PaginatedResponse<AdminOrder> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders({
        page,
        limit: 20,
        status: status || undefined,
      });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = (s: string) => {
    setStatus(s);
    setPage(1);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-6">주문 관리</h1>

      {/* 상태 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleStatusChange(filter.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === filter.value
                ? "bg-primary text-white"
                : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center text-foreground/50 py-12">로딩 중...</p>
        ) : !data || data.data.length === 0 ? (
          <p className="text-center text-foreground/50 py-12">
            주문이 없습니다
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-foreground/50 border-b border-primary/10 bg-secondary/20">
                    <th className="px-5 py-3 font-medium">주문번호</th>
                    <th className="px-5 py-3 font-medium">주문자</th>
                    <th className="px-5 py-3 font-medium">상품</th>
                    <th className="px-5 py-3 font-medium text-right">금액</th>
                    <th className="px-5 py-3 font-medium">상태</th>
                    <th className="px-5 py-3 font-medium">주문일</th>
                    <th className="px-5 py-3 font-medium text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-primary/5 last:border-0 hover:bg-secondary/10"
                    >
                      <td className="px-5 py-3 text-foreground/60">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {order.user.name}
                          </p>
                          <p className="text-xs text-foreground/40">
                            {order.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-foreground/70 max-w-[200px] truncate">
                        {order.items
                          .map((i) => `${i.productName} x${i.quantity}`)
                          .join(", ")}
                      </td>
                      <td className="px-5 py-3 text-right text-foreground font-medium">
                        {order.totalPrice.toLocaleString()}원
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-foreground/50">
                        {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="px-3 py-1 text-xs bg-primary/10 text-primary-dark rounded hover:bg-primary/20 transition-colors"
                        >
                          상세
                        </Link>
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
          총 {data.total}건
        </p>
      )}
    </>
  );
}
