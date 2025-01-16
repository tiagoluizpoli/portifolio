import { useHomeQuery } from '@/core';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { MobileNav } from './mobile-nav';
import { Nav } from './nav';

export const Header = () => {
  const { data, isLoading, isFetching } = useHomeQuery();
  if (isLoading || isFetching) {
    return <div className="flex justify-center">Loading...</div>;
  }

  if (!data) {
    return <div className="flex justify-center">No Data</div>;
  }

  return (
    <header className="py-8 text-white xl:py-12">
      <div className="container flex items-center justify-between mx-auto">
        <Link to={'/'}>
          <h1 className="text-4xl font-semibold capitalize">
            {data.firstName}
            <span className="text-accent">.</span>
          </h1>
        </Link>

        {/* Desktop Nav & Hire me button */}
        <div className="items-center hidden gap-8 xl:flex">
          <Nav />
          <Link to={'/contact'}>
            <Button>Hire me</Button>
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="xl:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
};
