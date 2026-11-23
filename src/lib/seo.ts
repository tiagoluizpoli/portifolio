import type { Content } from './content/schemas';
import { type Locale, locales } from './locale';

export const DEFAULT_SITE_URL = 'https://tiagoluizpoli.lunalabs.com.br';
/** Placeholder asset; the owner replaces public/og.png with the real 1200x630 image. */
export const OG_IMAGE_PATH = '/og.png';

export const paths: Record<Locale, string> = { en: '/', pt: '/pt/' };
const hreflang: Record<Locale, string> = { en: 'en', pt: 'pt-BR' };
const ogLocale: Record<Locale, string> = { en: 'en_US', pt: 'pt_BR' };

export function siteUrl(env: string | undefined = process.env.SITE_URL): string {
  return (env || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

export function seo(lang: Locale, { hero, contact }: Pick<Content, 'hero' | 'contact'>, site = siteUrl()) {
  const abs = (path: string) => site + path;
  const title = `${hero.name} · ${hero.title[lang]}`;
  const description = hero.pitch[lang];
  const image = abs(OG_IMAGE_PATH);
  return {
    title,
    description,
    canonical: abs(paths[lang]),
    image,
    ogLocale: ogLocale[lang],
    alternates: [
      ...locales.map((l) => ({ hreflang: hreflang[l], href: abs(paths[l]) })),
      { hreflang: 'x-default', href: abs(paths.en) },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: hero.name,
      jobTitle: hero.title[lang],
      url: abs(paths[lang]),
      image,
      sameAs: [contact.githubUrl, contact.linkedinUrl],
    },
  };
}

export function sitemap(site = siteUrl()): string {
  const alternates = locales
    .map((l) => `<xhtml:link rel="alternate" hreflang="${hreflang[l]}" href="${site + paths[l]}"/>`)
    .concat(`<xhtml:link rel="alternate" hreflang="x-default" href="${site}/"/>`)
    .join('');
  const urls = locales.map((l) => `<url><loc>${site + paths[l]}</loc>${alternates}</url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
}

export function robots(site = siteUrl()): string {
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`;
}
