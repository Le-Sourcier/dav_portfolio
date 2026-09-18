FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL=https://server.lesourcier.space/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM build AS verification
RUN npm run lint && npx tsc --noEmit && node --test tests/date.test.mjs

FROM verification AS production-dependencies
RUN npm prune --omit=dev

FROM node:22-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3056 NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app ./
USER node
EXPOSE 3056
CMD ["node", "server.js"]
