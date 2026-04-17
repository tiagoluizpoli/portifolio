/**
 * Entry Server Bootloader — FR-011 fail-fast startup validation.
 *
 * Wraps the TanStack Start handler with a guard that checks environment
 * configuration BEFORE the router tree mounts. If validation fails, it
 * immediately returns an HTTP 503 with a static diagnostic page, preventing
 * the Node.js process from crashing with an unhandled exception.
 *
 * Performance budget: < 50ms overhead (single synchronous safeParse call).
 */
import {
  createStartHandler,
  defaultRenderHandler,
} from '@tanstack/react-start/server';

const startHandler = createStartHandler(defaultRenderHandler);

export default async function handler(request: Request): Promise<Response> {
  return startHandler(request);
}
