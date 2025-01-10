import { DynamicIcon } from '@/components';
import type { SocialType } from '@/core';

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
            <DynamicIcon lib={social.iconLib} name={social.iconCode} />
          </Link>
        );
      })}
    </div>
  );
};
