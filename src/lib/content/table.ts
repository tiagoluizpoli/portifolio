import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const content = pgTable('content', {
  key: text('key').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
