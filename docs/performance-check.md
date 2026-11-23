# Performance check (before each Release)

Budget (mobile): Lighthouse ≥95 in Performance, Accessibility, Best Practices, SEO for `/` and `/pt/`; LCP < 2.5 s; CLS < 0.1; client JS ≤ ~30 KB gzipped. Manual, no CI gate. Run on Development, or locally as below.

## Local run (throwaway Postgres + production build)

```sh
docker run -d --name perfpg -e POSTGRES_PASSWORD=pw -e POSTGRES_DB=perf -p 54545:5432 postgres:17-alpine
export DATABASE_URL=postgres://postgres:pw@localhost:54545/perf
mise exec node@24 -- pnpm build
# first boot runs the migration, then exits (no content rows yet); expected
PORT=4545 HOST=127.0.0.1 mise exec node@24 -- node dist/server/entry.mjs || true
mise exec node@24 -- node scripts/seed-dev-content.mjs
PORT=4545 HOST=127.0.0.1 mise exec node@24 -- node dist/server/entry.mjs &
```

## Client JS (gzipped)

Scripts are inlined into the HTML (no `/_astro/*.js`), so measure the inline `<script>` bodies, ld+json excluded:

```sh
for p in / /pt/; do curl -s localhost:4545$p | python3 -I -c "
import re,sys,gzip
s=re.findall(r'<script(?![^>]*ld\+json)[^>]*>(.*?)</script>',sys.stdin.read(),re.S)
print('$p',len(s),'scripts, gzip bytes',sum(len(gzip.compress(x.encode(),9)) for x in s))"; done
```

If a build ever emits external bundles, also add `gzip -c dist/client/_astro/*.js | wc -c`.

## Lighthouse mobile (default preset)

Any Chrome works; Playwright's is at `~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome`.

```sh
export CHROME_PATH=/path/to/chrome
for p in / /pt/; do
  npx -y lighthouse http://127.0.0.1:4545$p --chrome-flags="--headless=new --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=lh$(echo $p | tr / _).json
done
```

Read `categories.*.score`, `audits['largest-contentful-paint']`, `audits['cumulative-layout-shift']`. On Development use the public URL instead of 127.0.0.1 (real compression and TLS).

Clean up: `docker rm -f perfpg` and stop the node process.

## Last result (local, 2026-11-23)

| | `/` | `/pt/` |
|---|---|---|
| Performance / A11y / Best Practices / SEO | 99 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| LCP / CLS / TBT | 2.3 s / 0 / 10 ms | 2.3 s / 0 / 0 ms |
| Client JS gzipped | 1.3 KB (header + hero interaction, inline) | 1.3 KB |

LCP is the hero image under simulated slow-4G; margin to 2.5 s is thin, so re-check on Development. No analytics script exists yet; add its size when it lands.
