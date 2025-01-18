import { Header, PageTransition } from '@/components';
import { Outlet } from 'react-router-dom';

export const PublicApp = () => {
  return (
    <div className="">
      <Header />

      <PageTransition>
        <Outlet />
      </PageTransition>
    </div>
  );
};
