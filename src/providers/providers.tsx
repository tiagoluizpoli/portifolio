import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { LangProvider } from './lang';
import { ReactQueryProvider } from './react-query-provider';
import { RouterProvider } from './router-provider';

export const Providers = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactQueryProvider>
        <LangProvider>
          <HelmetProvider>
            <RouterProvider />
          </HelmetProvider>
        </LangProvider>
      </ReactQueryProvider>
    </Suspense>
  );
};
