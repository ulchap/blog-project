# 1) Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2) Production stage
FROM node:20-alpine
WORKDIR /app

# Копируем package.json + production зависимости
COPY package*.json ./
RUN npm ci --omit=dev

# Копируем собранные артефакты из builder
COPY --from=builder /app/dist ./dist

# Если нужны миграции или публичная папка
# COPY --from=builder /app/migrations ./migrations

ENV NODE_ENV=production
EXPOSE 1313
CMD ["node", "dist/main.js"]
