"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from "@/lib/api";
import type { Product, CreateProductInput, ProductImage } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: CreateProductInput) => {
    await updateProduct(id, data);
    router.push("/admin/products");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError("");
    setUploading(true);
    try {
      await uploadProductImage(id, file);
      const updated = await getProduct(id);
      setProduct(updated);
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "업로드에 실패했습니다"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleImageDelete = async (image: ProductImage) => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;
    try {
      await deleteProductImage(image.id);
      const updated = await getProduct(id);
      setProduct(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  };

  if (loading) {
    return <p className="text-center text-foreground/50 py-12">로딩 중...</p>;
  }

  if (!product) {
    return (
      <p className="text-center text-foreground/50 py-12">
        상품을 찾을 수 없습니다
      </p>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="text-foreground/40 hover:text-foreground transition-colors"
        >
          &larr;
        </Link>
        <h1 className="text-2xl font-bold text-foreground">상품 수정</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상품 정보 폼 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">상품 정보</h2>
          <ProductForm
            initialData={{
              name: product.name,
              thumbnailUrl: product.thumbnailUrl,
              description: product.description,
              price: product.price,
              stock: product.stock,
              category: product.category,
            }}
            onSubmit={handleSubmit}
            submitLabel="수정하기"
          />
        </div>

        {/* 이미지 관리 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            상품 이미지
          </h2>

          {imageError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {imageError}
            </div>
          )}

          {/* 업로드 */}
          <label className="block mb-4">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary-dark rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/20 transition-colors">
              {uploading ? "업로드 중..." : "이미지 추가"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* 이미지 목록 */}
          {product.images.length === 0 ? (
            <p className="text-sm text-foreground/50">
              등록된 이미지가 없습니다
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {product.images.map((image) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden border border-primary/10"
                >
                  <img
                    src={image.url}
                    alt={image.alt || product.name}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23eee' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23aaa' font-size='14'%3E?%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <button
                    onClick={() => handleImageDelete(image)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
