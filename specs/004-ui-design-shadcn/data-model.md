# Data Model: Zenith Portfolio Hub

## Appwrite Collections

### `projects`
Stores metadata for portfolio entries.
- `id` (string): Unique identifier.
- `title` (string): Project name.
- `description` (markdown): Detailed description.
- `mediaUrl` (url): Link to primary image/video.
- `tags` (string[]): Categorization tags.
- `status` (enum: `DRAFT`, `PUBLISHED`): Visibility status.
- `updatedAt` (datetime): Last modification time.

### `analytics`
Stores aggregate visitor interactions.
- `sessionId` (string): Anonymous session tracker.
- `path` (string): Page visited (e.g., `/projects/zenith`).
- `timestamp` (datetime): Time of visit.
- `duration` (integer): Seconds spent on page.
- `country` (string): ISO country code (e.g., `US`).
- `state` (string): Region/State (e.g., `CA`).

## Relationships
- A `Project` entry is tracked in `analytics` via the `path` field.
