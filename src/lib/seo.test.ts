import { describe, expect, it } from 'vitest';
import { robots, seo, siteUrl, sitemap } from './seo';

const content = {
  hero: {
    name: 'Tiago Poli',
    title: { en: 'Engineer', pt: 'Engenheiro' },
    pitch: { en: 'Builds things.', pt: 'Constrói coisas.' },
    location: { en: 'Brazil', pt: 'Brasil' },
  },
  contact: { linkedinUrl: 'https://linkedin.com/in/x', githubUrl: 'https://github.com/x' },
};
const site = 'https://example.com';

describe('seo', () => {
  it('builds per-locale head data with hreflang, canonical and image', () => {
    const pt = seo('pt', content, site);
    expect(pt.canonical).toBe('https://example.com/pt/');
    expect(pt.description).toBe('Constrói coisas.');
    expect(pt.alternates).toEqual([
      { hreflang: 'en', href: 'https://example.com/' },
      { hreflang: 'pt-BR', href: 'https://example.com/pt/' },
      { hreflang: 'x-default', href: 'https://example.com/' },
    ]);
    expect(pt.image).toBe('https://example.com/og.png');
  });

  it('emits Person JSON-LD with sameAs from contact', () => {
    expect(seo('en', content, site).jsonLd).toMatchObject({
      '@type': 'Person',
      name: 'Tiago Poli',
      jobTitle: 'Engineer',
      sameAs: ['https://github.com/x', 'https://linkedin.com/in/x'],
    });
  });

  it('lists both locales in the sitemap and points robots at it', () => {
    const xml = sitemap(site);
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<loc>https://example.com/pt/</loc>');
    expect(robots(site)).toContain('Sitemap: https://example.com/sitemap.xml');
  });

  it('defaults the site URL and trims trailing slashes', () => {
    expect(siteUrl('')).toBe('https://tiagoluizpoli.lunalabs.com.br');
    expect(siteUrl('https://a.b//')).toBe('https://a.b');
  });
});
