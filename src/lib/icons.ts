import logos from '@iconify-json/logos/icons.json';
import { getIconData, iconToHTML, iconToSVG } from '@iconify/utils';

const prefix = 'logos:';

function iconData(id: string) {
  return id.startsWith(prefix) ? getIconData(logos, id.slice(prefix.length)) : null;
}

/** True for ids the page can render (`logos:<name>`); the Zod schema uses it so a typo fails boot. */
export const isKnownIcon = (id: string) => iconData(id) !== null;

/** Inline SVG markup for an Iconify id, rendered at build/server time. Empty string when unknown. */
export function iconSvg(id: string): string {
  const data = iconData(id);
  if (!data) return '';
  const { attributes, body } = iconToSVG(data, { height: '1.25em' });
  return iconToHTML(body, { ...attributes, 'aria-hidden': 'true' });
}
