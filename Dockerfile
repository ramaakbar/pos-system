FROM imbios/bun-node:18-slim  AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
ENV PORT 3001

CMD ["bun", "server.js"]