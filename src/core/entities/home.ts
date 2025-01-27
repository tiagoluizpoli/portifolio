import type { Translatable } from './shared';

const socials = ['twitter', 'github', 'linkedin', 'youtube'] as const;

export type SocialOption = (typeof socials)[number];
export interface Github {
  totalCommits: number;
  totalRepositories: number;
}

export interface SocialType {
  type: SocialOption;
  iconCode: string;
  url: string;
}

export interface HomeTranslation extends Translatable {
  id: number;
  namePresentation: string;
  title: string;
  description: string;
  downloadButtonText: string;
  cv: string;
}

export interface Home {
  firstName: string;
  lastName: string;
  picture: string;
  title: string;
  description: string;
  socials: SocialType[];
  github: Github[];
  JourneyStartedIn: number;
  cv?: string;
  translations: HomeTranslation[];
}
