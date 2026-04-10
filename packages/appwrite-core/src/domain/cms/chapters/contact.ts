/**
 * Contact Domain Model (Constitution §XVII)
 * Section 07: Professional Outreach.
 */

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconId: string;
  active: boolean;
  sort: number;
}

export interface ContactData {
  id: string;
  locale: string;
  email: string;
  phone: string;
  location: string;
  socials: SocialLink[];
}
