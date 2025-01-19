import { useHomeQuery } from '@/core';
import { useLangContext } from '@/providers/lang';
import { useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '../transtions/language-selector';
import { Button } from '../ui/button';
import { MobileNav } from './mobile-nav';
import { Nav } from './nav';

export const Header = () => {
  const { data, isLoading, isFetching } = useHomeQuery();
  const { lang } = useLangContext();

  const matches = useMediaQuery('(min-width: 1200px)');

  if (isLoading || isFetching) {
    return <div className="flex justify-center">Loading...</div>;
  }

  if (!data) {
    return <div className="flex justify-center">No Data</div>;
  }
  const hireMeButton = lang === 'en-US' ? 'Get in touch' : 'Entre em contato';

  return (
    <header className="py-8 text-white xl:py-12">
      <div className="container flex items-center justify-between mx-auto">
        <div className="flex gap-2">
          <Link to={'/'}>
            <h1 className="text-4xl font-semibold capitalize">
              {data.firstName}
              <span className="text-accent">.</span>
            </h1>
          </Link>
          {matches && <LanguageSelector />}
        </div>

        {/* Desktop Nav & Hire me button */}
        <div className="flex gap-4">
          <div className="items-center hidden gap-8 xl:flex">
            <Nav />
            <Link to={'/contact'}>
              <Button>{hireMeButton}</Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="xl:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
};
