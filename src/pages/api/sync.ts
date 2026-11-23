import type { APIRoute } from 'astro';
import { contentStore } from '../../lib/content/instance';
import { contentErrorResponse, isAuthorized, unauthorized } from '../../lib/http';
import { logger } from '../../lib/log';

const authorized = (request: Request) => isAuthorized(request, process.env.SYNC_TOKEN);

export const GET: APIRoute = async ({ request }) => {
  if (!authorized(request)) return unauthorized();
  const snapshot = await contentStore.exportSections();
  logger.info('content export served', { sections: Object.keys(snapshot).length });
  return Response.json(snapshot);
};

export const PUT: APIRoute = async ({ request }) => {
  if (!authorized(request)) return unauthorized();
  const snapshot: unknown = await request.json().catch(() => undefined);
  try {
    await contentStore.importSections(snapshot);
    logger.info('content import applied');
    return Response.json({ status: 'ok' });
  } catch (error) {
    logger.error('content import rejected', { error });
    return contentErrorResponse(error);
  }
};
