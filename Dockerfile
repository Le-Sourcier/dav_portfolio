FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_URL=https://server.lesourcier.space/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run lint && npm run typecheck && npm run build && node --test tests/api-client.test.mjs

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3051
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/tests ./tests
EXPOSE 3051
CMD ["node", "server.js"]
