import type { Lib } from '@/components';

const socials = ['twitter', 'github', 'linkedin', 'youtube'] as const;

export type SocialOption = (typeof socials)[number];

export interface SocialType {
  type: SocialOption;
  iconLib: Lib;
  iconCode: string;
  url: string;
}

export interface Home {
  firstName: string;
  lastName: string;
  picture: string;
  title: string;
  description: string;
  socials: SocialType[];
  JourneyStartedIn: number;
  cv?: string;
}
