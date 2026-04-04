/**
 * GeoDistribution — Geographic Ingress Table.
 *
 * Extracted from `routes/index.tsx` as part of FR-006 (route orchestrator < 100 LoC).
 * Renders the top-performing geographic regions by access volume with latency indicators.
 * All data is provided via props from the `useDashboardModel` hook.
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LatencyStatus = 'low' | 'med' | 'high';

export interface Region {
  name: string;
  code: string;
  requests: string;
  latency: string;
  status: LatencyStatus;
  distribution: number; // 0–100 percentage for bar fill
  flag: string;
}

interface GeoDistributionProps {
  regions: Region[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const latencyColorMap: Record<LatencyStatus, string> = {
  low: 'text-emerald-500',
  med: 'text-amber-500',
  high: 'text-rose-500',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GeoDistribution({ regions }: GeoDistributionProps) {
  return (
    <Card className="border-none shadow-none bg-surface-container-low/20 overflow-hidden">
      <CardHeader className="flex flex-row items-baseline justify-between pb-8">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-display font-extrabold tracking-tight">
            Geographic Ingress
          </CardTitle>
          <CardDescription>
            Top performing regions by access volume
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Live Traffic
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pb-10">
        {/* Column headers */}
        <div className="grid grid-cols-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          <span>Region</span>
          <span className="text-right">Requests</span>
          <span className="text-right">Latency</span>
          <span className="text-right">Distribution</span>
        </div>

        {/* Region rows */}
        <div className="space-y-6">
          {regions.map((region) => (
            <div
              key={region.name}
              className="grid grid-cols-4 items-center px-4 group cursor-pointer transition-all hover:translate-x-1"
            >
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-md bg-muted/20 flex items-center justify-center overflow-hidden">
                  <span className="text-xs leading-none">{region.flag}</span>
                </div>
                <span className="text-sm font-semibold">{region.name}</span>
              </div>

              <div className="text-right font-mono font-bold text-sm tabular-nums text-foreground/80">
                {region.requests}
              </div>

              <div
                className={cn(
                  'text-right font-bold text-sm tabular-nums',
                  latencyColorMap[region.status],
                )}
              >
                {region.latency}
              </div>

              <div className="flex justify-end pr-4">
                <div className="w-40 h-1.5 bg-foreground/3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${region.distribution}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
