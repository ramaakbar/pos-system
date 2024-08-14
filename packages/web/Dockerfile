FROM imbios/bun-node:20-slim  AS builder
WORKDIR /usr/app

COPY . .

WORKDIR /usr/app/packages/web

RUN bun install --frozen-lockfile
RUN bun run build

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

COPY --from=builder /usr/app/packages/web/out .
COPY --from=builder /usr/app/packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
