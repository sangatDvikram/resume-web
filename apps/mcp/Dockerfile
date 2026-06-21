# syntax=docker/dockerfile:1.7
# Portfolio CMS — apps/mcp (MCP server) container image
# Used by Railway (apps/mcp/railway.toml) and Fly.io (apps/mcp/fly.toml).
# Build context: repo root (Railway Root Directory = /; for Fly.io run
# `flyctl deploy --config apps/mcp/fly.toml` from the repo root).
ARG NODE_VERSION=22-alpine

# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY apps/mcp/package.json ./
RUN npm install

COPY apps/mcp/src ./src
COPY apps/mcp/tsconfig.json ./
RUN npm run build

# ─── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime

RUN apk add --no-cache tini wget

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

COPY apps/mcp/package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO /dev/null http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
