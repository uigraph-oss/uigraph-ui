FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable

ARG VITE_DEPLOY_ENV=production
ARG VITE_FEATURE_ENABLE_DEMO_TEST_CASES=false
ENV VITE_DEPLOY_ENV=$VITE_DEPLOY_ENV \
    VITE_FEATURE_ENABLE_DEMO_TEST_CASES=$VITE_FEATURE_ENABLE_DEMO_TEST_CASES \
    NODE_OPTIONS=--max-old-space-size=4096

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
