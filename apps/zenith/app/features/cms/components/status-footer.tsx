import { useCmsContext } from '../context/cms-context';
import { useMaturityAudit } from '../hooks/use-maturity-audit';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/**
 * CmsStatusFooter (Constitution §XVII, §I)
 * High-fidelity maturity progress indicator with integrated language orchestration and global execution.
 * Connected to live CmsContext.
 */
export function CmsStatusFooter() {
  const { progress, status } = useMaturityAudit();
  const { currentLocale, setLocale } = useCmsContext();

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

        {/* Status indicator for Draft/Live would go here once integrated with domain */}
      </div>
    </footer>
  );
}
