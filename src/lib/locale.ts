import type { Content } from './content/schemas';

export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];

const en = {
  whatsapp: 'WhatsApp',
  downloadCv: 'Download CV',
  learnMore: 'Learn more',
  now: 'Now:',
  present: 'Present',
  nav: { projects: 'Projects', experience: 'Experience', skills: 'Skills', about: 'About', contact: 'Contact' },
  education: 'Education',
  languages: 'Languages',
  roleLabel: 'Role',
  status: {
    'production-active': 'In production · Actively developed',
    production: 'In production',
    'coming-soon': 'Coming soon',
  } satisfies Record<Content['showcase']['projects'][number]['status'], string>,
};

type Dictionary = typeof en;

/** Fixed interface text; content lives in Postgres. A missing key in any locale fails typecheck. */
export const ui: Record<Locale, Dictionary> = {
  en,
  pt: {
    whatsapp: 'WhatsApp',
    downloadCv: 'Baixar CV',
    learnMore: 'Saiba mais',
    now: 'Agora:',
    present: 'Atual',
    nav: { projects: 'Projetos', experience: 'Experiência', skills: 'Habilidades', about: 'Sobre', contact: 'Contato' },
    education: 'Formação',
    languages: 'Idiomas',
    roleLabel: 'Papel',
    status: {
      'production-active': 'Em produção · Em evolução ativa',
      production: 'Em produção',
      'coming-soon': 'Em breve',
    },
  },
};
