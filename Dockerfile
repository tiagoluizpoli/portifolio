FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
COPY --from=build /app/dist ./dist
# Migrations run at boot (src/lib/content/db.ts resolves this folder from the cwd).
COPY --from=build /app/drizzle ./drizzle
USER node
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
