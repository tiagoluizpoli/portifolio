# Lightest server-rendering stack for a single Node container

Ticket: #15 (map #14). Researched 2026-11-22 against official docs and the npm registry.

## Recommendation

**Astro (SSR, `@astrojs/node` standalone) is the pick, with a documented fallback to Hono + `hono/jsx`.**

Reasoning, in order of weight (simplicity for one maintainer is the top value):

1. Astro covers every ticket criterion with built-in features: locale routing, JSON endpoints, request-time data loading, per-response cache headers, and zero client JS unless asked. Nothing has to be hand-built.
2. A `.astro` page is HTML plus a frontmatter block. For a one-page site this is the least ceremony of the four options, and CSS-only motion works with no framework.
3. Hono + JSX is the lightest runtime, but i18n routing, sitemap, hreflang and head management are all hand-written. That is more code to own than Astro's config.
4. React Router v7 and plain Vite SSR bring a React runtime and (for Vite) a hand-rolled server. Neither earns its weight for a content page.

Trade-off accepted: Astro's runtime is heavier than Hono's. If the measured idle RAM or image size on the VPS is unacceptable, switch to Hono (see "When to choose Hono instead").

## Comparison

Versions current on npm on 2026-11-22: astro 7.4.13, @astrojs/node 11.1.14, hono 4.13.20, @hono/node-server 2.1.11, react-router 8.5.2, vite 8.3.8.

| Criterion | Astro SSR (node) | Hono + hono/jsx | React Router v7 framework | Plain Vite SSR |
|---|---|---|---|---|
| Server | Built entry `node ./dist/server/entry.mjs`, `HOST`/`PORT` env [1] | `@hono/node-server` `serve()` [5] | `@react-router/serve` (express based) or custom server [8][9] | You write it [7] |
| Runtime deps | Bundled into `dist/` by the build; see note | `hono` + `@hono/node-server` only [5] | `@react-router/serve` pulls express, morgan, compression and more (npm) | Whatever you pick |
| Client JS | Only what you add via `<script>` or `client:*` islands [4] | None unless you add it | React hydrates every route | React hydrates |
| i18n `/pt` `/en` | Built in: `locales`, `defaultLocale`, `prefixDefaultLocale`, fallbacks [2] | Manual routes (`/:lang`) | Manual | Manual |
| hreflang | Not automatic; helpers `getAbsoluteLocaleUrl()` make the tags easy [2] | Manual | Manual (`meta`/`links` exports) | Manual |
| Meta/OG/JSON-LD | Plain HTML in layout `<head>` | `<title>/<meta>/<link>` in components are hoisted to `<head>` [3] | `meta` export per route | Manual |
| Sitemap | Endpoint file or integration | Route handler | Resource route | Route handler |
| JSON endpoint | `src/pages/x.json.ts` exporting `GET` [6] | Native, it is the framework | Resource route | Manual |
| DB read at request time | Page frontmatter runs per request in SSR; live content collections load runtime data [10] | Async components or handler code [3] | Route `loader` | Manual |
| Cache headers | `Astro.response.headers`, page level only [11] | `c.header()` anywhere | `headers` export | Manual |
| Motion | CSS, or a framework island if framer-motion is wanted | CSS, or vanilla script | framer-motion works naturally | framer-motion needs React |
| Maintainer DX | Single config, file routing, one mental model | Smallest API, but you assemble the site | Larger framework, loaders/actions model | Lowest level, "meant for library and framework authors" [7] |

Note on dependency size: a fresh Astro project installs about 175 MB of `node_modules` (measured; includes the build toolchain), but a Docker multi-stage build ships only `dist/` plus whatever the server bundle externalizes. The production dependency footprint was not measured (see "Not verified").

## Per-option notes

