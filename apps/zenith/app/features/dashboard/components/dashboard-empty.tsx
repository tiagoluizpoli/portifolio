/**
 * DashboardEmpty — Empty-state placeholder shown when no portfolio items exist.
 *
 * Extracted to keep `routes/index.tsx` within the < 100 LoC orchestrator limit (FR-006).
 */

import { TrendingUp } from 'lucide-react';
import type { KpiCard } from './kpi-cards';
import { KpiCards } from './kpi-cards';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardEmptyProps {
  kpiCards: KpiCard[];
}

export function DashboardEmpty({ kpiCards }: DashboardEmptyProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 font-sans">
      <KpiCards kpiCards={kpiCards} isEmpty />
      <Card className="border-none shadow-none bg-surface-container-low/20">
        <CardHeader className="text-center py-12 space-y-4">
          <div className="p-4 bg-primary/10 rounded-full mx-auto w-fit">
            <TrendingUp className="size-8 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl">Ready to Curate</CardTitle>
            <CardDescription className="max-w-md mx-auto text-sm leading-relaxed">
              Your portfolio management engine is initialized. Begin by
              integrating your first projects to see real-time access analytics
              and contact inquiries.
            </CardDescription>
          </div>
          <div className="flex justify-center gap-3 pt-4">
            <Button
              size="sm"
              className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Integrate Portfolio
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-12 pb-16 space-y-8">
          <div className="space-y-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={`skeleton-item-${i}`}
                className="flex items-center gap-6 opacity-30"
              >
                <Skeleton className="size-5 rounded-full bg-foreground/10" />
                <Skeleton className="h-3 flex-1 bg-foreground/5 rounded-full" />
                <Skeleton className="h-3 w-20 bg-foreground/5 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
