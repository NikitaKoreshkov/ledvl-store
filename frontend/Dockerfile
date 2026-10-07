# Dockerfile для Frontend (Next.js)

FROM node:20-alpine AS base

# Устанавливаем зависимости только для установки
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Собираем приложение
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Переменные окружения для сборки
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем только необходимые файлы из standalone сборки
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Next.js standalone создает server.js в корне
CMD ["node", "server.js"]

