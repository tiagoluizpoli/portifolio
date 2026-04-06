# Research: Simplified Portfolio Manager (CMS)

## Findings

### 1. Naming Alignment
The "weird" names used previously have been mapped to their standard counterparts in the existing portfolio data sections:
- **Home**: (was Identity)
- **About**: (was Brief)
- **Experience**: (was part of Journey)
- **Education**: (was part of Journey)
- **Skills**: (was Arsenal)
- **Solutions**: (was Delivery)
- **Contact**: (was Access)

### 2. Portfolio Structure (Legacy Analysis)
The legacy portfolio (`legacy/src/pages`) reveals the following structure:
- `home`: Basic profile, stats, and social links.
- `resume`: Includes `skill-list` and experience/education data.
- `solutions`: Lists service offerings.
- `contact`: Basic contact form and links.

### 3. Appwrite Repository Pattern
The `packages/appwrite-core` current structure:
- `home.repository.ts`: Handles Home section.
- `about.repository.ts`: Handles About section.
- Need to implement: `experience.repository.ts`, `education.repository.ts`, `skills.repository.ts`, `solutions.repository.ts`, and `contact.repository.ts`.

## Technical Decisions
- **Framework**: React 19 / TanStack Start.
- **Form Handling**: Direct CRUD forms with bilingual inputs (`en`/`pt`).
- **Sorting**: Simple `sort` field reordering.
- **Visuals**: Oceanic Obsidian tokens (Dark mode, glassmorphism), but with simple, intuitive naming and structure.
