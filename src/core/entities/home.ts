const socials = ['twitter', 'github', 'linkedin', 'youtube'] as const;

export type SocialOption = (typeof socials)[number];

export interface SocialType {
  type: SocialOption;
  link: string;
}

export interface File {
  url: string;
  name: string;
}

export interface Home {
  name: string;
  lastName: string;
  title: string;
  aboutMeText: string;
  socials: SocialType[];
  journeyStart: number;
  cv?: File;
}
