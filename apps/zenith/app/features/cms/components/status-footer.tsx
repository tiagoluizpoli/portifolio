import { Save } from 'lucide-react';
import { useCmsContext } from '../context/cms-context';
import { useMaturityAudit } from '../hooks/use-maturity-audit';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/**
 * CmsStatusFooter (Constitution §XVII, §I)
 * High-fidelity maturity progress indicator with integrated language orchestration and global execution.
 * Connected to live CmsContext.
 */
export function CmsStatusFooter() {
  const { progress, status } = useMaturityAudit();
  const {
    currentLocale,
    setLocale,
    isSaving,
    saveChanges,
    isPublished,
    setPublished,
  } = useCmsContext();

  const isMature = progress === 100;

  return (
    <footer className="h-16 border-t border-border bg-card/30 backdrop-blur-md px-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 leading-tight">
            Overall Maturity
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-widest',
                isMature ? 'text-primary' : 'text-destructive',
              )}
            >
              {status}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/40">
              {progress}%
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-48">
          <Progress value={progress} className="h-1.5 bg-white/5" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Language Toggler */}
        <Tabs
          value={currentLocale}
          onValueChange={(val) => setLocale(val as 'en' | 'pt')}
          className="h-8"
        >
          <TabsList className="h-8 bg-muted/50 border border-border p-1">
            {(['en', 'pt'] as const).map((lang) => (
              <TabsTrigger
                key={lang}
                value={lang}
                className="px-4 h-6 rounded-md text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                {lang}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* SC-004: Bilingual Maturity Lock */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {isPublished ? 'Live' : 'Draft'}
          </span>
          <Switch
            disabled={!isMature || isSaving}
            checked={isPublished}
            onCheckedChange={setPublished}
            className="data-[state=checked]:bg-primary"
            title={
              !isMature
                ? 'Requires 100% Maturity to Publish'
                : 'Toggle Live Status'
            }
          />
        </div>

        {/* Global Save Execution */}
        <Button
          onClick={saveChanges}
          disabled={isSaving}
          className="bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] px-6 rounded-md shadow-md shadow-primary/20 hover:scale-105 transition-transform h-8 ml-2"
        >
          {isSaving ? (
            'Synchronizing...'
          ) : (
            <>
              <Save size={12} className="mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </footer>
  );
}
