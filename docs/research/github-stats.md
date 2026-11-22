# GitHub stats: what to show and how to serve them live

Ticket: #17 (map: #14). No secrets in this file.

## 1. What v1 `github-stats` does

Source: `tiagoluizpoli/github-stats` (`src/github-service.ts`, `src/index.ts`, `src/config.ts`, `docker-compose.yml`).

- Tiny Express service, `GET /?username=<login>` returns `{ totalCommits, totalRepositories }`.
- `totalRepositories`: pages through REST `GET /user/repos?per_page=100` (follows `Link: rel="next"`). That endpoint lists repos of the **token's owner**, including private and org repos the token can see. The `username` query param is ignored for this step.
- `totalCommits`: for **every** repo, pages through `GET /repos/{owner}/{repo}/commits?author=<username>&per_page=100` and sums `data.length`. Cost: 1 request per repo plus 1 per extra 100 commits. With N repos that is at least N REST calls on every request, run sequentially. No caching, no concurrency.
- Auth: a single `GITHUB_TOKEN` env var (`Authorization: Bearer`), validated only as a 20+ char string, so the token type and scopes are unknown from the repo.
- Delivery: it does **not** write into Directus. `docker-compose.yml` runs it beside Directus on a shared network. The v1 frontend reads the result via Directus: `src/core/infra/http/home-http.ts` requests `items/home?fields=*,socials.*,github.*,...` and `src/core/entities/home.ts` types it as `github: Github[]` (`totalCommits`, `totalRepositories`). So the `github` relation on the `home` item is populated by something outside the code in either repo (most likely a Directus Flow or a manual HTTP call, cf. `http/request.http`). Treat the exact mechanism as unverified.
- v1 UI (`src/pages/home/components/stats.tsx`) shows four count-up tiles: years of experience, total repositories, technologies mastered, total commits.

Problems not to carry into v2: private repos inflate/leak counts; `commits?author=` counts all branches and forks, unlike GitHub's profile counting; N+1 request pattern burns rate limit and is slow; "total commits" is a vanity number.

## 2. Which metrics are meaningful to a recruiter

| Metric | Verdict | Why |
|---|---|---|
| Contributions in the last year (`contributionCalendar.totalContributions`) | Keep | Same number as the profile graph; shows recent, sustained activity. |
| Contribution calendar / heatmap | Keep, optional | Visual proof of consistency; same query. |
| Top languages (by repo primary language) | Keep | Quick skill signal; cheap from `repositories { primaryLanguage }`. |
| Public repositories count | Keep (small) | Cheap, honest if labelled "public". |
| Pinned repos (name, description, stars, language, link) | Keep | Strongest signal: curated work they can click. `pinnedItems` is public data. |
| Current / longest streak | Optional | Derivable from the calendar; fun but can punish normal life. |
| Followers, stars received | Vanity | Audience, not skill. |
| All-time "total commits" (v1) | Drop | Inconsistent definition, noisy, expensive, not comparable to the profile. |
| Years of experience, technologies mastered | Static content | Authored, not derivable from GitHub; keep as config. |

**Recommended set:** contributions in the last year, public repos, top 3-5 languages, pinned repos, optional heatmap. One GraphQL call.

## 3. Which API provides each

GraphQL is the right fit; REST has no equivalent of the contribution calendar.

- `user(login).contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } totalCommitContributions restrictedContributionsCount }`. The docs list these fields on `ContributionsCollection` and note a 1-year window limit. https://docs.github.com/en/graphql/reference/objects
- `user(login).repositories(privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false, first: 100) { totalCount nodes { primaryLanguage { name color } } }` for repo count and language tally.
- `user(login).pinnedItems(first: 6, types: REPOSITORY)` for pinned repos.
- Private work: only shows (as an anonymous count) if the user enabled private contributions on their profile. https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile
- What counts as a contribution: commits on the default branch (or `gh-pages`), author email linked to the account, not in forks; can take up to 24 h to appear. This is why v1's REST count and the profile differ. https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile

Field-level details of `user`, `pinnedItems` and `repositories` arguments are from the GraphQL schema as known to the author, not re-read page by page; verify with one real query at implementation time.

## 4. Token

- GraphQL requires authentication even for public data (REST allows unauthenticated public reads at 60 req/h per IP). Use one server-side token; never ship it to the browser.
- Prefer a **fine-grained personal access token**: resource owner = the user, repository access = public repositories (read-only), **no additional permissions**. Per the docs, permissions are required for private resources, and some endpoints also serve public resources without them. https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens
- Not confirmed on docs.github.com: whether a no-permission fine-grained token serves GraphQL `contributionsCollection`. Test once. Fallback: a classic PAT with **no scopes** (public data only).
- Set an expiry and rotate; keep it in the deploy platform's env, never in the repo (public repo).

## 5. Rate limits

Sources: https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api and https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api

- GraphQL primary: 5,000 points/hour per user. Cost = requests needed per connection / 100, min 1. The combined query costs a few points; read the real cost from `rateLimit { cost remaining resetAt }`.
- REST primary: 60/h unauthenticated (per IP), 5,000/h authenticated.
- Secondary: 100 concurrent requests, 2,000 points/min GraphQL (900 REST), CPU-time limits. Irrelevant at one query per TTL.
- Node limit: 500,000 per call; each connection needs `first`/`last` of 1-100.

## 6. In-process caching recommendation

- Module-level `{ data, fetchedAt }` holding the whole stats payload.
- **TTL 1 hour.** Contributions lag up to 24 h on GitHub anyway, so fresher adds nothing. That is about 24 queries/day, far under 1% of the budget.
- **Stale-while-error:** if refresh fails (rate limit, outage), keep serving the last good value and retry after ~60 s. Never fail the page because of stats.
- **Coalesce:** keep the in-flight promise so concurrent requests share one upstream call.
- Optionally refresh in the background so no visitor waits on GitHub; on cold start either wait once or render without the stats block.
- Cache is lost on restart; fine for one small instance.

## 7. Open points

- Confirm the fine-grained token works for `contributionsCollection`.
- Decide whether to show the private-contribution count.
- How v1's Directus `github` relation gets populated is unverified; moot once v2 fetches live.
