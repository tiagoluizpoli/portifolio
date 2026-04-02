import React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

/**
 * LayoutShell (Constitution §XV, §I)
 * High-rigor administrative shell providing slot-based layouts and row symmetry.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Slot */}
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar Slot */}
        <Topbar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="max-w-7xl mx-auto items-stretch gap-2 grid">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
