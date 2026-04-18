FROM node:24-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate

FROM base AS deps

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/appwrite-migrator/package.json apps/appwrite-migrator/package.json
COPY packages/appwrite/package.json packages/appwrite/package.json
COPY packages/config/package.json packages/config/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter appwrite-migrator...

FROM deps AS build

COPY apps/appwrite-migrator apps/appwrite-migrator
COPY packages/appwrite packages/appwrite
COPY packages/config packages/config

RUN pnpm --filter appwrite-migrator build
RUN pnpm --filter appwrite-migrator --prod deploy --legacy /opt/app

FROM node:24-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN apk upgrade --no-cache
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/node_modules ./node_modules

RUN printf '{"name":"appwrite-migrator-runtime","private":true,"type":"module"}\n' > package.json

USER node

CMD ["node", "dist/index.js"]