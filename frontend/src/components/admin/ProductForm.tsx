"use client";

import { useState } from "react";
import type { CreateProductInput, ProductCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { uploadThumbnail } from "@/lib/api";

interface ProductFormProps {
  initialData?: CreateProductInput;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  submitLabel: string;
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [
  ProductCategory,
  string,
][];

export default function ProductForm({
  initialData,
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnailUrl || ""
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [priceText, setPriceText] = useState(
    initialData?.price != null ? String(initialData.price) : ""
  );
  const [stockText, setStockText] = useState(
    initialData?.stock != null ? String(initialData.stock) : ""
  );
  const [category, setCategory] = useState<ProductCategory>(
    initialData?.category || "CROCHET"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const { url } = await uploadThumbnail(file);
      setThumbnailUrl(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "이미지 업로드에 실패했습니다"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        name,
        thumbnailUrl,
        description,
        price: Number(priceText) || 0,
        stock: Number(stockText) || 0,
        category,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-foreground mb-1"
        >
          상품명
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="상품명을 입력하세요"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-foreground mb-1"
        >
          카테고리
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
        >
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-foreground mb-1"
          >
            가격 (원)
          </label>
          <input
            id="price"
            type="text"
            inputMode="numeric"
            required
            value={priceText}
            onChange={(e) =>
              setPriceText(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-foreground mb-1"
          >
            재고
          </label>
          <input
            id="stock"
            type="text"
            inputMode="numeric"
            required
            value={stockText}
            onChange={(e) =>
              setStockText(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          대표 이미지
        </label>

        {thumbnailUrl ? (
          <div className="relative inline-block">
            <img
              src={thumbnailUrl}
              alt="미리보기"
              className="w-32 h-32 object-cover rounded-lg border border-primary/10"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect fill='%23eee' width='128' height='128'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23aaa' font-size='14'%3E?%3C/text%3E%3C/svg%3E";
              }}
            />
            <button
              type="button"
              onClick={() => setThumbnailUrl("")}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              &times;
            </button>
          </div>
        ) : (
          <>
            <label className="inline-flex items-center gap-2 px-4 py-3 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <span className="text-sm font-medium text-primary-dark">
                {uploading ? "업로드 중..." : "파일 선택"}
              </span>
              <span className="text-xs text-foreground/40">
                jpeg, png, webp, gif (5MB 이하)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-foreground mb-1"
        >
          상품 설명
        </label>
        <textarea
          id="description"
          required
          minLength={10}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          placeholder="상품 설명을 입력하세요 (10자 이상)"
        />
      </div>

      <button
        type="submit"
        disabled={loading || uploading || !thumbnailUrl}
        className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
      >
        {loading ? "저장 중..." : submitLabel}
      </button>
    </form>
  );
}
