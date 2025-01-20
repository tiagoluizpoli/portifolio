import { PageTransition } from '@/components';
import { lazyImport } from '@/lib';
import { PublicApp } from '@/pages';
import type { RouteObject } from 'react-router-dom';
const { HomeRoute } = lazyImport(() => import('@/routes/app-routes'), 'HomeRoute');
const { SolutionsRoute } = lazyImport(() => import('@/routes/app-routes'), 'SolutionsRoute');
const { ResumeRoute } = lazyImport(() => import('@/routes/app-routes'), 'ResumeRoute');
const { ContactRoute } = lazyImport(() => import('@/routes/app-routes'), 'ContactRoute');

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicApp />,
    children: [
      {
        path: '/',
        element: (
          <PageTransition pageKey="home">
            <HomeRoute />
          </PageTransition>
        ),
      },
      {
        path: '/solutions',
        element: (
          <PageTransition pageKey="solutions">
            <SolutionsRoute />
          </PageTransition>
        ),
      },
      {
        path: '/resume',
        element: (
          <PageTransition pageKey="resume">
            <ResumeRoute />
          </PageTransition>
        ),
      },
      {
        path: '/contact',
        element: (
          <PageTransition pageKey="contact">
            <ContactRoute />
          </PageTransition>
        ),
      },
    ],
  },
];
