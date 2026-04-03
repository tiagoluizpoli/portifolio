import React from 'react';
import { AppSidebar } from './sidebar';
import { Topbar } from './topbar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

/**
 * LayoutShell (Constitution §XV, §I)
 * High-rigor administrative shell providing slot-based layouts and row symmetry.
 * Optimized for the "Digital Curator" Oceanic Obsidian theme.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {/* Topbar Slot */}
          <Topbar />

          {/* Main Content Area: High-Density Editorial Surface */}
          <main className="flex-1 overflow-y-auto p-4 md:p-4 space-y-8">
            <div className="w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
