FROM --platform=$BUILDPLATFORM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable

ENV NODE_OPTIONS=--max-old-space-size=4096

# Only ever set on the managed/enterprise build -- self-hosted OSS builds leave these
# unset, so env.ts's billing checks stay false and the settings billing link never renders.
ARG VITE_FEATURE_ENABLE_BILLING=""
ARG VITE_BILLING_URL=""
ENV VITE_FEATURE_ENABLE_BILLING=$VITE_FEATURE_ENABLE_BILLING
ENV VITE_BILLING_URL=$VITE_BILLING_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
