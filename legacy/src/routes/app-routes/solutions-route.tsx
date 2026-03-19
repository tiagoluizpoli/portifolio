import { SolutionsPage } from '@/pages';
import { Helmet } from 'react-helmet-async';

export const SolutionsRoute = () => {
  return (
    <>
      <Helmet>
        <title>Solutions</title>
      </Helmet>
      <SolutionsPage />
    </>
  );
};
