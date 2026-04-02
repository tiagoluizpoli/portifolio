# Quickstart: Zenith Hub Shell & Infrastructure

This document provides immediate setup instructions for the **Administrative Shell** and the **7 Portfolio entities**.

## 1. Local Environment Setup

Ensure your `.env` in `apps/zenith` contains the necessary Appwrite endpoints:
```bash
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
# Appwrite Server Secret (Only for local dev server functions)
APPWRITE_API_KEY=your_api_key
```

## 2. Infrastructure Initialization

The Zenith Hub relies on the following Appwrite Collections (migrated via the `migrator` service):
1. **Home**: `home`
2. **Experience**: `experience`
3. **Education**: `education`
4. **Skills**: `skills`
5. **Solutions**: `solutions`
6. **Socials**: `socials`
7. **Contact**: `contact`
8. **System Config**: `config` (New for Shell)

Run the migrator to ensure these exist:
```bash
pnpm --filter @repo/migrator start
```

## 3. Development Workflow

1. **Start Zenith**:
   ```bash
   pnpm --filter zenith dev
   ```
2. **Verify Shell**:
   - Access `http://localhost:5173`.
   - Toggle the Sidebar and verify `ClientOnly` hydration safety.
   - Use `Command-K` to navigate between Dashboard and Settings.

## 4. Key Performance Indicators (Phase 1)
- **Time to Interactivity**: < 500ms (Hydration safety).
- **Shell Symmetry**: 100% item-stretch alignment.
- **Persistence**: Settings must save to Appwrite `config` via Server Functions.
