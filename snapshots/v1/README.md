# v1 content snapshot (2026-11-22)

Throwaway branch, never merged. Seeds v2 content and the sections decision (#14, ticket #18).

Each file is the exact response `data` of the request the v1 site makes (`src/core/infra/http/*`), published items only, against `directus.lunalabs.com.br`:

- `home.json`: hero, socials, github stats, translations (CV + picture as Directus file ids)
- `resume.json`: about, experience, education, skills, per language
- `solutions.json`: solution cards
- `contactInfo.json`: contact rows

Languages: `directus_translations_id` `b28c1f36-…` = English, `956fbf15-…` = Portuguese.

**Assets are missing**: Directus storage on the VPS is empty (`/directus/uploads`), so the photo (`2f321335-…`) and CV (`e10fe6c3-…`, `c0a70270-…`) cannot be exported; the owner supplies v2 assets.
