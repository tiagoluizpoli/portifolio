import { Info, Plus, RefreshCcw, Trash2, Zap } from 'lucide-react';
import { useCmsContext } from '../../context/cms-context';
import type { ImpactMetric } from '../../types/about';
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
 * AboutForm (Constitution §XVII, §I)
 * Section 02: Hero Narrative.
 * Connected to live cms-context for global orchestration.
 */
export function AboutForm() {
  const { state, currentLocale, updateSection } = useCmsContext();
  const formData = state.about[currentLocale];

  const handleChange = (data: typeof formData) => {
    updateSection('about', data);
  };

  const addStat = () => {
    const newStat: ImpactMetric = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Metric',
      value: '0',
    };
    handleChange({ ...formData, stats: [...formData.stats, newStat] });
  };

  const removeStat = (id: string) => {
    handleChange({
      ...formData,
      stats: formData.stats.filter((s) => s.id !== id),
    });
  };

  const updateStat = (id: string, field: keyof ImpactMetric, val: string) => {
    handleChange({
      ...formData,
      stats: formData.stats.map((s) =>
        s.id === id ? { ...s, [field]: val } : s,
      ),
    });
  };

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
          {/* Narrative Bio Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-4 rounded-xl bg-transparent border border-border space-y-6 shadow-none">
              <div className="space-y-3">
                <Label
                  htmlFor="about-narrative"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                >
                  Professional Bio / Long-form Narrative
                </Label>
                <Textarea
                  id="about-narrative"
                  value={formData.content}
                  onChange={(e) =>
                    handleChange({ ...formData, content: e.target.value })
                  }
                  placeholder="Tell your professional story..."
                  className="min-h-[360px] bg-transparent border-border text-base font-medium leading-relaxed text-muted-foreground/80 rounded-lg focus-visible:ring-primary/20 resize-none font-sans"
                />
              </div>
            </Card>
          </div>

          {/* Impact Metrics Sidebar */}
          <div className="space-y-8">
            <Card className="p-4 rounded-xl bg-transparent border border-border space-y-6 shadow-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-foreground/40">
                    Impact Metrics
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
                      Metrics help quantify your value. Use clear numbers (e.g.,
                      5+, 100%) and short descriptors.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-sm hover:bg-primary/20 hover:text-primary transition-all"
                  onClick={addStat}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {formData.stats.map((stat) => (
                  <Card
                    key={stat.id}
                    className="group relative p-4 rounded-lg bg-transparent border border-border hover:border-primary/20 transition-all animate-in fade-in zoom-in duration-300 shadow-none overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pr-8">
                        <div className="flex items-center gap-2">
                          <Zap className="size-3 text-primary/40" />
                          <Input
                            value={stat.value}
                            onChange={(e) =>
                              updateStat(stat.id, 'value', e.target.value)
                            }
                            className="h-6 max-w-[120px] bg-transparent border-none p-0 text-xl font-black tracking-tighter text-primary focus-visible:ring-0"
                          />
                        </div>
                      </div>
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          updateStat(stat.id, 'label', e.target.value)
                        }
                        className="h-5 bg-transparent border-none p-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 focus-visible:ring-0"
                      />
                    </div>

                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStat(stat.id)}
                        className="size-7 rounded-sm text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all opacity-100 bg-background/50 backdrop-blur-sm shadow-sm border border-border/50"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {formData.stats.length === 0 && (
                  <Card className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-transparent shadow-none">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20">
                      No metrics added
                    </p>
                  </Card>
                )}
              </div>

              <div className="pt-2">
                <Separator className="bg-border" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
