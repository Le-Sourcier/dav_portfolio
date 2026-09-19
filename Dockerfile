FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM build AS verification
COPY .eslintrc.cjs ./
COPY tests ./tests
COPY scripts ./scripts
RUN npm run lint && npm run typecheck && node --test tests/security-dependencies.test.mjs tests/proxy.test.mjs tests/settings-seed.test.mjs tests/backup-notification.test.mjs tests/backup-workflow.test.mjs

FROM verification AS production-dependencies
RUN npm prune --omit=dev

FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=3052
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/package*.json ./
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /app/dist ./dist
COPY --chown=node:node tests ./tests
RUN mkdir logs && chown node:node logs
USER node
EXPOSE 3052
CMD ["node", "dist/server.js"]
