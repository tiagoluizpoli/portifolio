import { timingSafeEqual } from 'node:crypto';
import type { APIRoute } from 'astro';
import { contentStore } from '../../lib/content/instance';
import { ContentError } from '../../lib/content/store';

const sameToken = (given: string, expected: string) => {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

// Unset SYNC_TOKEN = endpoints disabled, never open.
const authorized = (request: Request) => {
  const secret = process.env.SYNC_TOKEN;
  const given = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  return Boolean(secret) && sameToken(given, secret as string);
};

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });

export const GET: APIRoute = async ({ request }) =>
  authorized(request) ? Response.json(await contentStore.exportSections()) : unauthorized();

export const PUT: APIRoute = async ({ request }) => {
  if (!authorized(request)) return unauthorized();
  try {
    await contentStore.importSections(await request.json().catch(() => undefined));
    return Response.json({ status: 'ok' });
  } catch (error) {
    if (error instanceof ContentError)
      return Response.json({ error: error.message, path: error.path }, { status: 422 });
    throw error;
  }
};
