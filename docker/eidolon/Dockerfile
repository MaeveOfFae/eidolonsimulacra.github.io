# Build stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json packages/server/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY packages/server packages/server

RUN pnpm --filter @char-gen/shared build
RUN pnpm --filter @char-gen/server db:generate
RUN pnpm --filter @char-gen/server build

# Runtime stage: PostgreSQL and the API live in the same container.
FROM postgres:16-bookworm

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl tini \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/bin/node /usr/local/bin/node

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/server ./packages/server
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY docker/eidolon/start-eidolon.sh /usr/local/bin/start-eidolon.sh

RUN chmod +x /usr/local/bin/start-eidolon.sh

EXPOSE 3001 5432

ENTRYPOINT ["tini", "--", "/usr/local/bin/start-eidolon.sh"]