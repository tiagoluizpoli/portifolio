import { timingSafeEqual } from 'node:crypto';
import type { APIRoute } from 'astro';
import { contentStore } from '../../lib/content/instance';
import { ContentError } from '../../lib/content/store';

const sameToken = (given: string, expected: string) => {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

export const POST: APIRoute = async ({ request }) => {
  const secret = process.env.REVALIDATE_TOKEN;
  const given = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  // Unset secret = endpoint disabled, never open.
  if (!secret || !sameToken(given, secret)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  try {
    await contentStore.revalidate();
    return Response.json({ status: 'ok' });
  } catch (error) {
    if (error instanceof ContentError)
      return Response.json({ error: error.message, path: error.path }, { status: 422 });
    throw error;
  }
};
