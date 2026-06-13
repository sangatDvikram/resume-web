# syntax=docker/dockerfile:1.7
# ──────────────────────────────────────────────────────────────────────────────
# Portfolio CMS — apps/api (NestJS) container image
# Used by Fly.io (and locally for parity). Multi-stage build:
#   builder  — installs full workspace + builds @portfolio-cms/types and api
#   runtime  — minimal Node 20 Alpine image running `node dist/main.js`
# ──────────────────────────────────────────────────────────────────────────────
ARG NODE_VERSION=20-alpine

# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder

# Build tooling for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++ libc6-compat
RUN corepack enable

WORKDIR /app

# Copy every workspace manifest first so `yarn install` is cacheable across
# source-only edits.
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY packages/oat-ui/package.json packages/oat-ui/
COPY packages/eslint-config/package.json packages/eslint-config/

# Full install (devDependencies needed to compile TypeScript).
RUN yarn install --immutable

# Source for the API and the shared package it consumes (@portfolio-cms/types).
COPY tsconfig*.json ./
COPY packages packages
COPY apps/api apps/api

# Build shared types, then the API.
RUN yarn workspace @portfolio-cms/types build \
 && yarn workspace api build

# ─── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime

# tini = clean PID 1 / signal forwarding; libc6-compat = native modules.
RUN apk add --no-cache libc6-compat tini

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001 \
    SWAGGER_ENABLED=false

# Workspace symlinks under node_modules/@portfolio-cms/* point into ./packages,
# so we must carry both trees across stages. WORKDIR is identical (/app) in
# both stages, which keeps any absolute-path resolution consistent.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/public ./apps/api/public

WORKDIR /app/apps/api

EXPOSE 3001

# tini handles SIGTERM cleanly so Fly machines stop/restart fast.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
