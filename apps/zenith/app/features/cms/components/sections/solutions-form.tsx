import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Plus,
  RefreshCcw,
  Rocket,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useCmsContext } from '../../context/cms-context';
import type { Solution } from '../../types/assets';
import { EMPTY_SOLUTION } from '../../types/assets';
import { IconPicker } from '../common/icon-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * SolutionsForm (Constitution §XVII, §I)
 * Section 06: Success Stories.
 * Connected to live cms-context for outcome-oriented case study management.
 */
export function SolutionsForm() {
  const { state, currentLocale, updateSection } = useCmsContext();
  const solutions = state.solutions[currentLocale];

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleChange = (newSolutions: Solution[]) => {
    updateSection('solutions', newSolutions);
  };

  const addSolution = () => {
    const newSolution: Solution = {
      ...EMPTY_SOLUTION,
      id: Math.random().toString(36).substr(2, 9),
    };
    handleChange([newSolution, ...solutions]);
    setExpandedId(newSolution.id);
  };

  const removeSolution = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleChange(solutions.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateSolution = (id: string, updates: Partial<Solution>) => {
    handleChange(
      solutions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-8">
      {/* Editorial Header */}
      <div className="flex items-end justify-between border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground font-display">
            Solutions{' '}
            <span className="text-primary/40 font-medium">
              / Success Stories
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-2 font-medium uppercase tracking-widest">
            Section 06 — Orchestrating the Outcomes
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
          <Button
            onClick={addSolution}
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/5 font-bold uppercase tracking-widest text-[10px] px-6 rounded-lg transition-all"
          >
            <Plus className="size-3 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        {solutions.map((solution) => (
          <Card
            key={solution.id}
            className={cn(
              'group relative rounded-xl bg-transparent border border-border p-5 transition-all duration-500 overflow-hidden shadow-none',
              expandedId === solution.id
                ? 'col-span-full border-primary/20 shadow-2xl shadow-primary/5'
                : 'hover:border-primary/10 hover:bg-primary/5',
            )}
          >
            {/* Solution Icon & Title */}
            <div className="flex items-start justify-between gap-4">
              <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500">
                <Rocket className="size-7" />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => removeSolution(solution.id, e)}
                  title="Discard Solution"
                  className="size-7 rounded-sm text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all opacity-100 bg-background/50 backdrop-blur-sm shadow-sm border border-border/50"
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(
                      expandedId === solution.id ? null : solution.id,
                    );
                  }}
                  className={cn(
                    'size-7 rounded-sm transition-all',
                    expandedId === solution.id
                      ? 'bg-primary/20 text-primary opacity-100'
                      : 'text-muted-foreground/40 hover:text-primary hover:bg-primary/5 opacity-100',
                  )}
                >
                  {expandedId === solution.id ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {expandedId === solution.id ? (
                <Input
                  value={solution.title}
                  onChange={(e) =>
                    updateSolution(solution.id, { title: e.target.value })
                  }
                  className="h-8 text-lg font-bold tracking-tight bg-transparent border-none p-0 focus-visible:ring-0 text-foreground"
                />
              ) : (
                <h3 className="text-base font-bold tracking-tight text-foreground truncate">
                  {solution.title}
                </h3>
              )}

              <p
                className={cn(
                  'text-[13px] text-muted-foreground/60 leading-relaxed font-medium transition-all',
                  expandedId === solution.id ? 'hidden' : 'line-clamp-2',
                )}
              >
                {solution.description ||
                  'No description provided yet. Orchestrate the success story...'}
              </p>
            </div>

            {/* Expanded Editorial Mode */}
            {expandedId === solution.id && (
              <div className="mt-8 pt-8 border-t border-border space-y-8 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                    Success Story Narrative
                  </Label>
                  <Textarea
                    value={solution.description}
                    onChange={(e) =>
                      updateSolution(solution.id, {
                        description: e.target.value,
                      })
                    }
                    className="min-h-[160px] bg-transparent border-border rounded-lg p-4 text-sm leading-loose focus:ring-primary/20"
                    placeholder="Describe the challenge, your solution, and the measurable outcome..."
                  />
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                      Reference URL / Case Study
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                      <Input
                        value={solution.url || ''}
                        onChange={(e) =>
                          updateSolution(solution.id, { url: e.target.value })
                        }
                        className="pl-10 bg-transparent border-border rounded-lg h-11"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                      Visual Anchor
                    </Label>
                    <IconPicker
                      value={solution.icon}
                      onChange={(icon) => updateSolution(solution.id, { icon })}
                    />
                  </div>
                </div>
              </div>
            )}

            {!expandedId && solution.url && (
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <a
                  href={solution.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="size-3" />
                  View Result
                </a>
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                  Outcome Validated
                </span>
              </div>
            )}
          </Card>
        ))}

        {solutions.length === 0 && (
          <Card className="col-span-full py-20 text-center rounded-[2rem] border-2 border-dashed border-border bg-transparent shadow-none">
            <Rocket className="size-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 italic">
              No success stories archived yet
            </p>
            <Button
              variant="ghost"
              onClick={addSolution}
              className="mt-4 text-primary font-bold uppercase tracking-widest text-[10px]"
            >
              Start Archiving
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
