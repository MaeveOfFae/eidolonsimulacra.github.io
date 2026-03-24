# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Copy workspace manifests first for better cache reuse.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json packages/server/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy package sources
COPY packages/shared packages/shared
COPY packages/server packages/server

# Build shared first, then generate Prisma client and build server.
RUN pnpm --filter @char-gen/shared build
RUN pnpm --filter @char-gen/server db:generate
RUN pnpm --filter @char-gen/server build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Copy runtime assets from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/server ./packages/server
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Expose port
EXPOSE 3001

# Ensure schema is present, then start server.
CMD ["sh", "-c", "cd /app/packages/server && npx prisma db push && node dist/index.js"]
