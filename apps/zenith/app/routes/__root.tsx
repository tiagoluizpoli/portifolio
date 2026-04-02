import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import type * as React from 'react';
import '../index.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Zenith Hub',
      },
    ],
  }),
  component: RootComponent,
});

import { LayoutShell } from '../components/layout/layout-shell';

function RootComponent() {
  return (
    <RootDocument>
      <LayoutShell>
        <Outlet />
      </LayoutShell>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
