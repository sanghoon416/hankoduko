/*
  Warnings:

  - You are about to drop the column `bankTransferInfo` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `product_images` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailUrl` to the `products` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "bankTransferInfo",
DROP COLUMN "totalAmount",
ADD COLUMN     "totalPrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "product_images" DROP COLUMN "sortOrder";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "thumbnailUrl" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "phone",
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refundAccount" TEXT,
ADD COLUMN     "refundBank" TEXT;
