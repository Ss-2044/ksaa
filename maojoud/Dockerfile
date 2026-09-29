FROM node:22-slim

# Prisma يحتاج OpenSSL
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npx next build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# عند كل تشغيل: تحديث مخطط قاعدة البيانات، إنشاء الأقسام وحساب المسؤول إن لم توجد، ثم تشغيل الموقع
CMD ["sh", "scripts/start.sh"]
