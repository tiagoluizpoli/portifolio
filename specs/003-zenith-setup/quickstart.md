# Quickstart: Zenith Setup

## Prerequisites
- Node.js 20+ / Bun
- pnpm 8+
- Appwrite Cloud account (for API keys)

## Initialization

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in the following:
   ```env
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_secret_api_key
   VITE_APPWRITE_PROJECT_ID=your_project_id
   ```

3. **Run Development Server**:
   ```bash
   pnpm zenith:dev
   ```

4. **Verify Setup**:
   - Access `http://localhost:5173/`
   - Verify the TanStack Start dashboard loads.
   - Run `pnpm zenith:typecheck` to confirm E2E type safety.

## Common Tasks
- **Add a Route**: Create `{route_name}.tsx` in `apps/zenith/src/routes/`.
- **Add a Service**: Implement it in `packages/appwrite-core/src/infrastructure/`.
- **Run Audit**: `pnpm zenith:lint && pnpm zenith:test`.
