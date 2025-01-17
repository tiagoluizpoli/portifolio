import { HelmetProvider } from 'react-helmet-async';
import { LangProvider } from './lang-provider';
import { ReactQueryProvider } from './react-query-provider';
import { RouterProvider } from './router-provider';

export const Providers = () => {
  return (
    <ReactQueryProvider>
      <LangProvider>
        <HelmetProvider>
          <RouterProvider />
        </HelmetProvider>
      </LangProvider>
    </ReactQueryProvider>
  );
};
