import { Info, RefreshCcw } from 'lucide-react';
import { useCmsContext } from '../../context/cms-context';
import { FileUploader } from '../common/file-uploader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
 * Connected to live cms-context for global orchestration.
 */
export function HomeForm() {
  const { state, currentLocale, updateSection } = useCmsContext();
  const formData = state.home[currentLocale];

  // Logic to sync with cms-context
  const handleChange = (field: string, value: string) => {
    updateSection('home', { ...formData, [field]: value });
  };

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

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold uppercase tracking-widest hover:bg-muted"
            >
              <RefreshCcw className="size-3 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-4 rounded-xl bg-transparent border border-border space-y-6 shadow-none">
              <div className="space-y-3">
                <Label
                  htmlFor="identity-name"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                >
                  Full Name / Identity
                </Label>
                <Input
                  id="identity-name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Tiago Luiz Poli"
                  className="h-12 bg-transparent border-border text-lg font-bold tracking-tight rounded-lg focus-visible:ring-primary/20"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="identity-headline"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                >
                  Headline / Hero Punchline
                </Label>
                <Textarea
                  id="identity-headline"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="What describes your core value?"
                  className="min-h-[100px] bg-transparent border-border text-base font-semibold leading-relaxed rounded-lg focus-visible:ring-primary/20 resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="identity-bio"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                >
                  Biography / Narrative
                </Label>
                <Textarea
                  id="identity-bio"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="A brief story of your professional journey..."
                  className="min-h-[160px] bg-transparent border-border text-sm leading-loose text-muted-foreground/80 rounded-lg focus-visible:ring-primary/20 resize-none"
                />
              </div>
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

              <FileUploader
                label="Profile Picture"
                variant="image"
                value={formData.profilePictureId}
                onChange={(id) => handleChange('profilePictureId', id)}
              />

              <FileUploader
                label="Bilingual CV / Resume (PDF)"
                variant="file"
                value={formData.cvId}
                onChange={(id) => handleChange('cvId', id)}
              />

              <div className="pt-2 w-full">
                <Separator className="bg-border" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
