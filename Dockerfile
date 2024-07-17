# https://dev.to/imamdev_/complete-guide-to-deploying-nextjs-standalone-with-bun-and-docker-1fc9

FROM imbios/bun-node:18-slim AS deps

RUN apt-get -y update && \
  apt-get install -yq openssl git ca-certificates tzdata && \
  ln -fs /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && \
  dpkg-reconfigure -f noninteractive tzdata
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build the app
FROM deps AS builder
WORKDIR /app
COPY . .

RUN bun run build

# Production image, copy all the files and run next
FROM imbios/bun-node:18-slim AS runner
WORKDIR /app

# ARG CONFIG_FILE
# COPY $CONFIG_FILE /app/.env
# ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
ENV PORT 3001

CMD ["bun", "server.js"]