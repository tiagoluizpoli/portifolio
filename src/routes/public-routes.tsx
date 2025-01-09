import { PublicApp } from '@/pages';
import type { RouteObject } from 'react-router-dom';
import { ContactRoute, HomeRoute, ResumeRoute, SolutionsRoute } from './app-routes';

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicApp />,
    children: [
      {
        path: '/',
        element: <HomeRoute />,
      },
      {
        path: '/solutions',
        element: <SolutionsRoute />,
      },
      {
        path: '/resume',
        element: <ResumeRoute />,
      },
      {
        path: '/contact',
        element: <ContactRoute />,
      },
    ],
  },
];
