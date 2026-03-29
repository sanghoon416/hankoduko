-- Users
ALTER TABLE "users" RENAME COLUMN "refundBank" TO "refund_bank";
ALTER TABLE "users" RENAME COLUMN "refundAccount" TO "refund_account";
ALTER TABLE "users" RENAME COLUMN "refreshToken" TO "refresh_token";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

-- Products
ALTER TABLE "products" RENAME COLUMN "thumbnailUrl" TO "thumbnail_url";
ALTER TABLE "products" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "products" RENAME COLUMN "updatedAt" TO "updated_at";

-- Product Images
ALTER TABLE "product_images" RENAME COLUMN "productId" TO "product_id";
ALTER TABLE "product_images" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "product_images" RENAME COLUMN "updatedAt" TO "updated_at";

-- Orders
ALTER TABLE "orders" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "orders" RENAME COLUMN "totalPrice" TO "total_price";
ALTER TABLE "orders" RENAME COLUMN "shippingName" TO "shipping_name";
ALTER TABLE "orders" RENAME COLUMN "shippingPhone" TO "shipping_phone";
ALTER TABLE "orders" RENAME COLUMN "shippingAddress" TO "shipping_address";
ALTER TABLE "orders" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "orders" RENAME COLUMN "updatedAt" TO "updated_at";

-- Order Items
ALTER TABLE "order_items" RENAME COLUMN "orderId" TO "order_id";
ALTER TABLE "order_items" RENAME COLUMN "productId" TO "product_id";
ALTER TABLE "order_items" RENAME COLUMN "productName" TO "product_name";
ALTER TABLE "order_items" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "order_items" RENAME COLUMN "updatedAt" TO "updated_at";
