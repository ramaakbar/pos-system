FROM oven/bun:alpine AS deps
WORKDIR /usr/app
COPY packages/api/package.json  ./
RUN bun install --frozen-lockfile

FROM deps AS builder
WORKDIR /usr/app
COPY packages/api/ .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /usr/app

COPY --from=builder /usr/app/server ./

EXPOSE 3001

CMD ["./server"]