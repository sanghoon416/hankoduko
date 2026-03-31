"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getAdminOrder, updateOrderStatus } from "@/lib/api";
import type { AdminOrder, OrderStatus } from "@/types";
import {
  ORDER_STATUS_LABELS,
  STATUS_COLORS,
  VALID_STATUS_TRANSITIONS,
} from "@/types";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    getAdminOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrder(updated);
      setShowStatusModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "상태 변경에 실패했습니다");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="text-center text-foreground/50 py-12">로딩 중...</p>;
  }

  if (!order) {
    return (
      <p className="text-center text-foreground/50 py-12">
        주문을 찾을 수 없습니다
      </p>
    );
  }

  const nextStatuses = VALID_STATUS_TRANSITIONS[order.status];

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/orders"
          className="text-foreground/40 hover:text-foreground transition-colors"
        >
          &larr;
        </Link>
        <h1 className="text-2xl font-bold text-foreground">주문 상세</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 주문 정보 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">주문 정보</h2>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/50">주문번호</dt>
              <dd className="text-foreground font-mono">{order.id.slice(0, 8)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">주문일</dt>
              <dd className="text-foreground">
                {new Date(order.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">합계</dt>
              <dd className="text-primary-dark font-bold">
                {order.totalPrice.toLocaleString()}원
              </dd>
            </div>
          </dl>

          {/* 상태 변경 버튼 */}
          {nextStatuses.length > 0 && (
            <div className="mt-6 pt-4 border-t border-primary/10">
              <button
                onClick={() => setShowStatusModal(true)}
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                상태 변경
              </button>
            </div>
          )}
        </div>

        {/* 고객 & 배송 정보 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            고객 / 배송 정보
          </h2>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/50">주문자</dt>
              <dd className="text-foreground">{order.user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">이메일</dt>
              <dd className="text-foreground">{order.user.email}</dd>
            </div>
            <hr className="border-primary/10" />
            <div className="flex justify-between">
              <dt className="text-foreground/50">받는 분</dt>
              <dd className="text-foreground">{order.shippingName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">연락처</dt>
              <dd className="text-foreground">{order.shippingPhone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/50">배송지</dt>
              <dd className="text-foreground text-right max-w-[200px]">
                {order.shippingAddress}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 주문 상품 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-lg font-bold text-foreground mb-4">주문 상품</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0"
            >
              <div>
                <p className="font-medium text-foreground">
                  {item.productName}
                </p>
                <p className="text-xs text-foreground/50">
                  {item.price.toLocaleString()}원 x {item.quantity}개
                </p>
              </div>
              <p className="font-medium text-foreground">
                {(item.price * item.quantity).toLocaleString()}원
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 pt-3 border-t border-primary/10">
          <span className="font-bold text-foreground">합계</span>
          <span className="font-bold text-primary-dark text-lg">
            {order.totalPrice.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 상태 변경 모달 */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !updating && setShowStatusModal(false)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">
              주문 상태 변경
            </h3>
            <p className="text-sm text-foreground/50 mb-4">
              현재:{" "}
              <span className="font-medium">
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </p>

            <div className="space-y-2">
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updating}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    s === "CANCELLED"
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-primary/10 text-primary-dark hover:bg-primary/20"
                  }`}
                >
                  {updating ? "변경 중..." : ORDER_STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              disabled={updating}
              className="w-full mt-3 py-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </>
  );
}
