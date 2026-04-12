# Appwrite Storage — Complete Lifecycle Examples

---

## Lifecycle Overview

```
Upload → View/Preview → Soft Delete (to trash bucket) → Restore → Hard Delete
```

Never hard-delete immediately. Always trash first.

---

## Example 1: Avatar Upload with Validation and Optimization

```typescript
// apps/cms/src/functions/storage.functions.ts

export const uploadAvatarFn = createServerFn({ method: 'POST' })
  .handler(async ({ request }) => {
    const { account, storage } = createSessionClient();
    const user = await account.get();

    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) throw new Error('No file uploaded');

    // Validate file
    const FileValidationSchema = z.object({
      size: z.number().max(BUCKETS.AVATARS.maxSize, 'Image must be under 5MB'),
      type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const, {
        errorMap: () => ({ message: 'Only JPEG, PNG, WebP, or AVIF images accepted' }),
      }),
    });
    FileValidationSchema.parse({ size: file.size, type: file.type });

    // Delete old avatar if exists (get current about doc)
    const aboutResult = await databases.listDocuments(
      DB_ID, COLLECTIONS.ABOUT,
      [Query.equal('userId', user.$id), Query.select(['avatarFileId'])]
    );
    if (aboutResult.documents.length > 0 && aboutResult.documents[0]['avatarFileId']) {
      await trashFile(storage, BUCKETS.AVATARS, aboutResult.documents[0]['avatarFileId']);
    }

    // Upload new avatar
    const uploaded = await storage.createFile(
      BUCKETS.AVATARS,
      ID.unique(),
      InputFile.fromBuffer(await file.arrayBuffer(), file.name),
      [
        Permission.read(Role.any()),           // Public — portfolio avatars
        Permission.delete(Role.user(user.$id)), // Owner can delete
      ]
    );

    // Update about document with new file ID
    if (aboutResult.documents.length > 0) {
      await databases.updateDocument(
        DB_ID, COLLECTIONS.ABOUT, aboutResult.documents[0].$id,
        { avatarFileId: uploaded.$id }
      );
    }

    return {
      fileId: uploaded.$id,
      viewUrl: getFileViewUrl(BUCKETS.AVATARS, uploaded.$id),
      previewUrl: getFilePreviewUrl(BUCKETS.AVATARS, uploaded.$id, { width: 400, height: 400 }),
    };
  });
```

---

## Example 2: Resume PDF Upload

```typescript
export const uploadResumeFn = createServerFn({ method: 'POST' })
  .handler(async ({ request }) => {
    const { account, storage, databases } = createSessionClient();
    const user = await account.get();

    const formData = await request.formData();
    const file = formData.get('resume');
    if (!(file instanceof File)) throw new Error('No file uploaded');

    const FileValidationSchema = z.object({
      size: z.number().max(BUCKETS.RESUMES.maxSize, 'Resume must be under 10MB'),
      type: z.literal('application/pdf', { errorMap: () => ({ message: 'Only PDF files accepted' }) }),
    });
    FileValidationSchema.parse({ size: file.size, type: file.type });

    // Trash old resume if exists
    const about = await getUserAbout(databases, user.$id);
    if (about?.resumeFileId) {
      await trashFile(storage, BUCKETS.RESUMES, about.resumeFileId);
    }

    const uploaded = await storage.createFile(
      BUCKETS.RESUMES,
      ID.unique(),
      InputFile.fromBuffer(await file.arrayBuffer(), sanitizeFilename(file.name)),
      [Permission.read(Role.any()), Permission.delete(Role.user(user.$id))]
    );

    // Update about.resumeFileId
    if (about) {
      await databases.updateDocument(DB_ID, COLLECTIONS.ABOUT, about.$id, {
        resumeFileId: uploaded.$id,
      });
    }

    return {
      fileId: uploaded.$id,
      downloadUrl: getFileDownloadUrl(BUCKETS.RESUMES, uploaded.$id),
      viewUrl: getFileViewUrl(BUCKETS.RESUMES, uploaded.$id),
    };
  });

// Sanitize filename to prevent path traversal
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255);
}
```

---

## Example 3: Soft Delete → Restore → Hard Delete

