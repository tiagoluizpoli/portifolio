# Portfolio v2

Astro SSR (Node standalone) landing page, EN at `/` and PT at `/pt/`, content from Postgres. Spec: #30.

## Run locally

Requires Node 24 (`mise exec node@24 -- …`), pnpm and Docker.

```sh
pnpm install
docker run -d --name portfolio-local-pg -e POSTGRES_PASSWORD=portfolio -e POSTGRES_DB=portfolio \
  -p 127.0.0.1:54320:5432 postgres:17-alpine
export DATABASE_URL=postgres://postgres:portfolio@127.0.0.1:54320/portfolio
node scripts/seed-dev-content.mjs   # applies migrations, then writes every Section row
pnpm dev                            # boot fails without valid content in every Section
```

Optional env: `GITHUB_TOKEN` (stats sentence), `ADMIN_ENABLED=true` (`/admin`), `ASSET_BASE_URL`, `REVALIDATE_TOKEN`.

## Dev notes

shortcut: Astro 6 because the dev host CPU lacks AVX2 (Astro 7 compiler-rs SIGILLs); upgrade when the dev host changes.

## Analytics (Umami, cookieless)

Set `UMAMI_WEBSITE_ID` and `UMAMI_SCRIPT_URL` at runtime to enable the tracker; unset = no script. Events: `cv-download`, `whatsapp-click` (with `locale`).
