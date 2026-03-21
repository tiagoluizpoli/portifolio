# Research: Zenith Setup

## Decision Log

### Decision: Native Latest Synchronization (FR-001)
- **Decision**: Standardize on `"latest"` tags in `package.json` for all `@tanstack/` scoped packages.
- **Rationale**: The Version 1 Release Candidate (RC) cycle frequently updates core dependencies (e.g., `router-core`) that need to stay in sync with the `start` plugin. Partial pinning led to manifest regressions (`activeMatchesSnapshot`).
- **Alternatives considered**: 
  - **Stoichiometric Pinning**: Rejected as it requires manual maintenance of internal peer dependencies that TanStack is currently rapid-firing.
  - **Vinxi Wrapper**: Rejected as it hides the underlying Vite config, violating Principle XVI.2.

### Decision: Structured JSON Logging (FR-013)
- **Decision**: Implement a minimal P8-compatible JSON logger in Core using standard `console.log`.
- **Rationale**: Facilitates observability without adding heavy 3rd-party dependencies (Pino/Winston) during the setup phase.
- **Structure**: `{ "level": "INFO|ERROR", "timestamp": "ISOstring", "msg": "...", "ctx": { ... } }`

### Decision: Static Startup Error Page (FR-011)
- **Decision**: A raw `dist-static/error.html` generated during build or a zero-dependency `.js` file loaded via `<script type="module">` in a minimal index.
- **Rationale**: If environment variables are missing, the React tree might fail to initialize entirely. A static page ensures visibility regardless of framework state.

## Tech Stack Best Practices
- **React 19**: Use `ref` as a standard prop (no `forwardRef`).
- **Tailwind v4**: Use `@theme` in `index.css` for variable definition.
- **TanStack Start**: Use `createServerFn` with direct `Zod` schema passing for request validation.
