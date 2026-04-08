# Specification: Portfolio Manager UI

## 1. Overview & Goal
Implement a high-fidelity **Portfolio Manager** within the Zenith Administrative Shell to manage the entire portfolio landing page. This interface allows for comprehensive orchestration of the 7 portfolio chapters, ensuring data integrity and bilingual maturity across the Appwrite database.

The design strictly follows the **Oceanic Obsidian** aesthetic: borderless, tonal, and editorial.

---

## 2. User Scenarios

### **SC-001: Portfolio Navigation**
**Actor**: Administrator
**Goal**: Switch between landing page sections for focused editing.
**Flow**:
1. Admin uses the vertical "Section Sidebar" (Manrope typography) to select a section (e.g., "Skills").
2. The main editor workspace updates instantly with a cross-fade transition.
3. The "Validation Strip" at the bottom shows the current translation maturity for that section.

### **SC-002: Icon Selection**
**Actor**: Administrator
**Goal**: Add a new skill with the correct brand icon.
**Flow**:
1. Admin clicks "Add Skill" in the Skills section.
2. An integrated `IconPicker` overlay appears.
3. Admin types "Node.js" and sees instant previews from the Iconify `logos` set.
4. Admin selects the icon; the `logos:nodejs-icon` ID is automatically mapped to the schema.

### **SC-003: Reordering (Drag-and-Drop)**
**Actor**: Administrator
**Goal**: Reorder professional experience items.
**Flow**:
1. Admin hovers over an Experience card.
2. A high-fidelity "Grab" handle appears.
3. Admin drags the item to a new position.
4. The UI performs a smooth layout transition (no jitter), and the `sort` field is updated in the background.

### **SC-004: Bilingual Maturity Lock**
**Actor**: Administrator
**Goal**: Toggle a language to "Live" status.
**Flow**:
1. Admin toggles the Global Language Switcher.
2. The system audits all 7 chapters for missing values.
3. If any required field is missing, the "Go Live" toggle is disabled with a list of "Incomplete Sections."
4. Once 100% maturity is reached, the language can be toggled to "Published."

### User Scenario: The Portfolio Manager
"As a Portfolio Owner, I want to edit each section of my landing page using a simple, high-fidelity interface that reflects the actual structure of my site."

---

## 3. Functional Requirements

### FR-001: The 7 Chapters
The Portfolio Manager must provide dedicated editors for:
1. **Home**: Hero section metadata, profile name, title, and assets.
2. **About**: Personal narrative and basic stats.
3. **Experience**: Professional history with kinetic reordering.
4. **Education**: Academic history with kinetic reordering.
5. **Skills**: Skill list with category and icon selection.
6. **Solutions**: Service offerings with icon selection.
7. **Contact**: Social links and contact information.

### **FR-002: Integrated Icon Curation**
- The system **MUST** implement an `IconPicker` that interfaces with the Iconify API (or local sets).
- Users **MUST** be able to search and preview icons before assignment.

### **FR-003: Kinetic Sorting (DND)**
- The system **MUST** use a high-fidelity drag-and-drop library (e.g., `dnd-kit`) for reordering items.
- Sorting **MUST** be smooth, accessible, and performant (no layout shift).

### **FR-004: Assets (Storage)**
- The system **MUST** provide an uploader for:
    - Profile Picture (Image).
    - CV/Resume (PDF).
- Uploads **MUST** interface with Appwrite Storage and return the `fileId` for schema storage.

### **FR-005: Bilingual Integrity**
- The system **MUST** enforce a **Maturity Lock**: A language branch (EN/PT) cannot be activated unless all mandatory fields are translated.
- The UI **MUST** display a progress indicator for the current language's maturity.

---

## 4. Architecture-Level Test Plan (Principle XVIII)

This plan ensures testability is an architectural constraint through BDD and TDD.

### BDD Scenarios (Playwright)
- **Feature: Kinetic Sorting**
    - **Scenario**: Successful drag-and-drop reordering.
    - **Step**: Admin drags "Company A" above "Company B".
    - **Verify**: The visual order updates immediately, and a PUT request to the repository is triggered with the new `sort` order.
- **Feature: Bilingual Maturity Lock**
    - **Scenario**: Prevent activation of incomplete language.
    - **Step**: Admin attempts to toggle "PT" to Live while "About" section is missing PT data.
    - **Verify**: Toggle is disabled and an "Incomplete: About" tooltip appears.

### TDD Strategy (Vitest)
- **Unit Tests**:
    - `MaturityAuditService`: Verify 0-100% calculation logic for all 7 chapters.
    - `BaseCmsRepository`: Verify transactional integrity of the `sort` update operations.

---

## 5. Security Boundary Mapping (Principle XX)

| Layer | Responsibility | Security Boundary |
| :--- | :--- | :--- |
| **Client (React)** | UI State, DND feedback, Form validation | Non-authoritative; visual logic only. |
| **Server (TanStack Start)** | `server-functions` for Appwrite mutations | **AUTHORITATIVE**. All data mutation calls MUST be validated for session and permissions before repository access. |
| **Infrastructure (Appwrite)** | Persistence, Auth, Storage | Final security gate via Appwrite Server SDK. |

---

## 6. Success Criteria

### **Quantitative Metrics**
- **Zero Incomplete Fragments**: 0% of "Live" entities can have missing translations in an active language.
- **Sorting Latency**: Drag interactions must maintain **60 FPS** on standard hardware.
- **Maturity Check**: Full-repo translation audit must complete in under **300ms**.

### **Qualitative Measures**
- **Executive Feel**: The editor environment feels robust and high-end, using `surface-container-low` for focused control.
- **Accessibility**: All DND and Icon Picker features are keyboard navigable.

---

## 7. Key Entities (Expanded)

| Entity | Attribute | Integration |
| :--- | :--- | :--- |
| **Home** | `profilePictureId` | Assets (Storage) |
| **Skill** | `icon` | Icon Picker (Iconify) |
| **Social** | `icon` | Icon Picker (Iconify) |
| **Experience** | `sort` | Kinetic DND |

---

## 8. Assumptions & Bounded Scope
- **Assumed**: Appwrite is the single source of truth for all 7 tables.
- **Bound**: This spec addresses the UI/UX behavior and state management of the Portfolio Manager. Server-side API implementation for the 7 new tables is assumed to follow the established `PortfolioItem` pattern.
