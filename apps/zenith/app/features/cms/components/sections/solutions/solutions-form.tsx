import type { Solution } from '@repo/appwrite-core';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { useEffect, useMemo, useState } from 'react';
import { useCmsContext } from '../../../context/cms-context';
import {
  type SolutionInput,
  type SolutionsInput,
  solutionsListSchema,
} from '../../../types/assets';
import { SolutionDialog } from './solution-dialog';
import { SolutionsGrid } from './solutions-grid';
import { SolutionsHeader } from './solutions-header';
import { Skeleton } from '@/components/ui/skeleton';
import { generateId } from '@/lib/utils';

/**
 * SolutionsForm (Constitution §XVII, §I)
 * Root composite component for Section 06: Professional Offerings.
 * Orchestrates localized form state and Dialog-driven CRUD operations.
 */
export function SolutionsForm() {
  const { currentLocale, solutions, saveSection, isSaving } = useCmsContext();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const initialValues = useMemo(
    () => ({
      items: (solutions.data || []).map(
        (item) =>
          ({
            id: item.id || generateId('so'),
            locale: item.locale || currentLocale,
            title: item.title || '',
            description: item.description || '',
            iconCode: item.iconCode || 'lucide:box',
            iconId: item.iconId || '',
            sort: item.sort || 0,
          }) as Solution,
      ),
    }),
    [solutions.data, currentLocale],
  );

  const form = useForm({
    defaultValues: initialValues as SolutionsInput,
    validatorAdapter: zodValidator(),
    validators: {
      onChange: solutionsListSchema,
    },
    onSubmit: async ({ value }: { value: SolutionsInput }) => {
      await saveSection('solutions', value.items as unknown as Solution[]);
    },
    // biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass
  } as any);

  useEffect(() => {
    if (solutions.data) {
      form.reset(initialValues as SolutionsInput);
    }
  }, [solutions.data, form.reset, initialValues]);

  const handleAdd = () => {
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleRemove = (index: number) => {
    form.setFieldValue('items', (prev: Solution[]) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const handleSolutionSubmit = (solutionData: SolutionInput) => {
    if (editingIndex !== null) {
      // Update existing
      form.setFieldValue(`items[${editingIndex}]`, solutionData);
    } else {
      // Add new
      form.setFieldValue('items', (prev: Solution[]) => [
        ...prev,
        {
          ...solutionData,
          id: solutionData.id || generateId('sol'),
          sort: prev.length,
        },
      ]);
    }
    setIsDialogOpen(false);
  };

  const handleReorder = (newItems: Solution[]) => {
    form.setFieldValue(
      'items',
      newItems.map((item, index) => ({ ...item, sort: index })),
    );
  };

  if (solutions.isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((id) => (
            <Skeleton
              key={`sol-skel-${id}`}
              className="h-32 w-full rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const currentItems = form.getFieldValue('items') as Solution[];
  const editingItem = editingIndex !== null ? currentItems[editingIndex] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <form.Subscribe
        // biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass
        selector={(state: any) => [state.canSubmit, state.isPristine] as const}
      >
        {([canSubmit, isPristine]) => (
          <SolutionsHeader
            isSaving={isSaving}
            isPristine={isPristine as boolean}
            canSubmit={canSubmit as boolean}
            onReset={() => form.reset()}
            onSubmit={() => form.handleSubmit()}
          />
        )}
      </form.Subscribe>

      <form.Field name="items">
        {/* biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass */}
        {(field: any) => (
          <SolutionsGrid
            items={field.state.value}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onReorder={handleReorder}
          />
        )}
      </form.Field>

      <SolutionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingItem}
        onSubmit={handleSolutionSubmit}
        currentLocale={currentLocale}
      />
    </div>
  );
}
