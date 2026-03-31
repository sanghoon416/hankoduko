"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProduct } from "@/lib/api";
import type { CreateProductInput } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProductNewPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateProductInput) => {
    await createProduct(data);
    router.push("/admin/products");
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="text-foreground/40 hover:text-foreground transition-colors"
        >
          &larr;
        </Link>
        <h1 className="text-2xl font-bold text-foreground">상품 등록</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <ProductForm onSubmit={handleSubmit} submitLabel="등록하기" />
      </div>
    </>
  );
}
