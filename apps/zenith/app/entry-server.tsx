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
import { renderToString } from 'react-dom/server';
import { StartupErrorInterceptor } from '@/components/startup-error-interceptor';
import { envResult } from '@/config/env';

// ---------------------------------------------------------------------------
// Bootloader guard injected into the default start handler
// ---------------------------------------------------------------------------
const startHandler = createStartHandler(defaultRenderHandler);

export default async function handler(request: Request): Promise<Response> {
  // Fast path: env is valid — delegate to TanStack Start as normal
  if (envResult.success) {
    return startHandler(request);
  }

  // Slow path: env is invalid — return static diagnostic screen (HTTP 503)
  const fieldErrors = envResult.error.flatten().fieldErrors as Record<
    string,
    string[]
  >;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zenith — Startup Configuration Error</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0">
    <div id="root">${renderToString(
      <StartupErrorInterceptor errors={fieldErrors} />,
    )}</div>
  </body>
</html>`;

  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Prevent caches from serving this error page to future clients after fix
      'Cache-Control': 'no-store',
    },
  });
}
