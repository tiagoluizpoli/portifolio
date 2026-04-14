import { RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeHeaderProps {
  isSaving: boolean;
  canSubmit: boolean;
  isPristine: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

export function HomeHeader({
  isSaving,
  canSubmit,
  isPristine,
  onReset,
  onSubmit,
}: HomeHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1 mb-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tighter uppercase transition-all duration-500">
          Home
        </h2>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">
          Core & Narrative
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isPristine || isSaving}
          className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-300 rounded-lg group"
        >
          <RotateCcw className="size-3 mr-2 opacity-40 group-hover:-rotate-90 transition-transform duration-500" />
          Discard
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={!canSubmit || isPristine || isSaving}
          className="h-9 px-6 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 rounded-lg group relative overflow-hidden bg-primary text-primary-foreground"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="size-3 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
              <span>Orchestrating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="size-3 opacity-60 group-hover:scale-110 transition-transform" />
              <span>Deploy Changes</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
