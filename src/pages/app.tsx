import { Header, Loading, PageTransition } from '@/components';
import { useIsFetching } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';

export const PublicApp = () => {
  const isFetching = useIsFetching();

  if (isFetching > 0) {
    return <Loading />;
  }

  return (
    <div className="">
      <Header />

      <PageTransition>
        <Outlet />
      </PageTransition>
    </div>
  );
};
