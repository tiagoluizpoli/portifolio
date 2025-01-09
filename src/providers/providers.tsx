import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from './router-provider';

export const Providers = () => {
  return (
    <HelmetProvider>
      <RouterProvider />
    </HelmetProvider>
  );
};
