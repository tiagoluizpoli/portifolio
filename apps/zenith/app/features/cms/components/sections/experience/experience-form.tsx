import type { HistoryItem } from '@repo/appwrite-core';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Plus } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useCmsContext } from '../../../context/cms-context';
import { type HistoryInput, historySchema } from '../../../types/history';
import { CmsDiscardButton } from '../../common/cms-discard-button';
import { CmsEmptyState } from '../../common/cms-empty-state';
import { CmsErrorState } from '../../common/cms-error-state';
import { CmsSaveButton } from '../../common/cms-save-button';
import { ExperienceItem } from './experience-item';
import { ExperienceSkeleton } from './experience-skeleton';
import { Button } from '@/components/ui/button';
import { generateId } from '@/lib/utils';

/**
 * ExperienceForm (Constitution §XVII, §I, §VIII)
 * Section 03: Professional Journey.
 * Refactored to Composite Pattern for maintainability.
 */
export function ExperienceForm() {
  const { currentLocale, experience, saveSection, isSaving } = useCmsContext();

  const initialItems = useMemo(() => {
    return (experience.data || []).map(
      (item) =>
        ({
          id: item.id || generateId('ex'),
          locale: item.locale || currentLocale,
          type: 'experience' as const,
          title: item.title || '',
          organization: item.organization || '',
          location: item.location || '',
          period: item.period || '',
          description: item.description || '',
          current: item.current || false,
          sort: item.sort || 0,
        }) as HistoryItem,
    );
  }, [experience.data, currentLocale]);

  const form = useForm({
    defaultValues: { items: initialItems } as HistoryInput,
    validatorAdapter: zodValidator(),
    validators: {
      // @ts-expect-error - TanStack Form depth limits
      onChange: historySchema,
    },
    onSubmit: async ({ value }) => {
      await saveSection('experience', value.items as unknown as HistoryItem[]);
    },
  });

  useEffect(() => {
    if (experience.data) {
      form.reset({ items: initialItems } as HistoryInput);
    }
  }, [experience.data, form.reset, initialItems]);

  const addItem = () => {
    form.setFieldValue('items', (prev) => [
      ...prev,
      {
        id: generateId(),
        locale: currentLocale,
        type: 'experience',
        title: '',
        organization: '',
        location: '',
        period: '',
        description: '',
        current: false,
        sort: prev.length,
      },
    ]);
  };

  const removeItem = (index: number) => {
    form.setFieldValue('items', (prev) => prev.filter((_, i) => i !== index));
  };

  // Error state
  if (experience.isError) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
              Professional Journey
            </h2>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold">
              Orchestrate your career timeline and milestones
            </p>
          </div>
        </div>
        <CmsErrorState
          sectionName="Experience Records"
          errorMessage="Failed to load your work experience. Please check your connection."
          onRetry={() => window.location.reload()}
          showDismiss={false}
        />
      </div>
    );
  }

  if (experience.isLoading) {
    return <ExperienceSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
            Professional Journey
          </h2>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mt-1">
            Orchestrate your career chronology and impact
          </p>
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isPristine]}
        >
          {([canSubmit, isPristine]) => (
            <div className="flex items-center gap-3">
              <CmsDiscardButton
                isSaving={isSaving}
                isPristine={isPristine}
                onClick={() => form.reset()}
              />
              <CmsSaveButton
                isSaving={isSaving}
                canSubmit={canSubmit}
                onClick={() => form.handleSubmit()}
              />
            </div>
          )}
        </form.Subscribe>
      </div>

      <div className="space-y-6">
        <form.Field name="items">
          {(field) => {
            const items = field.state.value as HistoryItem[] | undefined;

            if (!items || items.length === 0) {
              return (
                <CmsEmptyState
                  sectionName="Experience"
                  description="No experience records yet. Start building your professional narrative."
                  onAction={addItem}
                  actionLabel="Add Experience"
                />
              );
            }

            return (
              <>
                {items.map((_, index) => (
                  <ExperienceItem
                    key={items[index].id}
                    index={index}
                    form={form}
                    onRemove={removeItem}
                  />
                ))}
              </>
            );
          }}
        </form.Field>

        <Button
          type="button"
          variant="outline"
          className="w-full h-16 border-dashed border-border/60 bg-transparent hover:bg-primary/5 hover:border-primary/40 group transition-all"
          onClick={addItem}
        >
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={14} className="text-muted-foreground/40" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              Add Experience Record
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
}
