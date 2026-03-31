"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import OrderModal from "@/components/ui/OrderModal";
import type { Product } from "@/types";

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const isSoldOut = product.stock <= 0;

  const handleOrder = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      {/* 수량 선택 */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm font-medium text-foreground">수량</span>
        <div className="flex items-center border border-primary/20 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-foreground/60 hover:text-foreground transition-colors"
            disabled={isSoldOut}
          >
            -
          </button>
          <span className="px-4 py-2 text-foreground font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-3 py-2 text-foreground/60 hover:text-foreground transition-colors"
            disabled={isSoldOut}
          >
            +
          </button>
        </div>
        <span className="text-sm text-foreground/50">
          합계 {(product.price * quantity).toLocaleString()}원
        </span>
      </div>

      {/* 주문 버튼 */}
      <button
        onClick={handleOrder}
        disabled={isSoldOut}
        className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSoldOut ? "품절" : "주문하기"}
      </button>

      {/* 주문 모달 */}
      {showModal && (
        <OrderModal
          productId={product.id}
          productName={product.name}
          price={product.price}
          quantity={quantity}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            router.push("/orders");
          }}
        />
      )}
    </>
  );
}
