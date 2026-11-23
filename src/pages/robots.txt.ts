import type { APIRoute } from 'astro';
import { robots } from '../lib/seo';

export const GET: APIRoute = () => new Response(robots(), { headers: { 'content-type': 'text/plain' } });
