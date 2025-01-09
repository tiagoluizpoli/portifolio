import type { SocialOption, SocialType } from '@/core';

import { FaGithub, FaLinkedin, FaTwitter, FaYoutube } from 'react-icons/fa';
import type { IconType } from 'react-icons/lib';
import { Link } from 'react-router-dom';

const socialIconMapper: Record<SocialOption, IconType> = {
  twitter: FaTwitter,
  github: FaGithub,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
};

interface Props {
  socials?: SocialType[];
  containerStyles?: string;
  iconStyles?: string;
}

export const Social = ({ socials, containerStyles, iconStyles }: Props) => {
  return (
    <div className={containerStyles}>
      {socials?.map((social, index) => {
        const Icon = socialIconMapper[social.type];
        return (
          <Link key={index} to={social.link} target="_blank" className={iconStyles}>
            <Icon />
          </Link>
        );
      })}
    </div>
  );
};
