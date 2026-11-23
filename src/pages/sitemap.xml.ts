import type { APIRoute } from 'astro';
import { sitemap } from '../lib/seo';

export const GET: APIRoute = () => new Response(sitemap(), { headers: { 'content-type': 'application/xml' } });
