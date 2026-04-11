import { rectSortingStrategy } from '@dnd-kit/sortable';
import type { Skill } from '@repo/appwrite-core/domain';
import { SortableList } from '../../common/sortable-list';
import { SkillCard } from './skill-card';
import type { SkillCategory } from './skills-filters';

interface SkillsGridProps {
  items: Skill[];
  filteredIndices: number[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onReorder: (newItems: Skill[]) => void;
  activeTab: SkillCategory;
}

/**
 * SkillsGrid (Constitution §XVII)
 * High-density grid for engineering competencies.
 * Leverages read-only SkillCards and Dialog-driven CRUD triggers.
 * Supports DND reordering exclusively in the 'All' view.
 */
export function SkillsGrid({
  items,
  filteredIndices,
  onEdit,
  onRemove,
  onReorder,
  activeTab,
}: SkillsGridProps) {
  const isAllTab = activeTab === 'all';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Render Filtered Skills */}
      {!isAllTab ? (
        filteredIndices.map((index) => (
          <SkillCard
            key={items[index]?.id || `new-skill-${index}`}
            item={items[index]}
            onEdit={() => onEdit(index)}
            onRemove={() => onRemove(index)}
          />
        ))
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          strategy={rectSortingStrategy}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 col-span-full contents"
          renderItem={(skill) => {
            const index = items.findIndex((s) => s.id === skill.id);
            return (
              <SkillCard
                item={skill}
                onEdit={() => onEdit(index)}
                onRemove={() => onRemove(index)}
              />
            );
          }}
        />
      )}
    </div>
  );
}