### Astro (node adapter)
- Standalone mode "builds a server that automatically starts when the entry module is run" and also serves static assets, so one process handles pages, assets and the stats endpoint [1].
- TLS is off by default, which suits running behind Dokploy's proxy [1].
- Adapter docs give no Docker guide, only a basic Dockerfile example; they state no minimum Node version [1].
- Pages are prerendered by default. Use `output: 'server'`, or `prerender = false` per page, to render on demand [11].
- Env vars are not loaded for you; use container env (Dokploy supplies them) [1].
- i18n: with `prefixDefaultLocale: true` both `/pt` and `/en` carry a prefix, and `redirectToDefaultLocale` sends `/` to the default [2]. Browser language helpers exist (`Astro.preferredLocale`) [2]. Astro's i18n docs do not cover hreflang tags, so emit them in the layout.
- Cache headers can only be set at page level, not in components [11]. Fine for one page.
- Live content collections (`defineLiveCollection()`, added in Astro 6) load data at request time and are not marked experimental [10]. Plain frontmatter queries also work and are simpler.

### Hono + hono/jsx
- Needs only `hono` and `@hono/node-server`; Node 18.14.1+/19.7.0+/20+ [5]. Measured: a minimal app installs about 4 MB of `node_modules`, versus 175 MB for a fresh Astro project.
- JSX SSR: set `jsxImportSource: "hono/jsx"`; async components are awaited by `c.html()`; streaming `Suspense` is marked experimental [3].
- Head hoisting works but appends to existing head tags, so a duplicate `<title>` is possible if the shell also sets one [3].
- `serve()` does not handle graceful shutdown for you [5]. `serveStatic` root resolves from `process.cwd()` [5].
- Everything site-shaped is yours to write: locale routing, hreflang, sitemap, asset hashing and CSS pipeline. Roughly 100 to 200 lines for this site (estimate), but it is code to maintain.

### React Router v7 framework mode
- The official Docker route is a template (`default`, `node-custom-server`, `node-postgres`) [9]. The deploy docs do not describe `@react-router/serve` or a minimum Node version [8][9].
- `@react-router/serve` depends on express 5, morgan, compression and others (npm metadata). Full React hydration on every page is more JS than a content page needs.
- Pre-rendering exists, but content must go live without a rebuild, so it must run in SSR mode [8].
- Best option only if the page grows into an app or framer-motion is central.

### Plain Vite SSR
- Vite's own guide calls the API "low-level ... meant for library and framework authors" and says an Environment API based rewrite is in progress [7].
- You build the server, template injection, manifest-driven preloads and prod branching yourself [7]. Worst fit for "simplicity for a single maintainer".

## When to choose Hono instead
Switch if, on the VPS, Astro's idle RSS or image size is a real problem, or if the preferred stack is "one small TS file plus JSX components". The v2 data model (JSON in Postgres) is stack-agnostic, so the decision is cheap to reverse early.

## Not verified (honest gaps)
- **Idle RAM and image size for Astro, React Router and Vite**: no vendor publishes these. I measured a minimal Hono app only (about 65 MB RSS on Node 22.12 after 10 requests, mostly the Node baseline). My Astro build attempt crashed with `Illegal instruction` in this sandbox, so no Astro runtime number exists. First task for the build: measure the real Astro container (RSS and `docker image ls`) against the Hono numbers and pick on data.
- The fetched Astro doc pages do not name their major version, so I did not confirm whether Astro 7 changed anything in the cited i18n and adapter docs.
- DB caching strategy (in-process TTL cache versus none) is outside this ticket; Astro and Hono both allow a plain in-memory cache in module scope.

## Sources
1. Astro Node adapter: https://docs.astro.build/en/guides/integrations-guide/node/
2. Astro i18n routing: https://docs.astro.build/en/guides/internationalization/
3. Hono JSX: https://hono.dev/docs/guides/jsx
4. Astro client-side scripts: https://docs.astro.build/en/guides/client-side-scripts/
5. Hono on Node.js: https://hono.dev/docs/getting-started/nodejs
6. Astro endpoints: https://docs.astro.build/en/guides/endpoints/
7. Vite SSR guide: https://vite.dev/guide/ssr
8. React Router rendering strategies: https://reactrouter.com/start/framework/rendering
9. React Router deploying: https://reactrouter.com/start/framework/deploying
10. Astro content loader reference (live collections): https://docs.astro.build/en/reference/modules/astro-content/
11. Astro on-demand rendering: https://docs.astro.build/en/guides/server-side-rendering/
- npm registry metadata (`npm view`) for versions and `@react-router/serve` dependencies, 2026-11-22.
