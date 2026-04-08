import type React from 'react';
import { CmsSidebar } from './components/sidebar';
import { CmsStatusFooter } from './components/status-footer';
import { CmsProvider } from './context/cms-context';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * CmsMainLayout (Constitution §XVII, §I)
 * High-fidelity glassmorphism shell for the Portfolio CMS.
 * Provides a secondary navigation rail for the 7 sections and a dedicated focus surface.
 */
export function CmsMainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CmsProvider>
      <div className="flex backdrop-blur-3xl rounded-xl border border-border overflow-hidden h-[calc(100vh-8rem)]">
        {/* Sidebar Rail (T005) */}
        <div className="w-64 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary/80">
              Sections
            </h2>
          </div>
          <CmsSidebar />
        </div>

        {/* Main Content Surface */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <ScrollArea className="flex-1 min-h-0 w-full relative content-wrapper">
            <div className="p-4 w-full h-full">{children}</div>
          </ScrollArea>

          {/* Status Footer (T006) */}
          <CmsStatusFooter />
        </div>
      </div>
    </CmsProvider>
  );
}
