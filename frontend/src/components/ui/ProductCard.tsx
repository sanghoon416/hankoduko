import Link from "next/link";
import type { Product } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import FallbackImage from "./FallbackImage";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-secondary/30 overflow-hidden">
        <FallbackImage
          src={product.thumbnailUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-black/50 px-4 py-1.5 rounded-full">
              품절
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs text-primary-dark font-medium bg-primary/10 px-2 py-1 rounded-full">
          {CATEGORY_LABELS[product.category]}
        </span>
        <h3 className="mt-2 font-medium text-foreground line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-1 text-lg font-bold text-primary-dark">
          {product.price.toLocaleString()}원
        </p>
      </div>
    </Link>
  );
}
