import { Icon } from '@iconify/react';
import { Settings2, Trash2 } from 'lucide-react';
import type { ImpactMetricInput } from '../../../types/about';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  metric: ImpactMetricInput;
  sourceTitle: string;
  resolvedIcon: string;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * MetricCard (Constitution §XVII, §I)
 * High-density read-only card for impact metrics.
 * Redefined for Round 4 Corrections: Removes artificial badges/placeholders.
 */
export function MetricCard({
  metric,
  sourceTitle,
  resolvedIcon,
  onEdit,
  onDelete,
}: MetricCardProps) {
  return (
    <Card className="bg-accent/30 border-8 border-amber-border/40 overflow-hidden group hover:shadow-lg transition-all duration-300 relative h-24 shadow-none">
      {/* Actions - Top Right (Reduced Size) */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10 translate-x-1 group-hover:translate-x-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="size-6 rounded-md hover:bg-primary/10 hover:text-primary transition-colors bg-background/50 backdrop-blur-sm border border-border/20"
        >
          <Settings2 size={10} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="size-6 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors bg-background/50 backdrop-blur-sm border border-border/20"
        >
          <Trash2 size={10} />
        </Button>
      </div>

      <CardContent className="h-full flex items-center">
        {/* Squared Icon Container - Compact Width */}
        <div className="h-full w-16 shrink-0 bg-muted/10 border-r border-border/20 flex items-center justify-center group-hover:bg-primary/5 transition-all rounded-lg">
          <Icon
            icon={resolvedIcon}
            className={`size-6 transition-all duration-300 ${
              metric.isPlaceholder
                ? 'text-muted-foreground/20'
                : 'text-foreground/30 group-hover:text-primary'
            }`}
          />
        </div>

        {/* Textual Content - Tight alignment to left */}
        <div className="px-3 min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-baseline gap-2">
            {metric.prefix && (
              <span className="text-[10px] font-bold text-muted-foreground/30 italic">
                {metric.prefix}
              </span>
            )}
            <span className="text-lg font-black tracking-tighter text-foreground font-display group-hover:text-primary transition-colors leading-none">
              {metric.value}
            </span>
            {metric.suffix && (
              <span className="text-[10px] font-bold text-muted-foreground/30 italic">
                {metric.suffix}
              </span>
            )}
          </div>
          <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 truncate mt-0.5">
            {metric.label}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[7px] font-bold py-0.5 px-1.5 bg-primary/5 border border-primary/10 text-primary/50 rounded uppercase tracking-widest">
              {sourceTitle}
            </span>
            {metric.isPlaceholder && (
              <span className="text-[7px] font-black py-0.5 px-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500/60 rounded uppercase tracking-widest animate-pulse">
                Draft
              </span>
            )}
            <span className="text-[7px] font-medium font-mono text-muted-foreground/20 uppercase tracking-widest hidden sm:inline">
              {metric.internalCode}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
