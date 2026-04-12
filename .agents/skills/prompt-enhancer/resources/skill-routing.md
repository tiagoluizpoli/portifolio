# Skill Routing — Complete Specialist Registry

This document integrates the `find-skills` intelligence directly into the prompt-enhancer. No separate routing step needed — classification triggers engagement automatically.

---

## Routing Table

### Frontend/UI Specialists

| Trigger Keywords | Skill | Provides |
|:---|:---|:---|
| `UI`, `UX`, `design`, `aesthetic`, `animation`, `color`, `typography`, `motion`, `hover`, `transition`, `dark mode`, `glassmorphism`, `gradient` | `frontend-specialist` | HSL color calibration, typography math scales, spring physics configs, APCA accessibility, 4px grid enforcement |
| `React`, `component`, `hook`, `state`, `pattern`, `composition`, `compound`, `render prop`, `polymorphic`, `memo`, `Suspense`, `Error Boundary` | `react-architect` | 10 component patterns, hooks encyclopedia, performance optimization, state management framework, 300-line limit |
| `CSS`, `Tailwind`, `style`, `responsive`, `theme`, `token`, `@theme`, `utility`, `breakpoint`, `dark mode class`, `deprecated` | `tailwind-architect` | v4 CSS-first config, 50+ deprecated class migration, @theme tokens, @utility/@variant directives |
| `Dialog`, `Form`, `Shadcn`, `Radix`, `Select`, `Combobox`, `DataTable`, `Sheet`, `Drawer`, `Toast`, `Badge`, `Command` | `shadcn-specialist` | Complete component catalog, Radix primitive knowledge, composition patterns, form integration |

### Design Specialists

| Trigger Keywords | Skill | Provides |
|:---|:---|:---|
| `design system`, `DESIGN.md`, `palette`, `branding`, `atmosphere`, `anti-pattern`, `visual DNA` | `design-curator` | DESIGN.md template, atmosphere spectrum, color/typo/motion standards, anti-slop enforcement |
| `Stitch`, `screen`, `generate`, `MCP`, `variant`, `apply design`, `edit screen` | `stitch-architect` | Stitch MCP integration, prompt enhancement for AI, UI Red Flag Protocol, design system application |

### Backend Specialists

| Trigger Keywords | Skill | Provides |
|:---|:---|:---|
| `Appwrite`, `database`, `auth`, `storage`, `permission`, `collection`, `document`, `bucket`, `session`, `migration`, `seed`, `query` | `appwrite` | v22.1.3 SDK patterns, permission models, Zod schema validation, error handling |

### Architecture Specialists

| Trigger Keywords | Skill | Provides |
|:---|:---|:---|
| `route`, `loader`, `server function`, `Start`, `TanStack`, `hydration`, `SSR`, `streaming` | `tanstack-master` | TanStack Start patterns, hydration-safe components, server function architecture |
| `review`, `SOLID`, `clean code`, `architecture`, `refactor`, `god class`, `coupling`, `cohesion` | `code-review` | Architecture audit, SOLID compliance, constitution verification |

### Testing Specialists

| Trigger Keywords | Skill | Provides |
|:---|:---|:---|
| `test`, `vitest`, `mock`, `appwrite mock`, `schema validation`, `backend test` | `test-backend` | Vitest patterns, Appwrite mocking, schema assertions |
| `RTL`, `render`, `component test`, `interaction test`, `frontend test`, `user event` | `test-frontend` | React Testing Library, component logic testing, interaction patterns |
| `e2e`, `playwright`, `user journey`, `integration test`, `full flow` | `test-e2e` | Playwright patterns, full user-journey verification |
| `coverage`, `quality gate`, `threshold`, `report` | `test-coverage` | Coverage analysis, quality gate enforcement |

### DevOps Specialists

| Trigger Keywords | Skill | Provides |
|:---|:---|:---|
| `commit`, `git`, `branch`, `merge`, `release`, `changelog`, `semantic` | `git-commit` | Semantic commit workflow, safety-stash, granular logical intent |

### Google Stitch Skills (External — `gstitch-*`)

| Trigger Keywords | Skill | Provides |
|:---|:---|:---|
| `enhance prompt`, `Stitch prompt`, `optimize prompt` | `gstitch-enhance` | Raw Stitch prompt optimization with UI/UX keywords |
| `DESIGN.md generation`, `analyze Stitch project` | `gstitch-design-md` | Stitch project analysis → DESIGN.md synthesis |
| `stitch loop`, `iterative`, `baton passing` | `gstitch-loop` | Autonomous iterative website construction |
| `walkthrough video`, `remotion`, `screen recording` | `gstitch-remotion` | Video generation from Stitch projects |
| `convert to React`, `Stitch to code` | `gstitch-components` | Stitch design → React component conversion |

---

## Squad Presets

For common task categories, engage these pre-defined squads:

### Frontend Squad (UI/visual work)
```
frontend-specialist + react-architect + tailwind-architect + shadcn-specialist
```

### Full Design Squad (design system + generation)
```
design-curator + stitch-architect + frontend-specialist
```

### Full Stack Squad (features touching both UI and data)
```
frontend-specialist + react-architect + shadcn-specialist + appwrite + tanstack-master
```

### Quality Squad (review + testing)
```
code-review + test-backend + test-frontend + test-coverage
```

### Infrastructure Squad (backend-only changes)
```
appwrite + tanstack-master + test-backend
```
