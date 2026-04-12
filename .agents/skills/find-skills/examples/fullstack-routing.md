# Full Stack Routing Example — Multi-Domain Feature

## Task
> "Build the full Social Links section of the CMS — users can add, edit, and reorder their social media links, each with an icon picker"

## Phase 1: Dynamic Discovery

Scan runs. Full manifest loaded. This is clearly multi-domain — social links touches UI (icon picker, drag-and-drop), data (Appwrite collection), and architecture (new CMS section).

Deep-reading: `appwrite`, `react-architect`, `shadcn-specialist`, `frontend-specialist`, `tailwind-architect`, `tanstack-master`

## Phase 2: Semantic Task Analysis

```
Dimension 1 – Domain:
  Visual/UI:     Icon picker dialog, drag-and-drop list, link form
  Data/Backend:  Social links collection, CRUD operations
  Architecture:  New CMS section, compound components, complex state

Dimension 2 – Artifact:
  NEW: apps/cms/routes/admin/social/route.tsx
  NEW: packages/ui/components/social-link-form.tsx
  NEW: packages/ui/components/icon-picker-dialog.tsx
  NEW: packages/ui/components/sortable-link-list.tsx
  NEW: packages/appwrite-core/social-links.functions.ts
  NEW: packages/appwrite-core/schemas/social-links.schema.ts
  MODIFY: Appwrite migration (new collection)

Dimension 3 – Technology:
  React (compound, drag state, sortable)
  shadcn (Dialog, Form, Input, Badge)
  Tailwind v4
  Appwrite (CRUD, permissions, collection)
  TanStack (route, loader, server functions)
  @dnd-kit or similar (drag-and-drop reorder)

Dimension 4 – Action Type:
  Create (all new — route, components, server functions, schema)

Dimension 5 – Risk:
  HIGH → Large surface area, new Appwrite collection, complex UI interactions
  New collection = migration risk. Drag-and-drop = interaction complexity.
```

## Phase 3: Squad Assembly

This is a multi-domain feature. All relevant skills score high:

| Skill | Match | Score |
|:---|:---|:---|
| `appwrite` | New collection, CRUD, permissions | PRIMARY |
| `react-architect` | Compound components, drag state, complex composition | PRIMARY |
| `shadcn-specialist` | Dialog + Form + Input used heavily | SUPPORTING |
| `tanstack-master` | New route, loader, server functions | SUPPORTING |
| `frontend-specialist` | Icon picker UX, drag feedback, a11y | SUPPORTING |
| `tailwind-architect` | v4 compliance across many new components | SUPPORTING |
| `test-backend` | New collection = needs schema + mutation tests | ADVISORY |
| `code-review` | High complexity = 300-line limit critical | ADVISORY |

⚠️ **Squad limit reached (5 active)**. Resolution: Split into phases.

**Phase 1 Squad (Backend + Schema):**
```
⚡ PHASE 1 SQUAD — Data Foundation:
  PRIMARY  → appwrite          (collection, schema, permissions, CRUD functions)
  PRIMARY  → tanstack-master   (server functions, loader, route structure)
  SUPPORT  → test-backend      (schema tests, mutation tests)
  ADVISORY → react-architect   (data shape that will drive component props)
```

**Phase 2 Squad (UI Components):**
```
⚡ PHASE 2 SQUAD — UI Implementation:
  PRIMARY  → react-architect    (SocialLink compound components, drag state)
  PRIMARY  → shadcn-specialist  (Dialog + Form + Input composition)
  SUPPORT  → frontend-specialist (icon picker UX, drag feedback, a11y)
  SUPPORT  → tailwind-architect  (v4 classes, dark mode, transition)
  ADVISORY → code-review         (300-line limit — many components)
```

## Phase 4: Composite Persona (Phase 2)

> "I am the **React Architect** and **Shadcn Specialist** at the core, with **Frontend Specialist** handling interaction quality.
>
> Architecture decisions:
> - `SocialLinksSection` (root: fetches data, passes to children)  
> - `SocialLinkList` (renders sortable list via @dnd-kit)  
> - `SocialLinkCard` (single link row: icon, url, edit, delete, drag handle)  
> - `SocialLinkDialog` (create/edit form using Form + FormField)  
> - `IconPicker` (searchable Command inside Dialog, returns iconName string)
>
> Each component ≤ 200 lines. Named exports. No default exports.
> Drag-and-drop uses `@dnd-kit/core` for accessibility-first drag.
> Icon picker uses shadcn `Command` for keyboard-accessible search."
