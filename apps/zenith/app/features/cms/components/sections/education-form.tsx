import {
  Calendar,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Plus,
  RefreshCcw,
  School,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useCmsContext } from '../../context/cms-context';
import type { HistoryItem } from '../../types/history';
import { EMPTY_HISTORY_ITEM } from '../../types/history';
import { SortableList } from '../common/sortable-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { generateId } from '@/lib/utils';

/**
 * EducationForm (Constitution §XVII, §I)
 * Chapter 4: Academic Foundation.
 * Connected to live cms-context for global orchestration and reordering.
 */
export function EducationForm() {
  const { state, currentLocale, updateSection } = useCmsContext();
  const items = state.education[currentLocale];

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleChange = (newItems: HistoryItem[]) => {
    updateSection('education', newItems);
  };

  const addItem = () => {
    const newItem: HistoryItem = {
      ...EMPTY_HISTORY_ITEM,
      id: generateId('edu'),
      type: 'education',
      locale: currentLocale,
      mainTitle: 'New Degree',
      subTitle: 'New Institution',
    };
    handleChange([newItem, ...items]);
    setExpandedId(newItem.id);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleChange(items.filter((i) => i.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateItem = (id: string, updates: Partial<HistoryItem>) => {
    handleChange(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-8">
      {/* Editorial Header */}
      <div className="flex items-end justify-between border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground font-display">
            Education{' '}
            <span className="text-primary/40 font-medium">
              / Academic Milestones
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-2 font-medium uppercase tracking-widest">
            Section 04 — Orchestrating the Knowledge Baseline
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
            onClick={addItem}
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/5 font-bold uppercase tracking-widest text-[10px] px-6 rounded-lg transition-all"
          >
            <Plus className="size-3 mr-2" />
            Add Education
          </Button>
        </div>
      </div>

      <div className="w-full">
        <SortableList
          items={items}
          onReorder={handleChange}
          renderItem={(item) => (
            <Card className="bg-transparent border border-border shadow-none group transition-all duration-300">
              {/* Card Header (Clickable to Expand) */}
              <button
                type="button"
                className="w-full flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-t-lg transition-colors hover:bg-muted/50 p-4"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-primary/40" />
                    <h3 className="text-lg font-bold tracking-tight text-foreground truncate">
                      {item.mainTitle || 'Untitled Degree'}
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5 ml-6">
                    {item.subTitle || 'Unknown Institution'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground/40 shrink-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <Calendar className="size-3" />
                    <span className="max-w-[120px] truncate">
                      {item.from} — {item.to || 'Present'}
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4 bg-border" />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => removeItem(item.id, e)}
                    className="size-7 rounded-sm text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all z-10"
                    title="Discard Education"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>

                  {expandedId === item.id ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </div>
              </button>

              {/* Expandable Form */}
              {expandedId === item.id && (
                <CardContent className="pt-6 border-t border-border space-y-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                        Degree / Qualification
                      </Label>
                      <Input
                        value={item.mainTitle}
                        onChange={(e) =>
                          updateItem(item.id, { mainTitle: e.target.value })
                        }
                        className="bg-transparent border-border rounded-lg h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                        Institution / School
                      </Label>
                      <Input
                        value={item.subTitle}
                        onChange={(e) =>
                          updateItem(item.id, { subTitle: e.target.value })
                        }
                        className="bg-transparent border-border rounded-lg h-11"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                        Location
                      </Label>
                      <div className="relative">
                        <School className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                        <Input
                          value={item.location}
                          onChange={(e) =>
                            updateItem(item.id, { location: e.target.value })
                          }
                          className="pl-10 bg-transparent border-border rounded-lg h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                        From
                      </Label>
                      <Input
                        value={item.from}
                        onChange={(e) =>
                          updateItem(item.id, { from: e.target.value })
                        }
                        placeholder="YYYY"
                        className="bg-transparent border-border rounded-lg h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                        To
                      </Label>
                      <Input
                        value={item.to || ''}
                        disabled={item.current}
                        onChange={(e) =>
                          updateItem(item.id, { to: e.target.value })
                        }
                        placeholder={item.current ? 'Present' : 'YYYY'}
                        className="bg-transparent border-border rounded-lg h-11 disabled:opacity-20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    <Checkbox
                      id={`current-${item.id}`}
                      checked={item.current}
                      onCheckedChange={(checked: boolean) =>
                        updateItem(item.id, { current: checked })
                      }
                      className="size-4 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label
                      htmlFor={`current-${item.id}`}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 cursor-pointer hover:text-primary transition-colors"
                    >
                      I am currently studying here
                    </Label>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                      Details & Honors
                    </Label>
                    <Textarea
                      value={item.content}
                      onChange={(e) =>
                        updateItem(item.id, { content: e.target.value })
                      }
                      className="min-h-[140px] bg-transparent border-border rounded-lg resize-none leading-relaxed p-4"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        />
      </div>
    </div>
  );
}
