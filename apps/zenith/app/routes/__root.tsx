import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import type * as React from 'react';
import { useEffect, useState } from 'react';
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
  notFoundComponent: NotFoundComponent,
});

import { Link } from '@tanstack/react-router';
import { SearchX } from 'lucide-react';
import { Button } from '../components/ui/button';

function NotFoundComponent() {
  return (
    <div className="h-screen w-full flex items-center justify-center p-8 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 -left-20 size-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 size-96 bg-emerald-500/5 rounded-full blur-[120px] transition-all duration-[3000ms]" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <div className="relative inline-block">
          <div className="size-24 rounded-3xl bg-muted/30 border border-border shadow-2xl flex items-center justify-center mx-auto group hover:scale-105 transition-transform duration-500">
            <SearchX className="size-10 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tighter text-foreground font-display uppercase">
            Fragment <span className="text-primary/40">Not Found</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 leading-relaxed max-w-[280px] mx-auto">
            The orchestration layer could not locate the requested sector in
            this sector of the grid.
          </p>
        </div>

        <div className="pt-4">
          <Button
            asChild
            variant="outline"
            className="h-12 px-10 border-primary/20 text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-primary/5 hover:shadow-primary/10"
          >
            <Link to="/">Re-route to Nexus</Link>
          </Button>
        </div>

        <div className="pt-12 text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 animate-in fade-in slide-in-from-bottom-2 duration-1000">
          Error 404 — Zenith Neutral Sector
        </div>
      </div>
    </div>
  );
}

import { QueryClientProvider } from '@tanstack/react-query';
import { LayoutShell } from '../components/layout/layout-shell';
import { TooltipProvider } from '../components/ui/tooltip';
import { queryClient } from '../lib/query-client';

function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  return isHydrated;
}

function RootComponent() {
  const isHydrated = useIsHydrated();

  return (
    <RootDocument isHydrated={isHydrated}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LayoutShell>
            <Outlet />
          </LayoutShell>
        </TooltipProvider>
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({
  children,
  isHydrated,
}: {
  children: React.ReactNode;
  isHydrated: boolean;
}) {
  return (
    <html
      lang="en"
      // Properly resolve attribute contamination from browser extensions (e.g. Grammarly)
      // by suppressing hydration warnings ONLY on the root tags. (Constitution §XV)
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <div id="app" className={isHydrated ? 'hydrated' : 'hydrating'}>
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  );
}
