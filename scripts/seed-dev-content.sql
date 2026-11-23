-- Initial Development content from the approved draft (docs/content/v2-draft.md, #25).
-- Run once by hand against portfolio_dev after the app has booted once (migrations create the table):
--   psql "$DATABASE_URL" -f scripts/seed-dev-content.sql
-- Re-running overwrites the rows below. whatsappUrl and cv are absent until the owner supplies them.
INSERT INTO content (key, data) VALUES
('hero', $json$
{
  "name": "Tiago Luiz Seuaciuc de Poli",
  "title": { "en": "Senior Software Engineer", "pt": "Engenheiro de Software Sênior" },
  "pitch": {
    "en": "I build cloud-native backends and SaaS platforms in Node.js, TypeScript and .NET, from AI document pipelines to zero-downtime migrations.",
    "pt": "Construo backends cloud-native e plataformas SaaS em Node.js, TypeScript e .NET, de pipelines de documentos com IA a migrações sem downtime."
  },
  "location": { "en": "São Paulo, Brazil · Remote", "pt": "São Paulo, Brasil · Remoto" }
}
$json$)
ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now();
