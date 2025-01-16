'use client';

import { CiMenuFries } from 'react-icons/ci';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '../ui/sheet';
import { links } from './nav-commons';

export const MobileNav = () => {
  const location = useLocation();

  return (
    <Sheet>
      <SheetTrigger className="flex items-center justify-center">
        <CiMenuFries className="text-[32px] text-accent" />
      </SheetTrigger>
      <SheetTitle />

      <SheetContent className="flex flex-col">
        {/* logo */}
        <div className="mt-32 mb-40 text-2xl text-center">
          <Link to={'/'}>
            <h1 className="text-4xl font-semibold">
              Tiago<span className="text-accent">.</span>
            </h1>
          </Link>
        </div>

        {/* nav */}
        <nav className="flex flex-col items-center justify-center gap-8">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className={`${link.path === location.pathname && 'text-accent border-b-2 border-accent'} text-xl capitalize hover:text-accent transition-all`}
            >
              <SheetClose>{link.name}</SheetClose>
            </Link>
          ))}
        </nav>
      </SheetContent>
      <SheetDescription />
    </Sheet>
  );
};
