# Zenith CMS Architectural Restoration: Gap Analysis Summary

## Overview
This report documents the architectural and visual discrepancies between the **Engineering Brief (v2.1.0)** and the current state of the Zenith Portfolio CMS implementation. These findings form the basis for the Restoration Plan.

## Discrepancy Breakdown

| Section | Deviation | Severity | spec.md Reference |
| :--- | :--- | :--- | :--- |
| **Hero Identity** | 2:1 Split (Current) vs 1:1 Split (Required) | P1 | US-3, FR-1 |
| **Hero Identity** | Slider (Current) vs Number Input (Required) | P1 | US-3 |
| **Socials** | Flat Strings (Current) vs Managed Entities (Required) | P1 | US-4 |
| **Socials** | Missing Platform Management Drawer | P1 | US-4 |
| **Impact Metrics** | Missing cross-locale Ghost Row auto-generation | P1 | US-2 |
| **Impact Metrics** | Missing `internalCode` parity enforcement | P1 | US-2 |
| **Skills** | Horizontal Layout (Current) vs Vertical Stacking (Required) | P2 | US-1 |
| **Branding** | Missing "Portfolio CMS" naming in global headers | P3 | Global Constraints |

## Detailed Reports
For granular details on each section, including exact file paths and proposed technical fixes, see the section reports below:

1. [**Home Section Details**](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/analysis/zenith_cms_sync/sections/home.md)
2. [**Socials & Platforms Details**](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/analysis/zenith_cms_sync/sections/socials.md)
3. [**Impact Metrics Details**](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/analysis/zenith_cms_sync/sections/metrics.md)
4. [**Skills Layout Details**](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/analysis/zenith_cms_sync/sections/skills.md)
5. [**Technical & Branding Details**](file:///home/tiago/01-dev-env/personal-repos/portifolio/.specify/analysis/zenith_cms_sync/sections/technical.md)

---
*Created per USER request for individual discussion of findings.*
