# syntax=docker/dockerfile:1.7
# -----------------------------------------------------------------------------
# Multi-stage build for the Next.js single-app deployment.
# Uses Debian slim (not Alpine) — Alpine's OpenSSL often breaks Atlas TLS handshakes
# (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR on Render and similar hosts).
# -----------------------------------------------------------------------------

ARG NODE_VERSION=20

# 1. deps --------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package-lock.json packages/shared/
COPY apps/web/package.json apps/web/

RUN --mount=type=cache,target=/root/.npm \
    npm install --prefix packages/shared --no-audit --no-fund && \
    npm install --prefix apps/web      --no-audit --no-fund && \
    npm install                         --no-audit --no-fund

# 2. build -------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. runtime -----------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "apps/web/server.js"]
