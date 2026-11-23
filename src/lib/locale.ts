export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];

/** Fixed interface text; content lives in Postgres. */
export const ui = {
  en: { whatsapp: 'WhatsApp', downloadCv: 'Download CV' },
  pt: { whatsapp: 'WhatsApp', downloadCv: 'Baixar CV' },
} satisfies Record<Locale, Record<string, string>>;
