import type { HistoryItem } from '@repo/appwrite-core';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import {
  Calendar,
  GraduationCap,
  MapPin,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useCmsContext } from '../../context/cms-context';
import { type HistoryInput, historySchema } from '../../types/history';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { generateId } from '@/lib/utils';

/**
 * EducationForm (Constitution §XVII, §I)
 * Section 04: Academic Foundation.
 */
export function EducationForm() {
  const { currentLocale, education, saveSection, isSaving } = useCmsContext();

  const initialItems = useMemo(() => {
    return (education.data || []).map(
      (item) =>
        ({
          id: item.id || generateId('ed'),
          locale: item.locale || currentLocale,
          type: 'education' as const,
          title: item.title || '',
          organization: item.organization || '',
          location: item.location || '',
          period: item.period || '',
          description: item.description || '',
          current: item.current || false,
          sort: item.sort || 0,
        }) as HistoryItem,
    );
  }, [education.data, currentLocale]);

  const form = useForm({
    defaultValues: { items: initialItems } as HistoryInput,
    validatorAdapter: zodValidator(),
    validators: {
      // @ts-expect-error - TanStack Form depth limits (§XVII)
      onChange: historySchema,
    },
    onSubmit: async ({ value }) => {
      await saveSection('education', value.items as unknown as HistoryItem[]);
    },
  });

  // Reactive reset when data arrives (§V)
  useEffect(() => {
    if (education.data) {
      form.reset({ items: initialItems } as HistoryInput);
    }
  }, [education.data, form.reset, initialItems]);

  const addItem = () => {
    form.setFieldValue('items', (prev) => [
      ...prev,
      {
        id: generateId(),
        locale: currentLocale,
        type: 'education',
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

  if (education.isLoading) {
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
          {[1, 2].map((id) => (
            <Card
              key={`edu-skel-${id}`}
              className="bg-card/30 border-border/50"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
            Academic Foundation
          </h2>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mt-1">
            Orchestrate your educational chronology and credentials
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
                    Save Education
                  </>
                )}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </div>

      <div className="space-y-6">
        <form.Field name="items">
          {(field) =>
            education.isLoading
              ? [1, 2].map((id) => (
                  <Card
                    key={`edu-skeleton-${id}`}
                    className="bg-card/50 border border-border/50 shadow-none overflow-hidden"
                  >
                    <CardContent className="p-6">
                      <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-[100px] w-full" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : field.state.value?.map((item, index) => (
                  <Card
                    key={item.id}
                    className="bg-card/50 border border-border/50 shadow-none overflow-hidden group hover:border-primary/30 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-4">
                          <form.Field name={`items[${index}].title`}>
                            {(subField) => (
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`edu-title-${index}`}
                                  className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                                >
                                  Degree / Certification
                                </Label>
                                <div className="relative">
                                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                                  <Input
                                    id={`edu-title-${index}`}
                                    name={`items[${index}].title`}
                                    value={subField.state.value ?? ''}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="B.Sc. in Computer Science"
                                    className="pl-10 bg-transparent h-10 text-sm font-bold"
                                  />
                                </div>
                              </div>
                            )}
                          </form.Field>

                          <form.Field name={`items[${index}].organization`}>
                            {(subField) => (
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`edu-org-${index}`}
                                  className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                                >
                                  Institution
                                </Label>
                                <Input
                                  id={`edu-org-${index}`}
                                  name={`items[${index}].organization`}
                                  value={subField.state.value ?? ''}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                  placeholder="University of Excellence"
                                  className="bg-transparent h-10 text-sm"
                                />
                              </div>
                            )}
                          </form.Field>
                        </div>

                        <div className="space-y-4">
                          <form.Field name={`items[${index}].period`}>
                            {(subField) => (
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`edu-period-${index}`}
                                  className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                                >
                                  Period
                                </Label>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                                  <Input
                                    id={`edu-period-${index}`}
                                    name={`items[${index}].period`}
                                    value={subField.state.value ?? ''}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="2016 — 2020"
                                    className="pl-10 bg-transparent h-10 text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </form.Field>

                          <form.Field name={`items[${index}].location`}>
                            {(subField) => (
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`edu-loc-${index}`}
                                  className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                                >
                                  Location
                                </Label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                                  <Input
                                    id={`edu-loc-${index}`}
                                    name={`items[${index}].location`}
                                    value={subField.state.value ?? ''}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="Remote / London, UK"
                                    className="pl-10 bg-transparent h-10 text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </form.Field>
                        </div>

                        <div className="space-y-4">
                          <form.Field name={`items[${index}].description`}>
                            {(subField) => (
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`edu-desc-${index}`}
                                  className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                                >
                                  Achievements & Focus
                                </Label>
                                <Textarea
                                  id={`edu-desc-${index}`}
                                  name={`items[${index}].description`}
                                  value={subField.state.value ?? ''}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                  placeholder="Specialized in Distributed Systems..."
                                  className="bg-transparent min-h-[100px] text-xs resize-none"
                                />
                              </div>
                            )}
                          </form.Field>

                          <div className="flex items-center justify-between">
                            <form.Field name={`items[${index}].current`}>
                              {(subField) => (
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`current-${item.id}`}
                                    checked={subField.state.value}
                                    onCheckedChange={(checked) =>
                                      subField.handleChange(!!checked)
                                    }
                                  />
                                  <Label
                                    htmlFor={`current-${item.id}`}
                                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60"
                                  >
                                    Still Studying
                                  </Label>
                                </div>
                              )}
                            </form.Field>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={12} className="mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
          }
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
              Add Education Record
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
}
