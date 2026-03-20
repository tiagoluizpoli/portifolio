# Checklist: High-Fidelity Migration Audit

- [ ] **Infrastructure Consistency**
    - [ ] Database `69bd5246003ad7eecea2` exists.
    - [ ] 7 tables provisioned: `home`, `experience`, `education`, `skills`, `solutions`, `socials`, `contact_info`.
    - [ ] Storage buckets `assets` and `trash` provisioned.
- [ ] **Data Fidelity**
    - [ ] 38+ skills present in `skills` table with $id/title/iconCode/type/sort.
    - [ ] Bilingual content (EN/PT) correctly flattened for `home` and `experience`.
    - [ ] All $id values are slug-based (deterministic).
- [ ] **Asset Management**
    - [ ] `profile.jpg` matches `pictureId` in `home`.
    - [ ] `cv.pdf` matches `cvId` in `home` (legacy mapping `cv-pdf` or ID).
    - [ ] Storage cleanup moved all non-referenced files to `trash`.
- [ ] **Performance & Security**
    - [ ] Curator team Role (`Role.team(CURATOR_ID)`) has write permissions.
    - [ ] Public Role (`Role.any()`) has read-only access.
    - [ ] Migration execution time < 30 seconds for full batch.
