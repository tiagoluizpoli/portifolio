import { HelmetProvider } from 'react-helmet-async';
import { ReactQueryProvider } from './react-query-provider';
import { RouterProvider } from './router-provider';

export const Providers = () => {
  return (
    <ReactQueryProvider>
      <HelmetProvider>
        <RouterProvider />
      </HelmetProvider>
    </ReactQueryProvider>
  );
};
