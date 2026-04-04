/**
 * KpiCards — Dashboard KPI Snapshot Strip.
 *
 * Extracted from `routes/index.tsx` as part of FR-006 (route orchestrator < 100 LoC).
 * Renders the 4-card KPI strip (Total Access, Monthly, Inquiries, Active Viewers).
 * Also handles the empty-state skeleton loading view.
 * All data is provided via props from the `useDashboardModel` hook.
 */

import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KpiCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend: string;
  trendType: 'up' | 'neutral' | 'down';
  highlight?: boolean;
}

interface KpiCardsProps {
  kpiCards: KpiCard[];
  isEmpty?: boolean;
}

// ---------------------------------------------------------------------------
// Empty state skeletons
// ---------------------------------------------------------------------------

function KpiCardSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={`skeleton-${i}`}
          className="bg-surface-container-low/40 border-none shadow-none"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-2.5 w-full">
              <Skeleton className="h-2 w-16 bg-foreground/5" />
              <Skeleton className="h-6 w-24 bg-foreground/10" />
            </div>
            <Skeleton className="size-8 rounded-lg bg-foreground/5 shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KpiCards({ kpiCards, isEmpty = false }: KpiCardsProps) {
  if (isEmpty) {
    return <KpiCardSkeletons />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {kpiCards.map((kpi) => (
        <Card
          key={kpi.label}
          className={cn(
            'bg-surface-container-low/40 border-none shadow-none group relative overflow-hidden',
            kpi.highlight && 'ring-1 ring-primary/20',
          )}
        >
          {kpi.highlight && (
            <div className="absolute top-3 right-3">
              <span className="flex size-1.5 rounded-full bg-primary animate-pulse" />
            </div>
          )}
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {kpi.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-mono font-bold tracking-tight">
                  {kpi.value}
                </h3>
                <span
                  className={cn(
                    'text-[10px] font-bold',
                    kpi.trendType === 'up'
                      ? 'text-primary'
                      : 'text-muted-foreground/40',
                  )}
                >
                  {kpi.trend}
                </span>
              </div>
            </div>
            <div
              className={cn(
                'p-2 rounded-lg transition-colors',
                kpi.highlight
                  ? 'bg-primary/20'
                  : 'bg-foreground/3 group-hover:bg-primary/10',
              )}
            >
              <kpi.icon
                className={cn(
                  'size-4 transition-colors',
                  kpi.highlight
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-primary',
                )}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
