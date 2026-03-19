import type { Language } from '@/providers/lang';

export const engLinks = [
  {
    name: 'home',
    path: '/',
  },
  {
    name: 'solutions',
    path: '/solutions',
  },
  {
    name: 'resume',
    path: '/resume',
  },
  // {
  //   name: 'work',
  //   path: '/work',
  // },
  {
    name: 'contact',
    path: '/contact',
  },
];

export const ptLinks = [
  {
    name: 'Início',
    path: '/',
  },
  {
    name: 'soluções',
    path: '/solutions',
  },
  {
    name: 'currículo',
    path: '/resume',
  },
  // {
  //   name: 'trabalho',
  //   path: '/work',
  // },
  {
    name: 'contato',
    path: '/contact',
  },
];

export const links: Record<Language, typeof engLinks> = {
  'en-US': engLinks,
  'pt-BR': ptLinks,
};
