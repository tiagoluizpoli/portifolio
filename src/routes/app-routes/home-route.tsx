import { HomePage } from '@/pages';
import { Helmet } from 'react-helmet-async';

export const HomeRoute = () => {
  return (
    <>
      <Helmet>
        <title>Tiago Poli</title>
      </Helmet>
      <HomePage />
    </>
  );
};
