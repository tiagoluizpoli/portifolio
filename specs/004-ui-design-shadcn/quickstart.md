# Quickstart: Zenith UI Development

## Prerequisites
- `pnpm` installed.
- StitchMCP server active.
- TanStack Router/Start environment in `apps/zenith`.

## UI Generation Workflow
1. **Layout**: Generate `__root.tsx` using the Layout Prompt.
2. **Dashboard**: Generate `index.tsx` using the Dashboard Prompt.
3. **Screen Map**: Refer to `screen-map.md` for detailing each management section.
4. **Iterate**: Use `stitch_edit_screens` for refinements.

## Commands
- **Lint**: `pnpm -C apps/zenith lint`
- **Dev**: `pnpm -C apps/zenith dev`
- **Build**: `pnpm -C apps/zenith build`
