/** Prefixes a bucket-relative asset path with ASSET_BASE_URL (tolerates stray slashes). */
export function assetUrl(path: string, base = process.env.ASSET_BASE_URL ?? ''): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
