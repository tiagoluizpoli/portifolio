# Research: Appwrite Wiring & CMS Orchestration

## Decision 1: Form Management & Validation
- **Decision**: Use **TanStack Form** with **Zod** for all sections.
- **Rationale**: 
    - Full React 19 / TanStack Start compatibility.
    - Type-safe field access and validation.
    - User explicitly requested this stack.
- **Alternatives Considered**: React Hook Form (Rejected per user request).

## Decision 2: Persistence Layer
- **Decision**: Centralize all Appwrite IO in `@repo/appwrite-core` using the **Repository Pattern**.
- **Rationale**: 
    - Satisfies Constitution Principle XV (Infrastructure Invisibility).
    - Ensures the DB structure (row-based for Contact Info) doesn't leak into the Zenith application logic.
    - Allows for transactional updates in the future if needed.
- **Implementation**: Create `HomeRepository`, `SkillRepository`, `SolutionRepository`, etc.

## Decision 3: Data Orchestration in UI
- **Decision**: Wrap Repository calls in **TanStack Start Server Functions** (`createServerFn`) and consume via **TanStack Query**.
- **Rationale**: 
    - Secure server-side execution of Appwrite Node SDK.
    - Automatic caching, invalidation, and loading state management.
    - Consistent pattern across the Zenith app.

## Decision 4: Specific Data Mappings
- **History (Exp/Edu)**: Map specific DB columns (`position`, `company`, `degree`, `institution`) to a unified `HistoryItem` type or specific `ExperienceItem`/`EducationItem` types.
- **Contact Info**: Transform the row-based `contact_info` table (type, value pairs) into a single domain object `ContactData { email, phone, location }` within the `ContactRepository`.
- **Socials**: Use consistent `active` field for lifecycle toggles.

## Open Questions Resolved
- Naming differences: Resolved per user's individual field decisions (Q2 responses).
- Form library: Resolved (TanStack Form).
- Storage: Resolved (Normalized Table for Impact Metrics).
