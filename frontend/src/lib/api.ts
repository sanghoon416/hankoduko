import type {
  AuthTokens,
  User,
  UserProfile,
  Product,
  PaginatedResponse,
  AdminOrder,
  OrderStatus,
  CreateProductInput,
  UpdateProductInput,
} from "@/types";

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:4000/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

function storeTokens(tokens: AuthTokens) {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  // 인증 토큰 자동 추가
  const tokens = getStoredTokens();
  if (tokens && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  // 401이면 토큰 갱신 시도
  if (response.status === 401 && tokens?.refreshToken) {
    const refreshed = await tryRefreshToken(tokens.refreshToken);
    if (refreshed) {
      headers["Authorization"] = `Bearer ${refreshed.accessToken}`;
      const retryResponse = await fetch(url, { ...options, headers });
      if (!retryResponse.ok) {
        throw new Error(
          `API Error: ${retryResponse.status} ${retryResponse.statusText}`
        );
      }
      return retryResponse.json();
    }
    // refresh 실패 → 토큰 삭제
    clearTokens();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body?.message || `API Error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return response.json();
}

async function tryRefreshToken(
  refreshToken: string
): Promise<AuthTokens | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    if (!res.ok) return null;
    const tokens: AuthTokens = await res.json();
    storeTokens(tokens);
    return tokens;
  } catch {
    return null;
  }
}

// ─── Auth API ─────────────────────────────────

export async function authSignup(data: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "회원가입에 실패했습니다");
  }
  const tokens: AuthTokens = await res.json();
  storeTokens(tokens);
  return tokens;
}

export async function authLogin(data: {
  email: string;
  password: string;
}): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "로그인에 실패했습니다");
  }
  const tokens: AuthTokens = await res.json();
  storeTokens(tokens);
  return tokens;
}

export async function authLogout(): Promise<void> {
  try {
    await fetchApi("/auth/logout", { method: "POST" });
  } catch {
    // 로그아웃 실패해도 로컬 토큰은 삭제
  }
  clearTokens();
}

export async function authGetMe(): Promise<User> {
  return fetchApi<User>("/auth/me");
}

// ─── Profile API ──────────────────────────────

export async function getProfile(): Promise<UserProfile> {
  return fetchApi<UserProfile>("/auth/profile");
}

export async function updateProfile(data: {
  address?: string;
  refundBank?: string;
  refundAccount?: string;
}): Promise<UserProfile> {
  return fetchApi<UserProfile>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return fetchApi<{ message: string }>("/auth/password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ─── Upload API ───────────────────────────────

export async function uploadThumbnail(
  file: File
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE_URL}/products/upload-thumbnail`;
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {};
  if (tokens) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "이미지 업로드에 실패했습니다");
  }
  return res.json();
}

// ─── Products API ─────────────────────────────

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);

  const qs = query.toString();
  return fetchApi<PaginatedResponse<Product>>(
    `/products${qs ? `?${qs}` : ""}`
  );
}

export async function getProduct(id: string) {
  return fetchApi<Product>(`/products/${id}`);
}

// ─── Orders API ──────────────────────────────

export async function createOrder(data: {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  items: { productId: string; quantity: number }[];
}) {
  return fetchApi<import("@/types").Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);

  const qs = query.toString();
  return fetchApi<PaginatedResponse<import("@/types").Order>>(
    `/orders${qs ? `?${qs}` : ""}`
  );
}

// ─── Admin Products API ──────────────────────

export async function createProduct(data: CreateProductInput) {
  return fetchApi<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  return fetchApi<Product>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string) {
  return fetchApi<void>(`/products/${id}`, { method: "DELETE" });
}

export async function uploadProductImage(
  productId: string,
  file: File,
  alt?: string
) {
  const formData = new FormData();
  formData.append("file", file);
  if (alt) formData.append("alt", alt);

  const url = `${API_BASE_URL}/products/${productId}/images`;
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {};
  if (tokens) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "이미지 업로드에 실패했습니다");
  }
  return res.json();
}

export async function deleteProductImage(imageId: string) {
  return fetchApi<void>(`/products/images/${imageId}`, { method: "DELETE" });
}

// ─── Admin Orders API ────────────────────────

export async function getAdminOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);

  const qs = query.toString();
  return fetchApi<PaginatedResponse<AdminOrder>>(
    `/admin/orders${qs ? `?${qs}` : ""}`
  );
}

export async function getAdminOrder(id: string) {
  return fetchApi<AdminOrder>(`/admin/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return fetchApi<AdminOrder>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
