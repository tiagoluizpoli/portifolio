import { Target } from 'lucide-react';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MetricDialogHeaderProps {
  isEditing: boolean;
}

/**
 * MetricDialogHeader (Constitution §XVII)
 * Displays current state and Radix-compliant description.
 */
export function MetricDialogHeader({ isEditing }: MetricDialogHeaderProps) {
  return (
    <div className="bg-primary/5 p-4 border-b border-border">
      <DialogHeader>
        <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Target className="size-4 text-primary" />
          </div>
          <span>{isEditing ? 'REFINE METRIC' : 'ADD METRIC'}</span>
        </DialogTitle>
        <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mt-1 ml-11">
          {isEditing
            ? 'Updating architectural impact telemetry'
            : 'Registering a new semantic impact metric'}
        </DialogDescription>
      </DialogHeader>
    </div>
  );
}
