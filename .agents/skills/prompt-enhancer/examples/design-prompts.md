# Design Prompt Examples — Stitch & Design System Transformations

---

## Example 1: Screen Generation

### User Input
> "generate a dashboard screen"

### Enhanced Output

```markdown
# Generate CMS Dashboard Screen — Stitch MCP

## Context
Need a new dashboard screen for the Admin CMS that shows key metrics,
recent activity, and navigation to content sections.

## Specialists Engaged
- **stitch-architect**: Stitch MCP screen generation, prompt enhancement
- **design-curator**: Design system tokens to inject
- **frontend-specialist**: Component specifications, spacing, color

## Stitch Prompt (Enhanced)
Dark-themed CMS dashboard with a sidebar navigation on the left and main content area.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first
- Theme: Dark, professional, high-density cockpit aesthetic
- Background: Deep charcoal (#0A0A0B)
- Card surfaces: Elevated charcoal (#141416) with 1px border (#27272A)
- Primary accent: Electric blue (#3B82F6) for CTAs and active states
- Text primary: Off-white (#FAFAFA)
- Text secondary: Muted gray (#A1A1AA)
- Typography: Geist Sans, 14px base, tight tracking on headings
- Radius: 12px cards, 8px buttons, 6px inputs
- Shadows: Subtle, low-opacity for depth without glare

**Page Structure:**
1. **Sidebar (240px):** Logo, nav groups (Home, About, Skills), user avatar at bottom
2. **Header:** Breadcrumb + page title "Dashboard" + date range selector
3. **Metrics Grid (4 cols):** Total views, projects, skills, contact requests
4. **Activity Chart:** Line chart showing views over last 30 days
5. **Recent Items (2 cols):** Recent edits + recent messages

## Scope
- **WILL change**: New Stitch screen generated
- **MUST NOT change**: Existing screens in the project

## Success Criteria
- [ ] Screen matches the design system tokens
- [ ] Layout follows the specified structure
- [ ] Dark theme applied correctly
- [ ] Typography hierarchy visible

## Governance
- UI Red Flag: Only generate, don't modify existing screens
```

---

## Example 2: Design System Creation

### User Input
> "create a design system for the portfolio"

### Enhanced Output

```markdown
# Create Application Design System — DESIGN.md Synthesis

## Context
The application needs a unified design system that governs all screens —
CMS admin UI, public-facing views, and AI-generated Stitch screens.

## Specialists Engaged
- **design-curator**: Atmosphere spectrum, DESIGN.md template, anti-pattern governance
- **frontend-specialist**: Color calibration, typography scale, spring physics
- **stitch-architect**: Stitch design system MCP integration

## Requirements
1. **Atmosphere**: Density 7/10 (cockpit), Variance 5/10 (balanced), Motion 6/10 (fluid).
2. **Color Palette**: 
   - Hue: 240 (cool blue undertone for neutrals)
   - Primary: 217° blue, S 72%, L 50% (light) / 55% (dark)
   - Neutrals tinted with brand hue (H=240, S=5%)
   - Max 2 accent colors
3. **Typography**: Geist Sans (body), Outfit (display), Geist Mono (code). Major Third scale.
4. **Components**: Premium button styles, glass cards, animated inputs.
5. **Motion**: 15 spring presets (from frontend-specialist recipe catalog).
6. **Anti-patterns**: Ban neon, ban pure black/white, ban linear easing.

## Deliverables
- `.stitch/DESIGN.md` — full design system document
- Stitch MCP: `create_design_system` with extracted tokens

## Success Criteria
- [ ] DESIGN.md covers all 7 sections (atmosphere, color, typo, components, layout, motion, anti-patterns)
- [ ] Dark mode section with inverted tokens
- [ ] Applied to Stitch project via MCP

## Governance
- ≤ 2 accent colors
- Typography mathematically derived
- All motion uses spring physics
```

---

## Example 3: Theme Editing

### User Input
> "change the primary color to teal"

### Enhanced Output

```markdown
# Update Primary Color — Teal Brand Migration

## Context
Changing the primary brand color from blue (217°) to teal (175°).
This affects ALL components using the primary token.

## Specialists Engaged
- **design-curator**: Color calibration, palette regeneration
- **frontend-specialist**: HSL formulas, contrast verification
- **stitch-architect**: Stitch design system update
- **tailwind-architect**: @theme token update

## Technical Requirements
1. **New primary**: HSL 175° 72% 50% (light) / 175° 72% 55% (dark).
2. **Regenerate**: Full primary scale (50-950) using palette generation algorithm.
3. **Verify contrast**: APCA Lc ≥ 60 for primary on background.
4. **Update**: @theme block in CSS, DESIGN.md, Stitch design system.
5. **Audit**: All components using `primary` token render correctly.

## Scope
- **WILL change**: Primary color token in @theme, DESIGN.md, Stitch design system
- **MUST NOT change**: Layout, typography, spacing, component structure, secondary colors

## Success Criteria
- [ ] All `primary` usage renders in teal
- [ ] Contrast meets APCA requirements
- [ ] Dark mode primary looks correct
- [ ] Stitch design system updated
- [ ] `pnpm guard` passes

## Governance
- Color change propagates through tokens only
- No hardcoded hex values
- Verify contrast for ALL primary usage contexts
```

---

## Example 4: Variant Generation

### User Input
> "generate alternative versions of the login screen"

### Enhanced Output

```markdown
# Generate Login Screen Variants — Design Exploration

## Context
Exploring alternative designs for the login screen to find the best aesthetic
direction before committing to implementation.

## Specialists Engaged
- **stitch-architect**: Stitch MCP `generate_variants` tool
- **design-curator**: Ensure variants stay within design system bounds

## Technical Requirements
1. Use `generate_variants` with the login screen ID.
2. Generate 3 variants with `creativeRange: 'MEDIUM'`.
3. Focus areas: `['LAYOUT', 'COLOR', 'TYPOGRAPHY']`.
4. Keep the design system applied — variants should differ in arrangement, not in tokens.

## Scope
- **WILL change**: New variant screens generated
- **MUST NOT change**: Original login screen

## Success Criteria
- [ ] 3 distinct variants generated
- [ ] All variants use the same design system tokens
- [ ] Variants offer meaningfully different layouts
- [ ] Original screen preserved

## Governance
- Variants must stay within design system bounds
- No neon colors or system fonts in variants
- Present all variants to user for selection
```
