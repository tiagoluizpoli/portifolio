import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Loader2 } from 'lucide-react';
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
    validatorAdapter: zodValidator(),
    validators: {
      // @ts-expect-error - TanStack Form depth limits (§XVII)
      onChange: aboutSchema,
    },
    onSubmit: async ({ value }) => {
      await saveSection('about', value);
    },
  });

  if (about.isLoading || sourcesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-8">
        {/* Editorial Header */}
        <div className="flex items-end justify-between border-b border-border pb-8">
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Narrative Bio Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-4 rounded-xl bg-transparent border border-border space-y-6 shadow-none">
              <form.Field name="content">
                {(field) => (
                  <div className="space-y-3">
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
                      className="min-h-[420px] bg-transparent border-border text-base font-medium leading-relaxed text-muted-foreground/80 rounded-lg focus-visible:ring-primary/20 resize-none font-sans"
                    />
                  </div>
                )}
              </form.Field>
            </Card>
          </div>

          {/* Impact Metrics Sidebar */}
          <div className="space-y-8">
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
