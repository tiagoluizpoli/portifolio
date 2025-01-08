import { PublicApp } from '@/pages';
import type { RouteObject } from 'react-router-dom';
import { ContactRoute, HomeRoute } from './app-routes';

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
        path: '/contact',
        element: <ContactRoute />,
      },
    ],
  },
];
