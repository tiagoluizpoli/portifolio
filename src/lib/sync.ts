import { type Bucket, bucketClient, bucketFromEnv } from './bucket';
import type { ContentStore } from './content/store';
import { logger } from './log';

const S3_KEY_PATTERN = /<Key>([^<]+)<\/Key>/g;
const TRUNCATED_PATTERN = /<IsTruncated>true<\/IsTruncated>/;
const NEXT_TOKEN_PATTERN = /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/;

async function listKeys(bucket: Bucket): Promise<string[]> {
  const client = bucketClient(bucket);
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const query = `?list-type=2${token ? `&continuation-token=${encodeURIComponent(token)}` : ''}`;
    const listing = await client.fetch(query);
    const xml = await listing.text();
    for (const [, key] of xml.matchAll(S3_KEY_PATTERN)) keys.push(key.replaceAll('&amp;', '&'));
    token = TRUNCATED_PATTERN.test(xml) ? xml.match(NEXT_TOKEN_PATTERN)?.[1] : undefined;
  } while (token);
  return keys;
}

/** Copies objects missing in `to` from `from` (union; never deletes). Returns the copied keys. */
export async function copyMissingAssets(from: Bucket, to: Bucket): Promise<string[]> {
  const present = new Set(await listKeys(to));
  const sourceKeys = await listKeys(from);
  const missing = sourceKeys.filter((key) => !present.has(key));
  const source = bucketClient(from);
  const target = bucketClient(to);
  for (const key of missing) {
    const object = await source.fetch(`/${key}`);
    const bytes = new Uint8Array(await object.arrayBuffer());
    await target.fetch(`/${key}`, {
      method: 'PUT',
      body: bytes,
      headers: { 'content-type': object.headers.get('content-type') ?? 'application/octet-stream' },
    });
  }
  logger.info('assets copied', { copied: missing.length, scanned: sourceKeys.length });
  return missing;
}

export interface Remote {
  url: string;
  token: string;
}

export function remoteFromEnv(env = process.env): Remote {
  const { SYNC_PROD_URL, SYNC_PROD_TOKEN } = env;
  if (!(SYNC_PROD_URL && SYNC_PROD_TOKEN)) throw new Error('production sync is not configured (SYNC_PROD_*)');
  return { url: `${SYNC_PROD_URL.replace(/\/+$/, '')}/api/sync`, token: SYNC_PROD_TOKEN };
}

async function callRemote(remote: Remote, init: RequestInit): Promise<Response> {
  const res = await fetch(remote.url, {
    ...init,
    headers: { ...init.headers, authorization: `Bearer ${remote.token}` },
  });
  if (!res.ok) throw new Error(`production sync failed: ${res.status} ${await res.text()}`);
  return res;
}

export type SyncDirection = 'send' | 'bring';

/** Runs one sync direction; logs the outcome (never tokens) and rethrows failures. */
async function logged(direction: SyncDirection, run: () => Promise<string[]>): Promise<string> {
  try {
    const copied = await run();
    logger.info('content sync done', { direction, assetsCopied: copied.length });
    return `${direction === 'send' ? 'Sent to production' : 'Brought from production'} (${copied.length} assets copied).`;
  } catch (error) {
    logger.error('content sync failed', { direction, error });
    throw error;
  }
}

/** Dev -> production: assets first (union, never deleted), then the content rows. */
export function sendToProduction(store: ContentStore, env = process.env): Promise<string> {
  return logged('send', async () => {
    const local = bucketFromEnv('ASSET_S3', env);
    const prod = bucketFromEnv('PROD_ASSET_S3', env);
    const remote = remoteFromEnv(env);
    const copied = await copyMissingAssets(local, prod);
    const snapshot = await store.exportSections();
    await callRemote(remote, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(snapshot),
    });
    return copied;
  });
}

/** Production -> dev: assets first (union, never deleted), then the content rows. */
export function bringFromProduction(store: ContentStore, env = process.env): Promise<string> {
  return logged('bring', async () => {
    const local = bucketFromEnv('ASSET_S3', env);
    const prod = bucketFromEnv('PROD_ASSET_S3', env);
    const remote = remoteFromEnv(env);
    const response = await callRemote(remote, { method: 'GET' });
    const snapshot: unknown = await response.json();
    const copied = await copyMissingAssets(prod, local);
    await store.importSections(snapshot);
    return copied;
  });
}
