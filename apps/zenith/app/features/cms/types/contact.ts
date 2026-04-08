/**
 * Contact & Socials Entity Types (Constitution §XV, §I)
 * The final chapter of the Portfolio Manager.
 */

export type SocialType =
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'twitch'
  | 'dribbble'
  | 'behance'
  | 'other';

export interface SocialLink {
  id: string;
  type: SocialType;
  url: string;
  active: boolean;
}

export interface ContactData {
  id: string;
  email: string;
  phone: string;
  location: string;
  socials: SocialLink[];
}

export type ContactFormState = Omit<ContactData, 'id'>;

export const EMPTY_CONTACT: ContactFormState = {
  email: '',
  phone: '',
  location: '',
  socials: [],
};
