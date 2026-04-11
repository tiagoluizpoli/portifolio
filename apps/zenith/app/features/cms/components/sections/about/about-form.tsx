import { useForm } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useCmsContext } from '../../../context/cms-context';
import { useMetricSourcesQuery } from '../../../hooks/use-cms-queries';
import { type AboutInput, aboutSchema } from '../../../types/about';
import { CmsDiscardButton } from '../../common/cms-discard-button';
import { CmsSaveButton } from '../../common/cms-save-button';
import { AboutMetrics } from './about-metrics';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * AboutForm (Constitution §XVII, §I, §VIII)
 * Section 02: Hero Narrative.
 * Refactored to Composite Pattern for maintainability.
 */
export function AboutForm() {
  const { currentLocale, about, saveSection, isSaving } = useCmsContext();
  const { data: sources, isLoading: sourcesLoading } = useMetricSourcesQuery();

  const form = useForm({
    defaultValues: (about.data || {
      id: '',
      locale: currentLocale,
      content: '',
      metrics: [],
    }) as AboutInput,
    validators: {
      onChange: aboutSchema,
    },
    onSubmit: async ({ value }) => {
      await saveSection('about', value);
    },
  });

  // Synchronize form with server state after persistence (§XVII)
  useEffect(() => {
    if (about.data) {
      form.reset(
        (about.data || {
          id: '',
          locale: currentLocale,
          content: '',
          metrics: [],
        }) as AboutInput,
      );
    }
  }, [about.data, form.reset, currentLocale]);

  if (about.isLoading || sourcesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
        {/* Editorial Header */}
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-foreground font-display">
              About{' '}
              <span className="text-primary/40 font-medium">
                / Hero Narrative
              </span>
            </h1>
            <p className="text-sm text-muted-foreground/60 mt-2 font-medium uppercase tracking-widest">
              Section 02 — Orchestrating the Professional Story
            </p>
          </div>

          <form.Subscribe
            selector={(state) => {
              console.log({ state });
              return [state.canSubmit, state.isPristine];
            }}
          >
            {([canSubmit, isPristine]) => {
              console.log({ canSubmit, isPristine });
              return (
                <div className="flex items-center gap-3">
                  <CmsDiscardButton
                    isSaving={isSaving}
                    isPristine={isPristine}
                    onClick={() => form.reset()}
                  />
                  <CmsSaveButton
                    isSaving={isSaving}
                    canSubmit={canSubmit && !isPristine}
                    onClick={() => form.handleSubmit()}
                  />
                </div>
              );
            }}
          </form.Subscribe>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Narrative Bio Area - Tight Padding */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-xl bg-transparent border border-border space-y-4 shadow-none">
              <form.Field name="content">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                    >
                      Professional Bio / Long-form Narrative
                    </Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Tell your professional story..."
                      className="min-h-[420px] bg-transparent border-border text-base font-medium leading-relaxed text-muted-foreground/80 rounded-lg focus-visible:ring-primary/20 resize-none font-sans p-4"
                    />
                  </div>
                )}
              </form.Field>
            </Card>
          </div>

          {/* Impact Metrics Sidebar */}
          <div className="space-y-4">
            <AboutMetrics
              form={form}
              sources={sources}
              aboutId={about.data?.id || ''}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
