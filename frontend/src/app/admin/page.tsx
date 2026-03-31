"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, getAdminOrders } from "@/lib/api";
import type { AdminOrder } from "@/types";
import { ORDER_STATUS_LABELS, STATUS_COLORS } from "@/types";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  shippingOrders: number;
  totalProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [allOrders, pending, shipping, products] = await Promise.all([
          getAdminOrders({ limit: 5 }),
          getAdminOrders({ limit: 1, status: "PENDING" }),
          getAdminOrders({ limit: 1, status: "SHIPPING" }),
          getProducts({ limit: 1 }),
        ]);

        setStats({
          totalOrders: allOrders.total,
          pendingOrders: pending.total,
          shippingOrders: shipping.total,
          totalProducts: products.total,
        });
        setRecentOrders(allOrders.data);
      } catch {
        // 에러 시 기본값 유지
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-center text-foreground/50 py-12">로딩 중...</p>;
  }

  const statCards = [
    {
      label: "전체 주문",
      value: stats.totalOrders,
      color: "bg-blue-50 text-blue-700",
      href: "/admin/orders",
    },
    {
      label: "입금 대기",
      value: stats.pendingOrders,
      color: "bg-yellow-50 text-yellow-700",
      href: "/admin/orders?status=PENDING",
    },
    {
      label: "배송 중",
      value: stats.shippingOrders,
      color: "bg-purple-50 text-purple-700",
      href: "/admin/orders?status=SHIPPING",
    },
    {
      label: "전체 상품",
      value: stats.totalProducts,
      color: "bg-green-50 text-green-700",
      href: "/admin/products",
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-6">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`${card.color} rounded-xl p-5 hover:opacity-80 transition-opacity`}
          >
            <p className="text-sm font-medium opacity-70">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* 최근 주문 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-primary/10">
          <h2 className="text-lg font-bold text-foreground">최근 주문</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-primary-dark hover:underline"
          >
            전체 보기
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-center text-foreground/50 py-8">
            주문이 없습니다
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-foreground/50 border-b border-primary/10">
                  <th className="px-5 py-3 font-medium">주문번호</th>
                  <th className="px-5 py-3 font-medium">주문자</th>
                  <th className="px-5 py-3 font-medium">금액</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                  <th className="px-5 py-3 font-medium">날짜</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-primary/5 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary-dark hover:underline"
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-foreground">
                      {order.user.name}
                    </td>
                    <td className="px-5 py-3 text-foreground">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
