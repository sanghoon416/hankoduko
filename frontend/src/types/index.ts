export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ProductCategory =
  | "CROCHET"
  | "KNITTING"
  | "EMBROIDERY"
  | "BEADS"
  | "OTHER";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  CROCHET: "코바늘",
  KNITTING: "뜨개질",
  EMBROIDERY: "자수",
  BEADS: "비즈",
  OTHER: "기타",
};

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "입금 대기",
  PAID: "입금 확인",
  SHIPPING: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "취소",
};

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  thumbnailUrl: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}
