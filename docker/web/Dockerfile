FROM node:20-bookworm-slim AS base

WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/web/package.json packages/web/package.json

RUN pnpm install --frozen-lockfile

FROM base AS preview-builder

COPY LICENSE CODE_OF_CONDUCT.md SECURITY.md ./
COPY blueprints blueprints
COPY packages/shared packages/shared
COPY packages/web packages/web

RUN pnpm --filter @char-gen/shared build
RUN pnpm --filter @char-gen/web build

FROM node:20-bookworm-slim AS preview

WORKDIR /app

RUN corepack enable pnpm

COPY --from=preview-builder /app/node_modules ./node_modules
COPY --from=preview-builder /app/packages/shared ./packages/shared
COPY --from=preview-builder /app/packages/web ./packages/web
COPY --from=preview-builder /app/package.json ./package.json
COPY --from=preview-builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

EXPOSE 3000

CMD ["pnpm", "--dir", "packages/web", "exec", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]

FROM base AS dev

COPY docker/web/start-web-dev.sh /usr/local/bin/start-web-dev.sh

RUN chmod +x /usr/local/bin/start-web-dev.sh

EXPOSE 3100

CMD ["/usr/local/bin/start-web-dev.sh"]