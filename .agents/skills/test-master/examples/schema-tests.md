# Schema Tests — Complete Example

**All 8 scenario classes applied to a schema validation test suite.**

```typescript
// src/schemas/__tests__/item.schema.test.ts
import { describe, it, expect } from 'vitest';
import { ItemSchema, CreateItemSchema, UpdateItemSchema } from '../item.schema';

// -------------------------------------------------------------------
// FACTORY
// -------------------------------------------------------------------
const validCreateInput = {
  title: 'My First Post',
  content: 'Some content here',
  status: 'draft' as const,
  tags: ['tech', 'writing'],
};

// -------------------------------------------------------------------
// CreateItemSchema
// -------------------------------------------------------------------
describe('CreateItemSchema', () => {

  // ═══════════════════════════════════════════
  // CLASS 1: HAPPY PATH
  // ═══════════════════════════════════════════
  describe('Happy Path', () => {
    it('accepts a complete, valid item', () => {
      const result = CreateItemSchema.safeParse(validCreateInput);
      expect(result.success).toBe(true);
    });

    it('accepts an item without optional content', () => {
      const { content, ...withoutContent } = validCreateInput;
      const result = CreateItemSchema.safeParse(withoutContent);
      expect(result.success).toBe(true);
    });

    it('accepts an item without optional tags', () => {
      const { tags, ...withoutTags } = validCreateInput;
      const result = CreateItemSchema.safeParse(withoutTags);
      expect(result.success).toBe(true);
    });

    it('defaults status to "draft" when omitted', () => {
      const result = CreateItemSchema.safeParse({ title: 'A title' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.status).toBe('draft');
    });

    it('accepts all valid status values', () => {
      for (const status of ['draft', 'published', 'archived']) {
        const result = CreateItemSchema.safeParse({ ...validCreateInput, status });
        expect(result.success).toBe(true);
      }
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 2: EDGE CASES
  // ═══════════════════════════════════════════
  describe('Edge Cases', () => {
    it('accepts a title of exactly 1 character (min boundary)', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: 'A' });
      expect(result.success).toBe(true);
    });

    it('accepts a title of exactly 255 characters (max boundary)', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: 'A'.repeat(255) });
      expect(result.success).toBe(true);
    });

    it('accepts content of exactly 10000 characters (max boundary)', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, content: 'x'.repeat(10000) });
      expect(result.success).toBe(true);
    });

    it('accepts an empty tags array', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, tags: [] });
      expect(result.success).toBe(true);
    });

    it('accepts title with unicode characters', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: '日本語テスト' });
      expect(result.success).toBe(true);
    });

    it('trims leading/trailing whitespace from title (if transform applied)', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: '  My Title  ' });
      if (result.success) {
        expect(result.data.title).toBe('My Title'); // Only if .trim() transform applied
      }
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 3: INVALID INPUT
  // ═══════════════════════════════════════════
  describe('Invalid Input', () => {
    it('rejects empty title', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: '' });
      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors.title).toBeDefined();
    });

    it('rejects whitespace-only title', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: '   ' });
      expect(result.success).toBe(false);
    });

    it('rejects title exceeding 255 characters', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: 'A'.repeat(256) });
      expect(result.success).toBe(false);
    });

    it('rejects null title', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: null });
      expect(result.success).toBe(false);
    });

    it('rejects numeric title', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: 12345 });
      expect(result.success).toBe(false);
    });

    it('rejects invalid status value', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, status: 'deleted' });
      expect(result.success).toBe(false);
    });

    it('rejects content exceeding 10000 characters', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, content: 'x'.repeat(10001) });
      expect(result.success).toBe(false);
    });

    it('rejects tags containing empty strings', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, tags: ['valid', ''] });
      expect(result.success).toBe(false);
    });

    it('reports all invalid fields simultaneously (not just first error)', () => {
      const result = CreateItemSchema.safeParse({ title: '', status: 'invalid' });
      expect(result.success).toBe(false);
      const errors = result.error?.flatten().fieldErrors;
      expect(errors?.title).toBeDefined();   // First error
      expect(errors?.status).toBeDefined();  // Second error — should both be present
    });

    it('rejects entirely missing required fields', () => {
      const result = CreateItemSchema.safeParse({});
      expect(result.success).toBe(false);
      // title is required
      expect(result.error?.flatten().fieldErrors.title).toBeDefined();
    });

    it('rejects extra unexpected fields if schema uses .strict()', () => {
      const result = CreateItemSchema.strict?.().safeParse({
        ...validCreateInput,
        injectedField: 'exploit',
      });
      if (result) expect(result.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 4: INJECTION VECTORS (SECURITY)
  // ═══════════════════════════════════════════
  describe('Injection Vectors', () => {
    // Zod doesn't sanitize HTML — verify content is treated as plain text
    it('accepts HTML strings without transformation (caller must sanitize for output)', () => {
      const html = '<script>alert("xss")</script>';
      const result = CreateItemSchema.safeParse({ ...validCreateInput, content: html });
      // Schema ACCEPTS it (storage is fine), but output layer must escape it
      if (result.success) expect(result.data.content).toBe(html);
    });

    it('accepts SQL-like strings (Appwrite SDK uses parameterized queries)', () => {
      const sql = "'; DROP TABLE items; --";
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: sql });
      if (result.success) expect(result.data.title).toBe(sql);
    });
  });

  // ═══════════════════════════════════════════
  // CLASS 5: TYPE COERCION
  // ═══════════════════════════════════════════
  describe('Type Coercion', () => {
    it('does not coerce numbers to strings for title', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, title: 123 });
      expect(result.success).toBe(false);
    });

    it('does not coerce string "true" to boolean for published status', () => {
      const result = CreateItemSchema.safeParse({ ...validCreateInput, status: 'true' });
      expect(result.success).toBe(false);
    });
  });
});

// -------------------------------------------------------------------
// UpdateItemSchema
// -------------------------------------------------------------------
describe('UpdateItemSchema', () => {
  describe('Happy Path', () => {
    it('accepts a partial update with only title', () => {
      const result = UpdateItemSchema.safeParse({ title: 'New Title' });
      expect(result.success).toBe(true);
    });

    it('accepts a partial update with only status', () => {
      const result = UpdateItemSchema.safeParse({ status: 'published' });
      expect(result.success).toBe(true);
    });
  });

  describe('Validation Rules Still Apply', () => {
    it('still rejects empty title even in partial update', () => {
      const result = UpdateItemSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });

    it('still rejects invalid status even in partial update', () => {
      const result = UpdateItemSchema.safeParse({ status: 'pending' });
      expect(result.success).toBe(false);
    });
  });
});
```
