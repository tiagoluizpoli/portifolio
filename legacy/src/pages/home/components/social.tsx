import type { SocialType } from '@/core';
import { Icon } from '@iconify/react/dist/iconify.js';

import { Link } from 'react-router-dom';

interface Props {
  socials?: SocialType[];
  containerStyles?: string;
  iconStyles?: string;
}

export const Social = ({ socials, containerStyles, iconStyles }: Props) => {
  return (
    <div className={containerStyles}>
      {socials?.map((social, index) => {
        return (
          <Link key={index} to={social.url} target="_blank" className={iconStyles}>
            <Icon icon={social.iconCode} />
          </Link>
        );
      })}
    </div>
  );
};
