/**
 * TemporalDensity — Dashboard Temporal Access Density Chart.
 *
 * Extracted from `routes/index.tsx` as part of FR-006 (route orchestrator < 100 LoC).
 * Renders a 48-bar sparkline with time-range filter buttons and interactive tooltips.
 * All data is provided via props from the `useDashboardModel` hook.
 */
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SparklineBar {
  id: string;
  height: number;
  label: string;
}

export interface AxisLabel {
  id: string;
  value: number;
  displayValue: string;
}

export interface AccessHistoryEntry {
  label: string;
  value: string | number;
}

interface TemporalDensityProps {
  sparklineData: SparklineBar[];
  axisLabels: AxisLabel[];
  accessHistory: AccessHistoryEntry[];
  activeRange: string;
  onRangeChange: (range: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TemporalDensity({
  sparklineData,
  axisLabels,
  accessHistory,
  activeRange,
  onRangeChange,
}: TemporalDensityProps) {
  return (
    <Card className="lg:col-span-2 border-none shadow-none bg-surface-container-low/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-display font-extrabold tracking-tight">
            Temporal Density
          </CardTitle>
          <CardDescription>
            Portfolio access frequency over the last 24 hours
          </CardDescription>
        </div>
        <div className="flex gap-1.5 bg-foreground/5 p-1 rounded-xl">
          {accessHistory.map((h) => (
            <Button
              key={h.label}
              variant="ghost"
              size="icon"
              onClick={() => onRangeChange(h.label)}
              className={cn(
                'size-9 flex flex-col items-center justify-center rounded-lg transition-all border-none shadow-none',
                activeRange === h.label
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground/40 hover:bg-foreground/5 hover:text-muted-foreground',
              )}
            >
              <p className="text-[9px] font-black uppercase leading-none">
                {h.label}
              </p>
              <p className="text-[10px] font-mono font-bold leading-none mt-0.5">
                {h.value}
              </p>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-2">
        <TooltipProvider>
          <div className="h-64 flex items-end gap-1.5">
            {sparklineData.map((bar) => (
              <Tooltip key={bar.id}>
                <TooltipTrigger asChild>
                  <div
                    className="flex-1 bg-primary/40 hover:bg-primary transition-all duration-300 rounded-t-sm cursor-crosshair min-w-[2px]"
                    style={{ height: `${bar.height}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="flex flex-col gap-1 py-3 px-4 bg-surface-container-high border-none shadow-2xl rounded-xl animate-in zoom-in-95"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Capture Point
                  </span>
                  <div className="flex flex-col gap-0">
                    <span className="text-lg font-mono font-black tabular-nums text-white leading-none">
                      {bar.label}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground mt-1">
                      <span className="text-primary">
                        {Math.floor(bar.height)}
                      </span>{' '}
                      verified hits
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
      <CardFooter className="px-6 py-5 flex flex-col gap-4 border-t border-white/5">
        <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {axisLabels.map((label) => (
            <span key={label.id} className="flex flex-col items-center gap-2">
              <div className="w-px h-1.5 bg-foreground/20" />
              <span className="tabular-nums">{label.displayValue}</span>
            </span>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
