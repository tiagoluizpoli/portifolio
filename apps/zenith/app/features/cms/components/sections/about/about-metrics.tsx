import type { MetricSource } from '@repo/appwrite-core/domain';
import { Plus, Target } from 'lucide-react';
import { useState } from 'react';
import type { ImpactMetricInput } from '../../../types/about';
import { MetricCard } from './metric-card';
import { MetricDialog } from './metric-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Define a minimal interface for the form to satisfy both TS and Biome
interface MinimalForm {
  getFieldValue: (name: string) => unknown;
  setFieldValue: (name: string, value: unknown) => void;
}

interface AboutMetricsProps {
  form: unknown;
  sources: MetricSource[] | undefined;
  aboutId: string;
}

/**
 * AboutMetrics (Constitution §XVII)
 * Section 02 Sidebar: Impact Telemetry.
 * Refactored for full-width high-density management (Round 4 Refinement).
 */
export function AboutMetrics({ form, sources, aboutId }: AboutMetricsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const f = form as MinimalForm;
  const metrics = (f.getFieldValue('metrics') as ImpactMetricInput[]) || [];
  const currentLocale = (f.getFieldValue('locale') as string) || 'en';

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    // Explicitly update form state to trigger re-renders
    const currentMetrics = [...metrics];
    currentMetrics.splice(index, 1);
    f.setFieldValue('metrics', currentMetrics);
  };

  const getSourceTitle = (sourceId: string) => {
    if (sourceId === 'manual') return 'Manual Entry';
    console.log({ sources, sourceId });
    return sources?.find((s) => s.id === sourceId)?.title || 'Telemetry';
  };

  const handleSubmitMetric = (metric: ImpactMetricInput) => {
    const currentMetrics = [...metrics];
    if (editingIndex !== null) {
      currentMetrics[editingIndex] = metric;
    } else {
      currentMetrics.push(metric);
    }
    f.setFieldValue('metrics', currentMetrics);
    setIsDialogOpen(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* Editorial Header - Tightened for Round 4 Correction */}
      <div className="flex items-center justify-end px-1">
        <Button
          type="button"
          onClick={handleOpenAdd}
          className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all gap-2"
        >
          <Plus className="size-3" />
          Add Metric
        </Button>
      </div>

      <Separator className="bg-border/20" />

      {/* Metrics Grid/List - Compact Gaps */}
      <div className="grid gap-3">
        {metrics.map((metric: ImpactMetricInput, i: number) => (
          <MetricCard
            key={metric.id || `metric-${i}`}
            metric={metric}
            sourceTitle={getSourceTitle(metric.sourceId)}
            onEdit={() => handleOpenEdit(i)}
            onDelete={() => handleDelete(i)}
          />
        ))}

        {metrics.length === 0 && (
          <Card className="text-center py-8 border-2 border-dashed border-border/40 rounded-xl bg-transparent shadow-none group hover:border-primary/20 transition-all">
            <div className="space-y-3">
              <div className="size-10 rounded-full bg-muted/20 flex items-center justify-center mx-auto group-hover:bg-primary/5 transition-colors">
                <Target className="size-5 text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20">
                No telemetry data enlisted
              </p>
            </div>
          </Card>
        )}
      </div>

      <MetricDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmitMetric}
        sources={sources}
        initialData={editingIndex !== null ? metrics[editingIndex] : null}
        aboutId={aboutId}
        locale={currentLocale}
      />
    </div>
  );
}
