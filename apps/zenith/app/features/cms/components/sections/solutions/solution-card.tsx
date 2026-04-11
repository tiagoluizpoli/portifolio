import { Icon } from '@iconify/react';
import type { Solution } from '@repo/appwrite-core';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SolutionCardProps {
  item: Solution;
  onEdit: () => void;
  onRemove: () => void;
}

/**
 * SolutionCard (Constitution §XVII, §I)
 * Professional Offering read-only card.
 * High-density layout with hover actions and visual asset previews.
 * Refined for optimal spacing and distinct borders (Round 3.5.1).
 */
export function SolutionCard({ item, onEdit, onRemove }: SolutionCardProps) {
  return (
    <Card className="bg-card/50 border border-border/80 overflow-hidden group hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/10 transition-all duration-300 relative shadow-sm">
      {/* Actions - Top Right */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10 translate-x-2 group-hover:translate-x-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="size-8 rounded-md hover:bg-primary/15 hover:text-primary transition-colors bg-background/50 backdrop-blur-sm border border-border/40"
        >
          <Edit2 size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="size-8 rounded-md hover:bg-destructive/15 hover:text-destructive transition-colors bg-background/50 backdrop-blur-sm border border-border/40"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Squared Icon Container - Enhanced Visibility (Round 3.5.2) */}
          <div className="size-14 shrink-0 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/40 group-hover:shadow-[0_0_25px_rgba(var(--primary),0.1)] transition-all relative overflow-hidden">
            {/* Luminous Backlight (Genius Upgrade) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] group-hover:bg-[radial-gradient(circle,rgba(var(--primary),0.15)_0%,transparent_70%)] transition-colors" />

            <Icon
              icon={item.iconCode}
              className="size-7 text-primary group-hover:text-primary transition-all duration-300 relative z-10 filter drop-shadow-[0_4px_12px_rgba(var(--primary),0.1)] contrast-[1.1] brightness-[1.1]"
            />
          </div>

          {/* Textual Content */}
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="text-base font-bold tracking-tight text-foreground/90 truncate group-hover:text-primary transition-colors">
              {item.title}
            </h3>
          </div>
        </div>

        {/* Narrative Preview */}
        {item.description && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-3 font-medium selection:bg-primary/10">
              {item.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
