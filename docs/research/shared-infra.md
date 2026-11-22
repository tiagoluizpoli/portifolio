# Readiness of the Shared Postgres and RustFS for the portfolio

Ticket: #16 (map: #14). Researched 2026-11-22. Dokploy facts were read from the
`dokploy-vps` instance through read-only API calls. No secrets are recorded here.

## Verdict

Usable, with gaps. Both services are healthy and reachable from other Dokploy
projects. Nothing portfolio-specific is set up on them yet (no database, no
bucket, no backup entry). The gaps are listed at the end.

## 1. Postgres backups

Source: Dokploy `postgres.one` for `lunalabs-shared-db`, `overview.backups`, `destination.all`.

- Instance: Dokploy project "Shared", `lunalabs-shared-db`, image `postgis/postgis:15-3.3`, status `done`, one named volume for data.
- Backups ARE configured, via Dokploy's built-in database backup:
  - Active: daily at `0 0 * * *`, keeps the latest 5, destination "lunalabs-backups". Runs succeeded daily from 2026-11-13 to 2026-11-22.
  - Disabled: a second job (`church_staging`, destination "church-backups"). It had one error run on 2026-11-18; later runs succeeded.
- Destination type: S3-compatible, provider `Minio`, region `us-east-1`. It points at the HOMELAB RustFS (a different host from the VPS), so backups are off-box.
- Gap: each Dokploy backup job dumps ONE named database. The active shared job dumps only the database `grocerify`. A new portfolio database is NOT backed up until its own backup entry exists.
- Observation: the portfolio project already has its own Postgres (`portifolio-db`, `postgres:15`, database `directus`) with a daily backup to the same destination. So the portfolio does not use the Shared Postgres today.
- The RustFS compose also has volume backups (kind `volumeBackup`) to the same destination, seen in `overview.backups`.

## 2. Reaching Postgres and RustFS from another Dokploy project

Sources: Dokploy `postgres.one` (`networkIds: []`, `detachDokployNetwork: false`), `network.all` (empty), `compose.one`. Dokploy docs: https://docs.dokploy.com/docs/core/docker-compose/utilities (network behavior).

- Dokploy projects are not network-isolated by default. Services attach to the shared overlay network `dokploy-network` unless detached.
- Shared Postgres: `detachDokployNetwork` is false and no custom networks exist (`network.all` returned none). It is a Swarm service, so another container on `dokploy-network` reaches it at host `shared-lunalabsshareddb-fbeezk` (its `appName`), port 5432.
- A Dokploy Application (the portfolio apps) joins `dokploy-network` automatically, so no extra network setup is needed. A Docker Compose service must declare the external network `dokploy-network` itself.
- Postgres also publishes an external port (8093 on the VPS host). Using it from other projects is unnecessary and widens exposure. Prefer the internal name.
- RustFS: compose `rustfs` (service `rustfs`), container healthy. Its compose file is redacted in the API, so whether the service joins `dokploy-network` is NOT confirmed. Traefik reaches it on ports 9000 (S3) and 9001 (console), which strongly implies it is on `dokploy-network`. The container is named `compose-calculate-cross-platform-microchip-y7pcp6-rustfs-1`; the internal endpoint is likely `http://rustfs:9000` or that container name on port 9000. Verify with a connectivity test from a portfolio container before relying on it.
- Fallback for any client: the public HTTPS S3 endpoint below.

## 3. Dedicated database and user on the shared instance

Source: PostgreSQL docs, https://www.postgresql.org/docs/15/sql-createrole.html and https://www.postgresql.org/docs/15/sql-createdatabase.html (the instance runs Postgres 15).

Dokploy has no API or UI to add extra databases or roles (it only manages the one default user and database). Run SQL as the admin role, via `psql` in the container (Dokploy terminal) or any client:

```sql
CREATE ROLE portfolio_app LOGIN PASSWORD '<generate, store in Dokploy env>';
CREATE DATABASE portfolio OWNER portfolio_app;
REVOKE ALL ON DATABASE portfolio FROM PUBLIC;
```

Then:
- Connection string for apps: `postgresql://portfolio_app:<password>@shared-lunalabsshareddb-fbeezk:5432/portfolio`, set as an env var in Dokploy, never committed.
- Add a Dokploy backup entry for database `portfolio` on the shared instance (see gap 2).
- The image is PostGIS 15, so the `postgis` extension is available if ever needed.

## 4. RustFS: public domain and public-read buckets

Dokploy facts (`domain.byComposeId`):
- Public S3 API: `https://storage.lunalabs.com.br` (port 9000, Let's Encrypt, enabled).
- Console: `https://console-storage.lunalabs.com.br` (port 9001, Let's Encrypt, enabled, no forward auth).

Public-read support. Primary sources are the RustFS repo (https://github.com/rustfs/rustfs) and docs (https://docs.rustfs.com):
- RustFS supports anonymous access through S3 bucket policies. `docs/operations/static-website-hosting.md` in the repo says anonymous requests are authorized by granting `s3:GetObject` in the bucket policy, and that explicit deny and public-access restrictions still apply.
- `bootstrap/README.md` applies bucket policy JSON with `rc bucket anonymous set-json`.
- An e2e test (`crates/e2e_test/src/anonymous_access_test.rs`) and a security regression entry in `docs/testing/security-regressions.md` cover anonymous reads and the "restrict public buckets" gate.
- The docs.rustfs.com IAM pages do not document bucket-level public policies; the repo docs above are the source. Treat exact CLI flags as something to test.
- Set a public-read policy on the portfolio bucket granting `s3:GetObject` on `arn:aws:s3:::<bucket>/*` to principal `*`. Do not grant `s3:ListBucket` publicly.
- Do not use SSE-KMS on that public bucket if `RUSTFS_KMS_ENFORCE_SSE_KEY_POLICY` is on (anonymous reads would fail; `docs/operations/kms-per-key-authorization.md`).
- CORS: https://docs.rustfs.com/en/administration/cors documents server-level env vars (`RUSTFS_CORS_ALLOWED_ORIGINS`, restart required). The repo `bootstrap` also supports per-bucket CORS rules. CORS is only needed if a browser script fetches the files cross-origin; plain `<img>` and download links do not need it.
- Resulting public URL shape (path-style): `https://storage.lunalabs.com.br/<bucket>/<key>`.

## 5. Gaps to fix before v2 relies on them

1. No portfolio database or role on the shared Postgres. Create them (section 3).
2. No backup for a new database. The active shared backup job covers only `grocerify`. Add a job for `portfolio` (destination "lunalabs-backups").
3. No bucket, no access key, no public-read policy on the shared RustFS for the portfolio. Create a bucket, a scoped access key (not the root key), and the anonymous `s3:GetObject` policy.
4. RustFS internal network membership is unverified (compose is redacted). Test from a portfolio container, or use the public HTTPS endpoint.
5. Two storage hosts exist: backup destinations use `storage.lunalabs.duckdns.org` (homelab), while the VPS RustFS is `storage.lunalabs.com.br`. Make sure the portfolio config points at the VPS one.
6. The RustFS console is public on HTTPS with no forward auth. Consider restricting it (IP allowlist or forward auth).
7. Postgres publishes host port 8093. Close it unless deliberately used.
8. Shared blast radius: the instance also serves other apps (grocerify, church). Postgres 15 is also an older major; plan upgrades.
9. The existing `portifolio-db` (database `directus`) is separate. Decide whether v2 migrates into the shared instance or keeps it.
10. Backup restore was not tested here (only run status was checked).
