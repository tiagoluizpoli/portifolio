import { AwsClient } from 'aws4fetch';

export interface Bucket {
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  region?: string;
}

/** Bucket from `<prefix>_ENDPOINT|BUCKET|ACCESS_KEY|SECRET_KEY|REGION` env vars. */
export function bucketFromEnv(prefix: string, env = process.env): Bucket {
  const [endpoint, bucket, accessKey, secretKey] = ['ENDPOINT', 'BUCKET', 'ACCESS_KEY', 'SECRET_KEY'].map(
    (k) => env[`${prefix}_${k}`],
  );
  if (!(endpoint && bucket && accessKey && secretKey)) throw new Error(`bucket is not configured (${prefix}_*)`);
  return { endpoint, bucket, accessKey, secretKey, region: env[`${prefix}_REGION`] };
}

function client(b: Bucket) {
  const aws = new AwsClient({
    accessKeyId: b.accessKey,
    secretAccessKey: b.secretKey,
    service: 's3',
    region: b.region ?? 'us-east-1',
  });
  const base = `${b.endpoint.replace(/\/+$/, '')}/${b.bucket}`; // path-style, like upload.ts
  return {
    async fetch(path: string, init?: RequestInit) {
      const res = await aws.fetch(`${base}${path}`, init);
      if (!res.ok) throw new Error(`bucket ${init?.method ?? 'GET'} ${path} failed: ${res.status}`);
      return res;
    },
  };
}

async function listKeys(b: Bucket): Promise<string[]> {
  const c = client(b);
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const query = `?list-type=2${token ? `&continuation-token=${encodeURIComponent(token)}` : ''}`;
    const xml = await (await c.fetch(query)).text();
    for (const m of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) keys.push(m[1].replaceAll('&amp;', '&'));
    token = /<IsTruncated>true<\/IsTruncated>/.test(xml)
      ? xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/)?.[1]
      : undefined;
  } while (token);
  return keys;
}

/** Copies objects missing in `to` from `from` (union; never deletes). Returns the copied keys. */
export async function copyMissingAssets(from: Bucket, to: Bucket): Promise<string[]> {
  const have = new Set(await listKeys(to));
  const missing = (await listKeys(from)).filter((k) => !have.has(k));
  const source = client(from);
  const target = client(to);
  for (const key of missing) {
    const obj = await source.fetch(`/${key}`);
    await target.fetch(`/${key}`, {
      method: 'PUT',
      body: new Uint8Array(await obj.arrayBuffer()),
      headers: { 'content-type': obj.headers.get('content-type') ?? 'application/octet-stream' },
    });
  }
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

export async function callRemote(remote: Remote, init: RequestInit): Promise<Response> {
  const res = await fetch(remote.url, {
    ...init,
    headers: { ...init.headers, authorization: `Bearer ${remote.token}` },
  });
  if (!res.ok) throw new Error(`production sync failed: ${res.status} ${await res.text()}`);
  return res;
}
