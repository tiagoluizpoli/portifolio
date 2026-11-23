export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];

/** Fixed interface text; content lives in Postgres. */
export const ui = {
  en: {
    whatsapp: 'WhatsApp',
    downloadCv: 'Download CV',
    stats: '{contributions} contributions in the last year · {repos} public repositories · mostly {languages}',
  },
  pt: {
    whatsapp: 'WhatsApp',
    downloadCv: 'Baixar CV',
    stats: '{contributions} contribuições no último ano · {repos} repositórios públicos · principalmente {languages}',
  },
} satisfies Record<Locale, Record<string, string>>;
