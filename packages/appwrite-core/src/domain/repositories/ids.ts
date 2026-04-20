type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

export type TableId = Brand<string, 'TableId'>;
export type BucketId = Brand<string, 'BucketId'>;
export type FileId = Brand<string, 'FileId'>;

export function asTableId(value: string): TableId {
  return value as TableId;
}

export function asBucketId(value: string): BucketId {
  return value as BucketId;
}

export function asFileId(value: string): FileId {
  return value as FileId;
}

export function isTableId(value: unknown): value is TableId {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isBucketId(value: unknown): value is BucketId {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isFileId(value: unknown): value is FileId {
  return typeof value === 'string' && value.trim().length > 0;
}
