import type { Skill } from '@repo/appwrite-core/domain';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { useEffect, useMemo, useState } from 'react';
import { useCmsContext } from '../../../context/cms-context';
import {
  type SkillInput,
  type SkillsInput,
  skillsSchema,
} from '../../../types/assets';
import { SkillDialog } from './skill-dialog';
import { type SkillCategory, SkillsFilters } from './skills-filters';
import { SkillsGrid } from './skills-grid';
import { SkillsHeader } from './skills-header';
import { Skeleton } from '@/components/ui/skeleton';
import { generateId } from '@/lib/utils';

/**
 * SkillsForm (Constitution §XVII, §I)
 * Root composite component for Section 02: Technical Ordinance.
 * Orchestrates global form state and Dialog-driven CRUD operations.
 */
export function SkillsForm() {
  const { currentLocale, skills, saveSection, isSaving } = useCmsContext();
  const [activeTab, setActiveTab] = useState<SkillCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const initialItems = useMemo<Skill[]>(() => {
    return (skills.data || []).map(
      (item) =>
        ({
          id: item.id || generateId('sk'),
          title: item.title || '',
          type: item.type || 'frontend',
          iconCode: item.iconCode || 'lucide:code',
          status: (item.status === 'archived' ? 'archived' : 'active') as
            | 'active'
            | 'archived',
          sort: item.sort || 0,
        }) as Skill,
    );
  }, [skills.data, currentLocale]);

  const form = useForm({
    defaultValues: { items: initialItems } as SkillsInput,
    validatorAdapter: zodValidator(),
    validators: {
      // @ts-expect-error - TanStack Form depth limits (§XVII)
      onChange: skillsSchema,
    },
    onSubmit: async ({ value }) => {
      await saveSection('skills', value.items as unknown as Skill[]);
    },
  });

  useEffect(() => {
    if (skills.data) {
      form.reset({ items: initialItems } as SkillsInput);
    }
  }, [skills.data, form.reset, initialItems]);

  const handleAdd = () => {
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleRemove = (index: number) => {
    form.setFieldValue('items', (prev: Skill[]) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const handleSkillSubmit = (skillData: SkillInput) => {
    if (editingIndex !== null) {
      // Update existing
      form.setFieldValue(`items[${editingIndex}]`, skillData);
    } else {
      // Add new
      form.setFieldValue('items', (prev: Skill[]) => [
        ...prev,
        {
          ...skillData,
          id: skillData.id || generateId('sk'),
          sort: prev.length,
        },
      ]);
    }
    setIsDialogOpen(false);
  };

  const handleReorder = (newItems: Skill[]) => {
    form.setFieldValue(
      'items',
      newItems.map((item, index) => ({ ...item, sort: index })),
    );
  };

  const filteredIndices = useMemo<number[]>(() => {
    const currentItems = (form.getFieldValue('items') as Skill[]) || [];
    return currentItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        const matchesSearch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      })
      .map(({ index }) => index);
  }, [form.getFieldValue('items'), activeTab, searchQuery]);

  if (skills.isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
            <Skeleton key={`skel-${id}`} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const currentItems = form.getFieldValue('items') as Skill[];
  const editingItem = editingIndex !== null ? currentItems[editingIndex] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isPristine] as const}
      >
        {([canSubmit, isPristine]) => (
          <SkillsHeader
            isSaving={isSaving}
            isPristine={isPristine}
            canSubmit={canSubmit}
            onReset={() => form.reset()}
            onSubmit={() => form.handleSubmit()}
          />
        )}
      </form.Subscribe>

      <SkillsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAdd={handleAdd}
      />

      <div className="space-y-4">
        <form.Field name="items">
          {(field) => (
            <SkillsGrid
              items={field.state.value}
              filteredIndices={filteredIndices}
              onEdit={handleEdit}
              onRemove={handleRemove}
              onReorder={handleReorder}
              activeTab={activeTab}
            />
          )}
        </form.Field>
      </div>

      <SkillDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingItem}
        onSubmit={handleSkillSubmit}
      />
    </div>
  );
}
