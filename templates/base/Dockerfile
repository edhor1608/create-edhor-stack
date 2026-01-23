# syntax=docker/dockerfile:1

# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build the web app
RUN bun run build --filter=web

# Production stage
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/apps/web/.output ./.output

# Run the server
EXPOSE 3000
CMD ["bun", "run", ".output/server/index.mjs"]
