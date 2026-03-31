import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import { CATEGORY_LABELS } from "@/types";
import type { Product } from "@/types";
import ProductDetailClient from "./ProductDetailClient";
import FallbackImage from "@/components/ui/FallbackImage";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await getProduct(id);
    const description = product.description.slice(0, 160);

    return {
      title: `${product.name} - 한코두코`,
      description,
      openGraph: {
        title: `${product.name} - 한코두코`,
        description,
        images: product.thumbnailUrl ? [product.thumbnailUrl] : [],
      },
    };
  } catch {
    return {
      title: "상품을 찾을 수 없습니다 - 한코두코",
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  let product: Product;
  try {
    product = await getProduct(id);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* 이미지 */}
        <div>
          <div className="aspect-square bg-secondary/30 rounded-xl overflow-hidden">
            <FallbackImage
              src={product.thumbnailUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square bg-secondary/30 rounded-lg overflow-hidden"
                >
                  <FallbackImage
                    src={image.url}
                    alt={image.alt || product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 + 주문 UI */}
        <div>
          <span className="text-sm text-primary-dark font-medium bg-primary/10 px-3 py-1 rounded-full">
            {CATEGORY_LABELS[product.category]}
          </span>

          <h1 className="mt-4 text-3xl font-bold text-foreground">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-primary-dark">
            {product.price.toLocaleString()}원
          </p>

          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                재고 {product.stock}개
              </span>
            ) : (
              <span className="text-sm text-red-700 bg-red-100 px-3 py-1 rounded-full">
                품절
              </span>
            )}
          </div>

          <hr className="my-6 border-primary/20" />

          {/* 주문 섹션 (클라이언트 컴포넌트) */}
          <ProductDetailClient product={product} />

          <hr className="my-6 border-primary/20" />

          <div className="text-foreground/80">
            <h3 className="text-lg font-medium text-foreground mb-2">
              상품 설명
            </h3>
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
