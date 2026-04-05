#!/bin/sh
set -e

mkdir -p /app/uploads/products

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec node dist/src/main
