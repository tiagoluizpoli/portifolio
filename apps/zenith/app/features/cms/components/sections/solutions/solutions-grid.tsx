import type { Solution } from '@repo/appwrite-core';
import { Plus } from 'lucide-react';
import { SortableList } from '../../common/sortable-list';
import { SolutionCard } from './solution-card';
import { Button } from '@/components/ui/button';

interface SolutionsGridProps {
  items: Solution[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onReorder: (newItems: Solution[]) => void;
}

/**
 * SolutionsGrid (Constitution §XVII)
 * Sortable list container for professional offerings.
 * Orchestrates Read-Only SolutionCards and Dialog-driven CRUD triggers.
 */
export function SolutionsGrid({
  items,
  onAdd,
  onEdit,
  onRemove,
  onReorder,
}: SolutionsGridProps) {
  return (
    <div className="space-y-6">
      <SortableList
        items={items}
        onReorder={onReorder}
        renderItem={(solution) => {
          const index = items.findIndex((s) => s.id === solution.id);
          return (
            <SolutionCard
              item={solution}
              onEdit={() => onEdit(index)}
              onRemove={() => onRemove(index)}
            />
          );
        }}
      />

      {/* Add Offering Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-16 border-dashed border-border/60 bg-transparent hover:bg-primary/5 hover:border-primary/40 group transition-all rounded-xl"
        onClick={onAdd}
      >
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={14} className="text-muted-foreground/40" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Add Professional Offering
          </span>
        </div>
      </Button>
    </div>
  );
}
