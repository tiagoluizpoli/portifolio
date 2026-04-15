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
import { CmsEmptyState } from '../../common/cms-empty-state';
import { CmsErrorState } from '../../common/cms-error-state';
import { SolutionDialog } from './solution-dialog';
import { SolutionsGrid } from './solutions-grid';
import { SolutionsHeader } from './solutions-header';
import { Card } from '@/components/ui/card';
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

  const formConfig = {
    defaultValues: initialValues as SolutionsInput,
    validatorAdapter: zodValidator(),
    validators: {
      onChange: solutionsListSchema,
    },
    onSubmit: async ({ value }: { value: SolutionsInput }) => {
      // Filter out iconId (not supported by backend for solutions)
      const cleanedItems = value.items.map(({ iconId, ...item }) => item);
      await saveSection('solutions', cleanedItems as unknown as Solution[]);
    },
  } as const;

  const form = useForm(formConfig);

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

  // Error state
  if (solutions.isError) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <SolutionsHeader
          isSaving={false}
          isPristine={true}
          canSubmit={false}
          onReset={() => {}}
          onSubmit={() => {}}
        />
        <CmsErrorState
          sectionName="Solutions"
          errorMessage="Failed to load your professional offerings. Please check your connection."
          onRetry={() => window.location.reload()}
          showDismiss={false}
        />
      </div>
    );
  }

  if (solutions.isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((id) => (
            <Card
              key={`sol-skel-${id}`}
              className="relative bg-card/50 border border-border/80 overflow-hidden shadow-sm rounded-xl"
            >
              <div className="absolute top-3 right-3 flex gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>

              <div className="p-6">
                <div className="flex items-start gap-6">
                  <Skeleton className="size-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 pt-1 space-y-3">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Skeleton className="h-16 w-full rounded-xl" />
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

      {currentItems.length === 0 ? (
        <CmsEmptyState
          sectionName="Solution"
          description="Add your professional offerings and specialized services."
          onAction={handleAdd}
          actionLabel="Add Solution"
        />
      ) : (
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
      )}

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
