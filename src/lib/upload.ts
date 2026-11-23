import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { bucketClient, bucketFromEnv } from './bucket';

/** Stores `bytes` in the environment bucket as `<sha256>.<ext>` and returns that relative path. Same bytes -> same path. */
export async function uploadAsset(
  bytes: Uint8Array<ArrayBuffer>,
  filename: string,
  env = process.env,
): Promise<string> {
  const client = bucketClient(bucketFromEnv('ASSET_S3', env));
  const ext = extname(filename).toLowerCase();
  const path = `${createHash('sha256').update(bytes).digest('hex')}${ext}`;
  await client.fetch(`/${path}`, { method: 'PUT', body: bytes });
  return path;
}
