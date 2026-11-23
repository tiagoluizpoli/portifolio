import type { APIRoute } from 'astro';
import { contentStore } from '../../lib/content/instance';
import { contentErrorResponse, isAuthorized, unauthorized } from '../../lib/http';

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthorized(request, process.env.REVALIDATE_TOKEN)) return unauthorized();
  try {
    await contentStore.revalidate();
    return Response.json({ status: 'ok' });
  } catch (error) {
    return contentErrorResponse(error);
  }
};
