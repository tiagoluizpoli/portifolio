import { Link, useLocation } from 'react-router-dom';
import { links } from './nav-commons';

export const Nav = () => {
  const location = useLocation();

  return (
    <nav className="flex gap-8">
      {links.map((link, index) => {
        return (
          <Link
            key={index}
            to={link.path}
            className={`${link.path === location.pathname && 'text-accent'} capitalize font-medium hover:text-accent transition-all`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
};
