# Section Audit: Home Section (Hero Identity)

## Current Implementation vs Requirement

| Feature | Requirement | Current State | Status |
| :--- | :--- | :--- | :--- |
| **Grid Layout** | 1:1 Split (`lg:grid-cols-2`) | 2:1 Split (`lg:grid-cols-3`) | **VIOLATION** |
| **Journey Input** | Precision Number Field | `Slider` component | **VIOLATION** |
| **Input UX** | Disable Browser Spinners | Standard browser behavior | **MISSING** |
| **Asset Previews** | High-Fidelity Asset Cockpit | Side panel with basic image/pdf | **MODERATE** |

## Required Technical Adjustments

### 1. Grid Correction (`home-form.tsx`)
- Change container from `lg:grid-cols-3 gap-8` to `lg:grid-cols-2 gap-12`.
- Form (`HomeFormInner`) should take 1 column, Asset Cockpit should take 1 column.

### 2. Input Refactor
- Swap `Slider` for a custom `Input` with `type="number"`.
- Add CSS to hide spinners globally for these administration forms.

### 3. Layout Precision
- Column separation must be strictly 50/50 on desktop to match the "Architectural" feel of the brief.

[← Back to Report](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/analysis/zenith_cms_sync/report.md)
