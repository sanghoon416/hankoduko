"use client";

import { useState } from "react";
import type { CreateProductInput, ProductCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

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
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [stock, setStock] = useState(initialData?.stock ?? 0);
  const [category, setCategory] = useState<ProductCategory>(
    initialData?.category || "CROCHET"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        name,
        thumbnailUrl,
        description,
        price,
        stock,
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
            type="number"
            required
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
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
            type="number"
            required
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="thumbnailUrl"
          className="block text-sm font-medium text-foreground mb-1"
        >
          대표 이미지 URL
        </label>
        <input
          id="thumbnailUrl"
          type="text"
          required
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="/uploads/products/example.jpg"
        />
        {thumbnailUrl && (
          <div className="mt-2">
            <img
              src={thumbnailUrl}
              alt="미리보기"
              className="w-24 h-24 object-cover rounded-lg border border-primary/10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
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
        disabled={loading}
        className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
      >
        {loading ? "저장 중..." : submitLabel}
      </button>
    </form>
  );
}
