"use client";

import { useState } from "react";
import { createOrder } from "@/lib/api";

interface OrderModalProps {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderModal({
  productId,
  productName,
  price,
  quantity,
  onClose,
  onSuccess,
}: OrderModalProps) {
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const totalPrice = price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createOrder({
        shippingName,
        shippingPhone,
        shippingAddress,
        items: [{ productId, quantity }],
      });
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "주문에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={completed ? onSuccess : onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {completed ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">&#10003;</div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              주문이 완료되었습니다
            </h2>
            <p className="text-foreground/60 text-sm mb-6">
              입금 확인 후 배송이 시작됩니다
            </p>
            <button
              onClick={onSuccess}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-foreground mb-4">주문하기</h2>

            {/* 주문 요약 */}
            <div className="bg-secondary/30 rounded-lg p-4 mb-4">
              <p className="font-medium text-foreground">{productName}</p>
              <p className="text-sm text-foreground/60 mt-1">
                {price.toLocaleString()}원 x {quantity}개
              </p>
              <p className="text-lg font-bold text-primary-dark mt-2">
                총 {totalPrice.toLocaleString()}원
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="shippingName" className="block text-sm font-medium text-foreground mb-1">
                  받는 분
                </label>
                <input
                  id="shippingName"
                  type="text"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="홍길동"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="shippingPhone" className="block text-sm font-medium text-foreground mb-1">
                  연락처
                </label>
                <input
                  id="shippingPhone"
                  type="tel"
                  required
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="010-1234-5678"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="shippingAddress" className="block text-sm font-medium text-foreground mb-1">
                  배송지
                </label>
                <input
                  id="shippingAddress"
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="서울시 강남구..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-primary/20 text-foreground/70 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "주문 중..." : `${totalPrice.toLocaleString()}원 결제하기`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
