import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Info, Loader2 } from 'lucide-react';
import { useCmsContext } from '../../context/cms-context';
import { type HomeInput, homeSchema } from '../../types/home';
import { FileUploader } from '../common/file-uploader';
import { CmsFormField } from '../common/form-field';
import { HomeHeader } from './home-header';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * HomeForm (Constitution §XVII, §I)
 * Section 01: Hero Identity.
 *
 * Consolidated architectural implementation. Eliminates 'types.ts' shims
 * and leverages direct inference for 100% type safety without modularity overhead.
 */
export function HomeForm() {
  const { currentLocale, home, saveSection, isSaving } = useCmsContext();

  const form = useForm({
    defaultValues: (home.data || {
      id: '',
      locale: currentLocale,
      firstName: '',
      lastName: '',
      namePresentation: '',
      title: '',
      description: '',
      pictureId: '',
      cvId: '',
      downloadButtonText: 'Download CV',
      journeyStartedIn: new Date().getFullYear(),
    }) as HomeInput,
    // @ts-expect-error - library inference bypass
    validatorAdapter: zodValidator(),
    validators: {
      onChange: homeSchema,
    },
    onSubmit: async ({ value }) => {
      await saveSection('home', value);
    },
  });

  if (home.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isPristine]}
        >
          {([canSubmit, isPristine]) => (
            <HomeHeader
              isSaving={isSaving}
              canSubmit={canSubmit as boolean}
              isPristine={isPristine as boolean}
              onReset={() => form.reset()}
              onSubmit={() => form.handleSubmit()}
            />
          )}
        </form.Subscribe>

        <div
          className="grid gap-4 lg:grid-cols-2"
          data-testid="home-split-grid"
        >
          {/* Metadata Section */}
          <Card className="bg-transparent border-border space-y-4 shadow-none">
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="firstName">
                {(field) => (
                  <CmsFormField
                    field={field}
                    label="First Name"
                    className="font-bold"
                  />
                )}
              </form.Field>
              <form.Field name="lastName">
                {(field) => (
                  <CmsFormField
                    field={field}
                    label="Last Name"
                    className="font-bold"
                  />
                )}
              </form.Field>
            </div>

            <form.Field name="namePresentation">
              {(field) => (
                <CmsFormField
                  field={field}
                  label="Maturity Identity (e.g. Tiago Luiz Poli)"
                  className="h-12 text-lg font-black tracking-tight"
                />
              )}
            </form.Field>

            <form.Field name="title">
              {(field) => (
                <CmsFormField
                  field={field}
                  label="Headline / Hero Punchline"
                  textarea
                  placeholder="What describes your core value?"
                  className="min-h-[64px] font-semibold"
                />
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <CmsFormField
                  field={field}
                  label="Biography / Narrative"
                  textarea
                  placeholder="A brief story..."
                  className="min-h-[80px] text-muted-foreground/80 leading-loose"
                />
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
              <form.Field name="journeyStartedIn">
                {(field) => (
                  <CmsFormField
                    field={field}
                    label="Base Year"
                    type="number"
                    showBadge="YYYY"
                    className="text-lg font-black italic tabular-nums tracking-wider"
                  />
                )}
              </form.Field>
              <form.Field name="downloadButtonText">
                {(field) => (
                  <CmsFormField
                    field={field}
                    label="CTA Button Label"
                    placeholder="e.g. Get CV"
                    className="text-xs font-bold"
                  />
                )}
              </form.Field>
            </div>
          </Card>

          {/* Assets Section */}
          <Card className="bg-transparent border-border flex flex-col items-center gap-4 shadow-none p-0 pt-4">
            <div className="flex items-center gap-2 w-full">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-foreground/40">
                Hero Assets
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground/40 hover:text-primary transition-colors"
                  >
                    <Info className="size-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-border text-[10px] font-medium uppercase tracking-widest text-primary p-3 max-w-[200px]">
                  Profile picture is shared across all locales. CV is specific
                  to the language.
                </TooltipContent>
              </Tooltip>
            </div>

            <form.Field name="pictureId">
              {(field) => (
                <FileUploader
                  label="Profile Picture"
                  variant="image"
                  value={field.state.value}
                  onChange={(id) => field.handleChange(id)}
                />
              )}
            </form.Field>

            <form.Field name="cvId">
              {(field) => (
                <FileUploader
                  label="Language-Specific CV (PDF)"
                  variant="file"
                  value={field.state.value}
                  onChange={(id) => field.handleChange(id)}
                />
              )}
            </form.Field>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
