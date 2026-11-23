import type { APIRoute } from 'astro';
import { contentStore } from '../../lib/content/instance';

const OK = 200;
const UNAVAILABLE = 503;

export const GET: APIRoute = async () => {
  const healthy = await contentStore.isHealthy();
  return new Response(healthy ? 'ok' : 'database unreachable', { status: healthy ? OK : UNAVAILABLE });
};
