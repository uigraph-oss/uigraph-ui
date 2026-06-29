# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable

# Build-time env vars baked into the JS bundle by Vite. VITE_API_URL and
# VITE_GRAPHQL_URL are resolved at runtime from window.location.origin (see
# src/env.ts), so only VITE_ASSETS_URL must be baked in here.
ARG VITE_ASSETS_URL
ARG VITE_DEPLOY_ENV=production
ARG VITE_FEATURE_ENABLE_DEMO_TEST_CASES=false
ENV VITE_ASSETS_URL=$VITE_ASSETS_URL \
    VITE_DEPLOY_ENV=$VITE_DEPLOY_ENV \
    VITE_FEATURE_ENABLE_DEMO_TEST_CASES=$VITE_FEATURE_ENABLE_DEMO_TEST_CASES \
    NODE_OPTIONS=--max-old-space-size=4096

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
