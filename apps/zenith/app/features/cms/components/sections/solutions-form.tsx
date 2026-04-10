import type { Solution } from '@repo/appwrite-core';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import {
  Briefcase,
  GripVertical,
  Link,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useCmsContext } from '../../context/cms-context';
import { type SolutionsInput, solutionsListSchema } from '../../types/assets';
import { SortableList } from '../common/sortable-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { generateId } from '@/lib/utils';

/**
 * SolutionsForm (Constitution §XVII, §I)
 * Section 06: Professional Offerings & Solution Architectures.
 * Wired to Appwrite via TanStack Form + CmsContext.
 */
export function SolutionsForm() {
  const { solutions, saveSection, isSaving } = useCmsContext();
  const initialValues = useMemo(
    () => ({
      items: (solutions.data || []).map(
        (item) =>
          ({
            id: item.id || generateId('so'),
            locale: item.locale || 'en',
            title: item.title || '',
            description: item.description || '',
            iconCode: item.iconCode || 'lucide:box',
            iconId: item.iconId || '',
            url: item.url || '',
            sort: item.sort || 0,
          }) as Solution,
      ),
    }),
    [solutions.data],
  );

  const form = useForm({
    defaultValues: initialValues as SolutionsInput,
    // biome-ignore format: preserve ts-expect-error
    // @ts-expect-error - TanStack Form depth limits + adapter type signature mismatch (§XVII)
    validatorAdapter: zodValidator(),
    validators: {
      onChange: solutionsListSchema,
    },
    onSubmit: async ({ value }) => {
      await saveSection('solutions', value.items as unknown as Solution[]);
    },
  });

  // Reactive reset when data arrives (§V)
  useEffect(() => {
    if (solutions.data) {
      form.reset(initialValues as SolutionsInput);
    }
  }, [solutions.data, form.reset, initialValues]);

  const addSolution = () => {
    const currentLocale = form.getFieldValue('items')[0]?.locale || 'en';
    form.pushFieldValue('items', {
      id: generateId('sol'),
      locale: currentLocale,
      title: '',
      description: '',
      iconCode: 'lucide:briefcase',
      iconId: '',
      url: '',
      sort: form.getFieldValue('items').length,
    });
  };

  const removeSolution = (index: number) => {
    form.removeFieldValue('items', index);
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
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((id) => {
            return (
              <Card
                key={`sol-skel-${id}`}
                className="bg-card/30 border-border/50"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
            Professional Offerings
          </h2>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mt-1">
            Orchestrate your solution architectures and specialized services
          </p>
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isPristine]}
        >
          {([canSubmit, isPristine]) => (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPristine || isSaving}
                onClick={() => form.reset()}
                className="text-[10px] font-bold uppercase tracking-widest h-8"
              >
                <RefreshCcw size={12} className="mr-2" />
                Reset
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!canSubmit || isSaving}
                onClick={() => form.handleSubmit()}
                className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest h-8 shadow-lg shadow-primary/20"
              >
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save size={12} className="mr-2" />
                    Save Solutions
                  </>
                )}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </div>

      <div className="space-y-6">
        <form.Field name="items">
          {(field) => (
            <>
              {solutions.isLoading ? (
                [1, 2, 3].map((id) => {
                  return (
                    <Card
                      key={`sol-skeleton-${id}`}
                      className="bg-card/30 border border-border/50 p-6 relative group mb-4"
                    >
                      <div className="grid gap-8 lg:grid-cols-3 pl-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-11 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-11 w-full" />
                          </div>
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-3 w-48" />
                              <Skeleton className="h-6 w-16" />
                            </div>
                            <Skeleton className="h-[100px] w-full" />
                          </div>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-8 w-48" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <SortableList
                  items={field.state.value}
                  onReorder={handleReorder}
                  renderItem={(solution) => {
                    const index = field.state.value.findIndex(
                      (s) => s.id === solution.id,
                    );
                    return (
                      <Card className="bg-card/30 border border-border/50 p-6 relative group mb-4">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                          <GripVertical className="size-4 text-muted-foreground/20" />
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3 pl-6">
                          <div className="space-y-4">
                            <form.Field name={`items[${index}].title`}>
                              {(subField) => (
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`sol-title-${index}`}
                                    className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                                  >
                                    Solution Title
                                  </Label>
                                  <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                                    <Input
                                      id={`sol-title-${index}`}
                                      name={`items[${index}].title`}
                                      value={subField.state.value ?? ''}
                                      onChange={(e) =>
                                        subField.handleChange(e.target.value)
                                      }
                                      placeholder="Cloud Architecture Strategy"
                                      className="pl-10 bg-transparent h-11 text-sm font-bold"
                                    />
                                  </div>
                                </div>
                              )}
                            </form.Field>

                            <form.Field name={`items[${index}].url`}>
                              {(subField) => (
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`sol-link-${index}`}
                                    className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                                  >
                                    External Link (Optional)
                                  </Label>
                                  <div className="relative">
                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                                    <Input
                                      id={`sol-link-${index}`}
                                      name={`items[${index}].url`}
                                      value={subField.state.value ?? ''}
                                      onChange={(e) =>
                                        subField.handleChange(e.target.value)
                                      }
                                      placeholder="https://..."
                                      className="pl-10 bg-transparent h-11 text-sm"
                                    />
                                  </div>
                                </div>
                              )}
                            </form.Field>
                          </div>

                          <div className="lg:col-span-2 space-y-4">
                            <form.Field name={`items[${index}].description`}>
                              {(subField) => (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                                      Narrative & Value Proposition
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeSolution(index)}
                                      className="h-6 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 size={12} className="mr-2" />
                                      Remove
                                    </Button>
                                  </div>
                                  <Textarea
                                    id={`sol-desc-${index}`}
                                    name={`items[${index}].description`}
                                    value={subField.state.value ?? ''}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="Describe the solution, methodology, and primary outcomes..."
                                    className="bg-transparent min-h-[100px] text-sm resize-none leading-relaxed"
                                  />
                                </div>
                              )}
                            </form.Field>

                            <form.Field name={`items[${index}].iconCode`}>
                              {(subField) => (
                                <div className="flex items-center gap-3">
                                  <Label
                                    htmlFor={`sol-icon-${index}`}
                                    className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider whitespace-nowrap"
                                  >
                                    Icon ID
                                  </Label>
                                  <Input
                                    id={`sol-icon-${index}`}
                                    name={`items[${index}].iconCode`}
                                    value={subField.state.value ?? ''}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="lucide:briefcase"
                                    className="bg-transparent h-8 text-[10px] w-48"
                                  />
                                </div>
                              )}
                            </form.Field>
                          </div>
                        </div>
                      </Card>
                    );
                  }}
                />
              )}
            </>
          )}
        </form.Field>

        <Button
          type="button"
          variant="outline"
          className="w-full h-16 border-dashed border-border/60 bg-transparent hover:bg-primary/5 hover:border-primary/40 group transition-all"
          onClick={addSolution}
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
    </div>
  );
}
