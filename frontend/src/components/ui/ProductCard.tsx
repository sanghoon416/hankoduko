import Link from "next/link";
import type { Product } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-secondary/30 overflow-hidden">
        <img
          src={product.thumbnailUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
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
