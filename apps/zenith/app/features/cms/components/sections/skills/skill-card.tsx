import { Icon } from '@iconify/react';
import type { Skill } from '@repo/appwrite-core/domain';
import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SkillCardProps {
  item: Skill;
  onEdit: () => void;
  onRemove: () => void;
}

/**
 * SkillCard (Constitution §XVII, §I)
 * High-density read-only card for technical competencies.
 * Features top-anchored status badges and hover-activated actions.
 * Refined for high visibility and optimal spacing (Round 3.5.1).
 */
export function SkillCard({ item, onEdit, onRemove }: SkillCardProps) {
  const typeColors = {
    frontend: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    backend: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    fullstack: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <Card className="bg-card/50 border border-border/80 overflow-hidden group hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/10 transition-all duration-300 relative h-24 shadow-sm">
      {/* Badges - Top Left */}
      <div className="absolute top-3 left-3 flex gap-2 z-10">
        <Badge
          variant="outline"
          className={cn(
            'text-[9px] uppercase font-bold tracking-tight h-4 px-1.5 rounded-sm border-[1.5px]',
            typeColors[item.type],
          )}
        >
          {item.type}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            'text-[9px] uppercase font-bold tracking-tight h-4 px-1.5 rounded-sm border-[1.5px]',
            statusColors[item.status],
          )}
        >
          {item.status}
        </Badge>
      </div>

      {/* Actions - Top Right */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10 translate-x-2 group-hover:translate-x-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="size-7 rounded-md hover:bg-primary/15 hover:text-primary transition-colors bg-background/50 backdrop-blur-sm border border-border/40"
        >
          <Edit2 size={12} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="size-7 rounded-md hover:bg-destructive/15 hover:text-destructive transition-colors bg-background/50 backdrop-blur-sm border border-border/40"
        >
          <Trash2 size={12} />
        </Button>
      </div>

      <CardContent className="p-5 pt-10 h-full flex items-center gap-5">
        {/* Squared Icon Container - Enhanced Visibility (Round 3.5.2) */}
        <div className="size-12 shrink-0 bg-muted/40 rounded-lg border border-border/60 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all relative overflow-hidden">
          {/* Luminous Backlight (Genius Upgrade) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] group-hover:bg-[radial-gradient(circle,rgba(var(--primary),0.15)_0%,transparent_70%)] transition-colors" />

          <Icon
            icon={item.iconCode}
            className="size-7 text-foreground group-hover:text-primary transition-all duration-300 relative z-10 filter drop-shadow-[0_0_1px_rgba(255,255,255,0.1)] contrast-[1.1] brightness-[1.1]"
          />
        </div>

        {/* Textual Content */}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold tracking-tight text-foreground/90 truncate group-hover:text-primary transition-colors">
            {item.title}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}