```typescript
// Move file to trash bucket (preserves original file ID as trash doc ID)
async function trashFile(
  storage: Storage,
  bucketId: string,
  fileId: string,
): Promise<void> {
  try {
    // Download the original file
    const fileBuffer = await storage.getFileDownload(bucketId, fileId);
    const fileInfo = await storage.getFile(bucketId, fileId);

    // Upload to trash bucket (preserving original ID)
    await storage.createFile(
      BUCKETS.TRASH,
      fileId,                                           // Same ID for easy restoration
      InputFile.fromBuffer(fileBuffer, fileInfo.name),
      [Permission.read(Role.users()), Permission.delete(Role.team('admin'))]
    );

    // Delete from original bucket
    await storage.deleteFile(bucketId, fileId);

    // Track in trash collection for audit / time-based cleanup
    await databases.createDocument(DB_ID, COLLECTIONS.TRASH, ID.unique(), {
      fileId,
      originalBucket: bucketId,
      originalName: fileInfo.name,
      size: fileInfo.sizeOriginal,
      trashedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      // File was already gone — not an error
      return;
    }
    throw error;
  }
}

// Restore from trash
async function restoreFile(
  storage: Storage,
  fileId: string,
  targetBucketId: string,
  permissions: string[],
): Promise<void> {
  const fileBuffer = await storage.getFileDownload(BUCKETS.TRASH, fileId);
  const fileInfo = await storage.getFile(BUCKETS.TRASH, fileId);

  // Restore to original bucket
  await storage.createFile(
    targetBucketId,
    fileId,
    InputFile.fromBuffer(fileBuffer, fileInfo.name),
    permissions
  );

  // Remove from trash
  await storage.deleteFile(BUCKETS.TRASH, fileId);

  // Remove from trash collection
  const trashDocs = await databases.listDocuments(
    DB_ID, COLLECTIONS.TRASH,
    [Query.equal('fileId', fileId), Query.limit(1)]
  );
  if (trashDocs.documents.length > 0) {
    await databases.deleteDocument(DB_ID, COLLECTIONS.TRASH, trashDocs.documents[0].$id);
  }
}

// Hard delete from trash (permanent)
async function hardDeleteFile(storage: Storage, fileId: string): Promise<void> {
  await storage.deleteFile(BUCKETS.TRASH, fileId);
  const trashDocs = await databases.listDocuments(
    DB_ID, COLLECTIONS.TRASH,
    [Query.equal('fileId', fileId)]
  );
  for (const doc of trashDocs.documents) {
    await databases.deleteDocument(DB_ID, COLLECTIONS.TRASH, doc.$id);
  }
}
```

---

## Example 4: URL Helpers

```typescript
// Consistent URL generation for all file access patterns
const ENDPOINT = process.env.APPWRITE_ENDPOINT!;
const PROJECT  = process.env.APPWRITE_PROJECT_ID!;

// For viewing files in browser (inline)
export function getFileViewUrl(bucketId: string, fileId: string): string {
  return `${ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${PROJECT}`;
}

// For downloading files (triggers browser download)
export function getFileDownloadUrl(bucketId: string, fileId: string): string {
  return `${ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/download?project=${PROJECT}`;
}

// For image preview with server-side resize/transform
export function getFilePreviewUrl(
  bucketId: string,
  fileId: string,
  options: {
    width?: number;
    height?: number;
    gravity?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    quality?: number;           // 0-100
    format?: 'jpg' | 'webp' | 'png';
    borderRadius?: number;
  } = {}
): string {
  const params = new URLSearchParams({ project: PROJECT });
  if (options.width)        params.set('width', String(options.width));
  if (options.height)       params.set('height', String(options.height));
  if (options.gravity)      params.set('gravity', options.gravity);
  if (options.quality)      params.set('quality', String(options.quality));
  if (options.format)       params.set('output', options.format);
  if (options.borderRadius) params.set('borderRadius', String(options.borderRadius));

  return `${ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/preview?${params}`;
}

// Usage examples:
getFilePreviewUrl(BUCKETS.AVATARS, fileId, { width: 200, height: 200, format: 'webp', quality: 85 });
getFilePreviewUrl(BUCKETS.AVATARS, fileId, { width: 80, height: 80, borderRadius: 40 }); // Circular
```

---

## Example 5: Cleanup Job — Auto-Purge Old Trash

```typescript
// migrator/src/jobs/cleanup-trash.ts — Run as a scheduled cron job
export async function purgeOldTrash(maxAgeDays = 30): Promise<void> {
  const { storage, databases } = createAdminClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  const oldTrash = await databases.listDocuments(
    DB_ID, COLLECTIONS.TRASH,
    [
      Query.lessThan('trashedAt', cutoffDate.toISOString()),
      Query.limit(100),
    ]
  );

  console.log(`Purging ${oldTrash.documents.length} old trash items...`);

  for (const doc of oldTrash.documents) {
    try {
      await storage.deleteFile(BUCKETS.TRASH, doc['fileId']);
      await databases.deleteDocument(DB_ID, COLLECTIONS.TRASH, doc.$id);
      console.log(`  ↳ Purged: ${doc['fileId']} (${doc['originalName']})`);
    } catch (error) {
      console.error(`  ✗ Failed to purge ${doc['fileId']}:`, error);
      // Continue — don't let one failure stop the job
    }
  }
}
```
