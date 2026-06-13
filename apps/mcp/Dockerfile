# syntax=docker/dockerfile:1.7
# ──────────────────────────────────────────────────────────────────────────────
# Portfolio CMS — apps/mcp (MCP server) container image
# Used by Railway (apps/mcp/railway.toml).
# Multi-stage build:
#   builder  — installs full workspace + builds the MCP server
#   runtime  — minimal Node 22 Alpine image running `node dist/index.js`
#
# Transport mode is selected at runtime:
#   PORT set  → Streamable HTTP on /mcp  (Railway / remote clients)
#   PORT unset → stdio                   (local / Claude Desktop via docker run -i)
# ──────────────────────────────────────────────────────────────────────────────
ARG NODE_VERSION=22-alpine

# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder

RUN corepack enable

WORKDIR /app

# Copy workspace manifests first for a cacheable yarn install layer.
# Yarn Berry validates every workspace declared in the root package.json,
# so all sibling package.json stubs must be present even if not built here.
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/mcp/package.json apps/mcp/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY packages/oat-ui/package.json packages/oat-ui/
COPY packages/eslint-config/package.json packages/eslint-config/

# Full install (devDependencies needed to compile TypeScript).
RUN yarn install --immutable

# Copy only the MCP source — other workspaces are not needed.
COPY apps/mcp apps/mcp

RUN yarn workspace @portfolio-cms/mcp build

# ─── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime

# tini = clean PID 1 / signal forwarding.
# wget = used by the HEALTHCHECK instruction below.
RUN apk add --no-cache tini wget

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Carry across the root hoisted node_modules and the workspace-local
# node_modules (Yarn did not hoist @modelcontextprotocol/sdk to the root).
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/mcp/package.json ./apps/mcp/package.json
COPY --from=builder /app/apps/mcp/node_modules ./apps/mcp/node_modules
COPY --from=builder /app/apps/mcp/dist ./apps/mcp/dist

WORKDIR /app/apps/mcp

EXPOSE 3000

# Shell-form HEALTHCHECK so ${PORT} is expanded by /bin/sh.
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO /dev/null http://localhost:${PORT}/health || exit 1

# tini handles SIGTERM cleanly so containers stop/restart fast.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
