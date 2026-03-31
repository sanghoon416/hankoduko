"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMyOrders } from "@/lib/api";
import type { Order, PaginatedResponse } from "@/types";
import { ORDER_STATUS_LABELS, STATUS_COLORS } from "@/types";

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    getMyOrders({ limit: 50 })
      .then((res: PaginatedResponse<Order>) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-foreground/50 py-12">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">내 주문</h1>

      {orders.length === 0 ? (
        <p className="text-center text-foreground/50 py-12">
          주문 내역이 없습니다
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-foreground/50">
                    {new Date(order.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-foreground/40 mt-1">
                    주문번호: {order.id.slice(0, 8)}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-foreground">
                      {item.productName} x {item.quantity}
                    </span>
                    <span className="text-foreground/70">
                      {(item.price * item.quantity).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>

              <hr className="my-3 border-primary/10" />

              <div className="flex justify-between">
                <span className="font-medium text-foreground">합계</span>
                <span className="font-bold text-primary-dark">
                  {order.totalPrice.toLocaleString()}원
                </span>
              </div>

              <div className="mt-3 text-xs text-foreground/50">
                <p>받는 분: {order.shippingName}</p>
                <p>배송지: {order.shippingAddress}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
