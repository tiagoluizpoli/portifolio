import type { APIRoute } from 'astro';
import { contentStore } from '../../lib/content/instance';

const OK = 200;
const UNAVAILABLE = 503;

// sha lets the deploy poll tell the new container from the old one.
export const GET: APIRoute = async () => {
  const healthy = await contentStore.isHealthy();
  return Response.json(
    { status: healthy ? 'ok' : 'database unreachable', sha: process.env.GIT_SHA ?? 'unknown' },
    { status: healthy ? OK : UNAVAILABLE },
  );
};
