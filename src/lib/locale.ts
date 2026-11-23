export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];

/** Fixed interface text; content lives in Postgres. */
export const ui = {
  en: {
    whatsapp: 'Message on WhatsApp',
    downloadCv: 'Download CV',
    localTime: 'local time',
    photoAlt: 'Portrait of Tiago',
  },
  pt: {
    whatsapp: 'Conversar no WhatsApp',
    downloadCv: 'Baixar CV',
    localTime: 'em São Paulo',
    photoAlt: 'Retrato de Tiago',
  },
} satisfies Record<Locale, Record<string, string>>;
