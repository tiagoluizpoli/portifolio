/**
 * Platforms Domain Model (Constitution §XVII)
 * Defines the managed social and professional networks used for Contact/Links.
 */

export interface Platform {
  id: string;
  title: string;
  urlTemplate: string; // e.g. "https://github.com/{username}"
  iconCode: string;
  iconId?: string;
  status: 'active' | 'archived';
  sort?: number;
}
