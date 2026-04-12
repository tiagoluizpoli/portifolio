# Backend Routing Example — Data Mutation with Auth

## Task
> "Users should be able to delete their own skills but not others' skills"

## Phase 1: Dynamic Discovery

Scan runs. 29 skills loaded into manifest. Deep-reading candidates for a data + permissions task:
`appwrite`, `tanstack-master`, `test-backend`, `react-architect`

## Phase 2: Semantic Task Analysis

```
Dimension 1 – Domain:
  Primary: Data/Backend (permissions, Appwrite operations)
  Secondary: Architecture (server function, optimistic update)
  Tertiary: Visual/UI (delete button conditional rendering)

Dimension 2 – Artifact:
  MODIFY: skills server function (delete handler)
  MODIFY: document permissions on create (add user-level write)
  MAYBE: skills list component (conditional delete button visibility)
  MAYBE: migration (update existing docs' permissions)

Dimension 3 – Technology:
  Appwrite (permissions, Role.user(), document operations)
  TanStack server function (delete mutation)
  React (conditional rendering of delete button)

Dimension 4 – Action Type:
  Create (new delete functionality)
  Fix (existing permissions are too permissive/restrictive)
  Migrate (update existing document permissions)

Dimension 5 – Risk:
  HIGH → Touches permissions (security), could expose or restrict data incorrectly
  Any permission bug could affect all existing skill documents
```

## Phase 3: Squad Assembly

| Skill | Match | Score |
|:---|:---|:---|
| `appwrite` | Core of the task — permissions model, Role.user(), deleteDocument | PRIMARY |
| `tanstack-master` | Server function for delete + loader invalidation | PRIMARY |
| `test-backend` | High-risk change → needs tests for permission scenarios | SUPPORTING |
| `react-architect` | Conditional rendering, optimistic update rollback | SUPPORTING |
| `code-review` | Security-sensitive → constitution compliance | ADVISORY |
| `frontend-specialist` | Minor (confirm dialog visual). Not primary focus | SKIP |

**Squad output:**
```
🔍 SKILL SCAN COMPLETE — 29 skills discovered

🧠 TASK ANALYSIS:
  - Domain: Data/Backend (permissions) + Architecture
  - Artifact: Delete server function, document permissions, skills list UI
  - Technology: Appwrite SDK, TanStack server function, React
  - Action: Create + Migrate (update existing docs)
  - Risk: HIGH (permission model affects data security)

⚡ SQUAD ASSEMBLED:
  PRIMARY  → appwrite          (permissions model, Role.user(), deleteDocument)
  PRIMARY  → tanstack-master   (server function, optimistic delete, invalidation)
  SUPPORT  → test-backend      (permission matrix tests — HIGH risk mandates testing)
  SUPPORT  → react-architect   (optimistic update + rollback pattern)
  ADVISORY → code-review       (security: never trust client-side permission checks)
```

## Phase 4: Composite Persona

> "I am the **Appwrite** specialist and **TanStack Master** working in concert, with **Test-Backend** expertise ensuring the security model is verified.
>
> For this implementation:
> 1. **Server function**: `deleteSkill` checks `account.get()` server-side, compares `userId` with the document's `$permissions`. Rejects if not owner — never trust the client.
> 2. **Permission on create**: `[Permission.read(Role.any()), Permission.write(Role.user(userId))]` — document-level, set at create time.
> 3. **Migration**: Update all existing skill documents to add user-level permissions.
> 4. **Client**: Show delete button only if `skill.userId === currentUser.$id`. Hide, don't disable.
> 5. **Tests**: Test matrix — owner can delete, non-owner gets 401, unauthenticated gets 401, wrong ID gets 404."
