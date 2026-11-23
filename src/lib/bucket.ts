import { AwsClient } from 'aws4fetch';

export interface Bucket {
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  region?: string;
}

const DEFAULT_REGION = 'us-east-1';

/** Bucket from `<prefix>_ENDPOINT|BUCKET|ACCESS_KEY|SECRET_KEY|REGION` env vars. */
export function bucketFromEnv(prefix: string, env = process.env): Bucket {
  const [endpoint, bucket, accessKey, secretKey] = ['ENDPOINT', 'BUCKET', 'ACCESS_KEY', 'SECRET_KEY'].map(
    (suffix) => env[`${prefix}_${suffix}`],
  );
  if (!(endpoint && bucket && accessKey && secretKey)) throw new Error(`bucket is not configured (${prefix}_*)`);
  return { endpoint, bucket, accessKey, secretKey, region: env[`${prefix}_REGION`] };
}

/** Signed S3 client; paths are relative to the bucket and the URL is path-style (RustFS/MinIO have no bucket subdomains). */
export function bucketClient({ endpoint, bucket, accessKey, secretKey, region = DEFAULT_REGION }: Bucket) {
  const aws = new AwsClient({ accessKeyId: accessKey, secretAccessKey: secretKey, service: 's3', region });
  const base = `${endpoint.replace(/\/+$/, '')}/${bucket}`;
  return {
    async fetch(path: string, init?: RequestInit) {
      const res = await aws.fetch(`${base}${path}`, init);
      if (!res.ok) throw new Error(`bucket ${init?.method ?? 'GET'} ${path} failed: ${res.status}`);
      return res;
    },
  };
}
