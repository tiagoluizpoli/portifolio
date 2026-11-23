import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { AwsClient } from 'aws4fetch';

/** Stores `bytes` in the environment bucket as `<sha256>.<ext>` and returns that relative path. Same bytes -> same path. */
export async function uploadAsset(
  bytes: Uint8Array<ArrayBuffer>,
  filename: string,
  env = process.env,
): Promise<string> {
  const { ASSET_S3_ENDPOINT, ASSET_S3_BUCKET, ASSET_S3_ACCESS_KEY, ASSET_S3_SECRET_KEY } = env;
  if (!(ASSET_S3_ENDPOINT && ASSET_S3_BUCKET && ASSET_S3_ACCESS_KEY && ASSET_S3_SECRET_KEY))
    throw new Error('asset bucket is not configured (ASSET_S3_*)');
  const ext = extname(filename).toLowerCase();
  const path = `${createHash('sha256').update(bytes).digest('hex')}${ext}`;
  const client = new AwsClient({
    accessKeyId: ASSET_S3_ACCESS_KEY,
    secretAccessKey: ASSET_S3_SECRET_KEY,
    service: 's3',
    region: env.ASSET_S3_REGION ?? 'us-east-1',
  });
  // Path-style URL: RustFS/MinIO-style endpoints have no bucket subdomains.
  const res = await client.fetch(`${ASSET_S3_ENDPOINT.replace(/\/+$/, '')}/${ASSET_S3_BUCKET}/${path}`, {
    method: 'PUT',
    body: bytes,
  });
  if (!res.ok) throw new Error(`bucket upload failed: ${res.status} ${await res.text()}`);
  return path;
}
