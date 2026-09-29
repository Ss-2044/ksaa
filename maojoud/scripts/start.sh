#!/bin/sh
set -e
mkdir -p "${UPLOAD_DIR:-storage/uploads}"
npx prisma db push --skip-generate
node --import tsx prisma/seed.ts
exec npx next start -p "${PORT:-3000}"
