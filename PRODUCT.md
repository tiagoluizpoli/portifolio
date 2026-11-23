# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro SSR (`@astrojs/node` standalone), React islands only where needed, Tailwind v4, pnpm, Node 24. Content in the Shared Postgres; assets in a public-read RustFS bucket. Decided on the Portfolio v2 map (issue #14), "Choose the rendering architecture and framework".

## Users

Primary: tech recruiters and hiring managers (Brazil and international, remote roles), skimming fast between other candidates, often from a LinkedIn link, on a laptop or phone. Secondary: prospective freelance or side-project clients.

## Product Purpose

Tiago Luiz Poli's personal portfolio: one bilingual (EN at `/`, PT at `/pt/`) landing page. Success: the visitor opens a WhatsApp conversation or downloads the CV.

## Positioning

He builds and runs real products end to end, and this page is the proof. Three supports, together: Showcase projects that are live in production (Church first); ownership from frontend to backend to the infra they run on (own VPS, Dokploy, CI/CD); and the page's own craft (performance, SEO, accessibility, design).

## Operating Context

Visitors arrive from LinkedIn, CV links, or search. They decide in seconds whether to read on. GitHub stats are served live by the page's own Node service.

## Capabilities and Constraints

- Sections, in order (provisional): Hero (name, "Senior Software Engineer", one-line pitch, photo, "São Paulo, Brazil · Remote", CTAs WhatsApp + Download CV, 3 GitHub stats: contributions in the last year, public repos, top languages) → Showcase projects → Experience → Skills → About (with Education) → Contact/footer.
- Showcase project: title, 1–2 sentence summary, role, stack tags, 1–3 images, "Learn more" link to its public landing page; Showcase status *In production · Actively developed* / *In production* / *Coming soon*, optional "Now:" line.
- Slim sticky header, anchor links, PT/EN toggle; menu on mobile.
- No contact form, no Solutions section, no years-of-experience counter, no pinned repos, no testimonials.
- Content edited as JSON in Postgres; every text field bilingual.

## Brand Commitments

None. v1's look is reference only, to move away from.

## Evidence on Hand

- Content source: LinkedIn capture (in the `job-hunting` repo, `profile/`, 2026-08-20). Current role Coforge.
- v1 published content snapshot on branch `snapshot/v1-content`.
- Photo and CV: owner will supply (v1 files lost). Showcase project images: to be supplied.
- No testimonials, client logos, or metrics beyond GitHub stats. Do not invent any.

## Product Principles

- Prove, don't claim: live products and live stats over adjectives.
- Respect the skim: a recruiter knows who, what level, and how to reach him within one viewport.
- The page is part of the portfolio: fast, accessible, SEO-solid.
- Simplest thing that fully works.

## Accessibility & Inclusion

WCAG 2.2 AA; respect `prefers-reduced-motion` (count-up and reveals included).
