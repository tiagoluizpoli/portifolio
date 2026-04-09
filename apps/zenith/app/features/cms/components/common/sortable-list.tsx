import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  type SortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  hideGrip?: boolean;
}

function SortableItem({ id, children, hideGrip }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-xl transition-all',
        isDragging &&
          'z-50 shadow-2xl shadow-primary/20 scale-[1.02] border-primary/20 bg-primary/5',
      )}
    >
      <div className="flex gap-4 items-start h-full">
        {!hideGrip && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors"
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <div
          className={cn(
            'flex-1 min-w-0 h-full',
            hideGrip && 'cursor-grab active:cursor-grabbing',
          )}
          {...(hideGrip ? { ...attributes, ...listeners } : {})}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  strategy?: SortingStrategy;
  hideGrips?: boolean;
}

/**
 * SortableList (Constitution §XVII, §I)
 * High-performance kinetic sorting component powered by dnd-kit.
 * Optimized for 60 FPS transitions within the Zenith shell.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
  strategy = verticalListSortingStrategy,
  hideGrips = false,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={strategy}>
        <div className={cn('space-y-2.5', className)}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} hideGrip={hideGrips}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
