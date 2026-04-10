import type { MetricSource } from '@repo/appwrite-core/domain';
import { Info, Plus, RefreshCcw, Trash2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { generateId } from '@/lib/utils';

interface AboutMetricsProps {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form's complex type passing
  form: any;
  sources: MetricSource[] | undefined;
  aboutId: string;
}

export function AboutMetrics({ form, sources, aboutId }: AboutMetricsProps) {
  const addMetric = () => {
    const metrics = form.getFieldValue('metrics') || [];
    if (metrics.length >= 3) return;

    form.setFieldValue('metrics', [
      ...metrics,
      {
        id: generateId('metric'),
        aboutId: aboutId,
        label: 'New Impact',
        value: '0',
        sourceId: 'manual',
      },
    ]);
  };

  return (
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
              Metrics help quantify your value. Max 3 items.
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-sm hover:bg-primary/20 hover:text-primary transition-all"
          onClick={addMetric}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* @ts-ignore - TanStack Form depth limits (§XVII) */}
      <form.Field name="metrics">
        {/* @ts-ignore - TanStack Form depth limits (§XVII) */}
        {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form recursion depth */}
        {(field: any) => (
          <div className="space-y-4">
            {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form recursion depth */}
            {field.state.value.map((metric: any, i: number) => (
              <Card
                key={metric.id}
                className="group relative p-4 rounded-lg bg-transparent border border-border hover:border-primary/20 transition-all animate-in fade-in zoom-in duration-300 shadow-none overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between pr-8">
                    <div className="flex items-center gap-2">
                      <Zap className="size-3 text-primary/40" />
                      {metric.sourceId !== 'manual' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black tracking-tighter text-primary/40 italic">
                            AUTO
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[8px] bg-primary/5 text-primary border-primary/20 h-4"
                          >
                            LIVE
                          </Badge>
                        </div>
                      ) : (
                        <Input
                          value={metric.value}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const new_metrics = [...(field.state.value || [])];
                            if (new_metrics[i]) {
                              new_metrics[i] = {
                                ...new_metrics[i],
                                value: e.target.value,
                              };
                              field.handleChange(new_metrics);
                            }
                          }}
                          className="h-6 max-w-[120px] bg-transparent border-none p-0 text-xl font-black tracking-tighter text-primary focus-visible:ring-0"
                        />
                      )}
                    </div>
                  </div>
                  <Input
                    value={metric.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const new_metrics = [...(field.state.value || [])];
                      if (new_metrics[i]) {
                        new_metrics[i] = {
                          ...new_metrics[i],
                          label: e.target.value,
                        };
                        field.handleChange(new_metrics);
                      }
                    }}
                    className="h-5 bg-transparent border-none p-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 focus-visible:ring-0"
                  />

                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                        Telemetry Source
                      </Label>
                      <Select
                        value={metric.sourceId}
                        onValueChange={(val: string) => {
                          const new_metrics = [...(field.state.value || [])];
                          new_metrics[i].sourceId = val;
                          field.handleChange(new_metrics);
                        }}
                      >
                        <SelectTrigger className="h-6 w-fit bg-transparent border-none p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary transition-colors focus:ring-0">
                          <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem
                            value="manual"
                            className="text-[10px] uppercase font-bold"
                          >
                            Manual Input
                          </SelectItem>
                          {sources?.map((source) => (
                            <SelectItem
                              key={source.id}
                              value={source.id}
                              className="text-[10px] uppercase font-bold"
                            >
                              {source.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {metric.sourceId !== 'manual' && (
                      <div className="flex items-center gap-2 mt-1 px-2 py-1.5 rounded-md bg-primary/5 border border-primary/10">
                        <RefreshCcw className="size-2.5 text-primary animate-spin-slow" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/80">
                          Orchestrated Sync Active
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute top-2 right-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // @ts-ignore - TanStack Form depth limits (§XVII)
                      const new_metrics = field.state.value.filter(
                        (_: unknown, idx: number) => idx !== i,
                      );
                      field.handleChange(new_metrics);
                    }}
                    className="size-7 rounded-sm text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all bg-background/50 backdrop-blur-sm shadow-sm border border-border/50"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            ))}

            {field.state.value.length === 0 && (
              <Card className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-transparent shadow-none">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20">
                  No metrics added
                </p>
              </Card>
            )}
          </div>
        )}
      </form.Field>

      <div className="pt-2">
        <Separator className="bg-border" />
      </div>
    </Card>
  );
}
