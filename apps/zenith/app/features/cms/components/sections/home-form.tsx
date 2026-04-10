import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Info, Loader2, RefreshCcw, Save } from 'lucide-react';
import { useCmsContext } from '../../context/cms-context';
import { type HomeInput, homeSchema } from '../../types/home';
import { FileUploader } from '../common/file-uploader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * HomeForm (Constitution §XVII, §I)
 * Section 01: Hero Identity.
 * Orchestrated with TanStack Form for strict validation and state management.
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
    // @ts-ignore - TanStack Form depth limits (§XVII)
    validatorAdapter: zodValidator(),
    validators: {
      // @ts-ignore - TanStack Form depth limits (§XVII)
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-8">
        {/* Editorial Header */}
        <div className="flex items-end justify-between border-b border-border pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-foreground font-display">
              Home{' '}
              <span className="text-primary/40 font-medium">
                / Hero Identity
              </span>
            </h1>
            <p className="text-sm text-muted-foreground/60 mt-2 font-medium uppercase tracking-widest">
              Section 01 — Managing the Hero Orchestration
            </p>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isPristine]}
          >
            {([canSubmit, isPristine]) => (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPristine || isSaving}
                  onClick={() => form.reset()}
                  className="text-xs font-bold uppercase tracking-widest hover:bg-muted h-9"
                >
                  <RefreshCcw className="size-3 mr-2" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  disabled={!canSubmit || isSaving}
                  onClick={() => form.handleSubmit()}
                  className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest h-9 shadow-lg shadow-primary/20"
                >
                  {isSaving ? (
                    <Loader2 className="size-3 mr-2 animate-spin" />
                  ) : (
                    <Save className="size-3 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </form.Subscribe>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 rounded-xl bg-transparent border border-border space-y-8 shadow-none">
              <div className="grid grid-cols-2 gap-6">
                <form.Field name="firstName">
                  {(field) => (
                    <div className="space-y-3">
                      <Label
                        htmlFor={field.name}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                      >
                        First Name
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 bg-transparent border-border text-base font-bold rounded-lg focus-visible:ring-primary/20"
                      />
                      {field.state.meta.errors && (
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-tighter">
                          {field.state.meta.errors.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="lastName">
                  {(field) => (
                    <div className="space-y-3">
                      <Label
                        htmlFor={field.name}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                      >
                        Last Name
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 bg-transparent border-border text-base font-bold rounded-lg focus-visible:ring-primary/20"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="namePresentation">
                {(field) => (
                  <div className="space-y-3">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                    >
                      Maturity Identity (e.g. Tiago Luiz Poli)
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-12 bg-transparent border-border text-lg font-black tracking-tight rounded-lg focus-visible:ring-primary/20"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="title">
                {(field) => (
                  <div className="space-y-3">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                    >
                      Headline / Hero Punchline
                    </Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="What describes your core value?"
                      className="min-h-[100px] bg-transparent border-border text-base font-semibold leading-relaxed rounded-lg focus-visible:ring-primary/20 resize-none"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-3">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                    >
                      Biography / Narrative
                    </Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="A brief story..."
                      className="min-h-[160px] bg-transparent border-border text-sm leading-loose text-muted-foreground/80 rounded-lg focus-visible:ring-primary/20 resize-none"
                    />
                  </div>
                )}
              </form.Field>
            </Card>

            <Card className="p-6 rounded-xl bg-transparent border border-border space-y-8 shadow-none">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">
                    Journey Origin
                  </h3>
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest mt-1">
                    When did the orchestration begin?
                  </p>
                </div>
                <form.Subscribe
                  selector={(state) => state.values.journeyStartedIn}
                >
                  {(year) => (
                    <span className="text-2xl font-black tabular-nums text-primary/40 italic">
                      {year}
                    </span>
                  )}
                </form.Subscribe>
              </div>

              <form.Field name="journeyStartedIn">
                {(field) => (
                  <div className="px-1">
                    <Slider
                      value={[field.state.value]}
                      min={1990}
                      max={new Date().getFullYear()}
                      step={1}
                      onValueChange={(val) => field.handleChange(val[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-[9px] font-bold text-muted-foreground/30">
                        1990
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground/30">
                        {new Date().getFullYear()}
                      </span>
                    </div>
                  </div>
                )}
              </form.Field>
            </Card>
          </div>

          {/* Asset Curation Sidebar */}
          <div className="space-y-8">
            <Card className="p-4 rounded-xl bg-transparent border border-border space-y-6 shadow-none flex flex-col items-center">
              <div className="flex items-center justify-between mb-4 px-1 w-full">
                <div className="flex items-center gap-2">
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
                    <TooltipContent className="bg-background border-border text-[10px] font-medium uppercase tracking-widest text-primary p-3">
                      Profile picture is shared across all locales. CV is
                      specific to the current language selection.
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                    label="Bilingual CV / Resume (PDF)"
                    variant="file"
                    value={field.state.value}
                    onChange={(id) => field.handleChange(id)}
                  />
                )}
              </form.Field>

              <div className="pt-2 w-full">
                <Separator className="bg-border" />
              </div>

              <form.Field name="downloadButtonText">
                {(field) => (
                  <div className="w-full space-y-3 px-1">
                    <Label
                      htmlFor={field.name}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40"
                    >
                      CTA Button Label
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Get CV"
                      className="h-10 bg-transparent border-border text-xs font-bold rounded-lg focus-visible:ring-primary/20"
                    />
                  </div>
                )}
              </form.Field>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
