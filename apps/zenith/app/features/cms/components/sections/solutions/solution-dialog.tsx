import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { RefreshCcw, Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SolutionInput, solutionSchema } from '../../../types/assets';
import { IconPicker } from '../../common/icon-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SolutionInput | null;
  onSubmit: (data: SolutionInput) => void;
  currentLocale: string;
}

/**
 * SolutionDialog (Constitution §XVII, §I)
 * Professional Offering read-only card.
 * High-density layout with hover actions and visual asset previews.
 * Refined for padding optimization and high-visibility (Round 3.5).
 */
export function SolutionDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  currentLocale,
}: SolutionDialogProps) {
  const form = useForm({
    defaultValues: (initialData || {
      id: '',
      locale: currentLocale,
      title: '',
      description: '',
      iconCode: 'lucide:box',
      iconId: '',
      sort: 0,
    }) as SolutionInput,
    validatorAdapter: zodValidator(),
    validators: {
      onChange: solutionSchema,
    },
    onSubmit: async ({ value }: { value: SolutionInput }) => {
      onSubmit(value);
      onOpenChange(false);
    },
    // biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass
  } as any);

  // Sync form with initialData
  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
    } else if (open && !initialData) {
      form.reset({
        id: '',
        locale: currentLocale,
        title: '',
        description: '',
        iconCode: 'lucide:box',
        iconId: '',
        sort: 0,
      } as SolutionInput);
    }
  }, [open, initialData, form.reset, currentLocale]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">
            {initialData?.id
              ? 'Edit Professional Offering'
              : 'New Solution Architecture'}
          </DialogTitle>
          <DialogDescription className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest mt-1">
            Define high-impact value propositions and visual branding.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          {/* Title Field */}
          <form.Field name="title">
            {/* biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass */}
            {(field: any) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
                >
                  Solution Title
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Cloud-Native Transformation"
                  className="h-11 bg-card/20 border-border/40 font-bold"
                />
                {field.state.meta.errors && (
                  <p className="text-[9px] text-destructive font-bold uppercase tracking-wide px-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Description Field */}
          <form.Field name="description">
            {/* biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass */}
            {(field: any) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
                >
                  Narrative & Value Proposition
                </Label>
                <Textarea
                  id={field.name}
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe the solution methodology and primary outcomes..."
                  className="bg-card/20 border-border/40 min-h-[120px] text-sm resize-none"
                />
              </div>
            )}
          </form.Field>

          {/* IconPicker Field */}
          <form.Field name="iconCode">
            {/* biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass */}
            {(field: any) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Visual Branding
                </Label>
                <IconPicker
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val)}
                />
              </div>
            )}
          </form.Field>

          <DialogFooter className="pt-4 border-t border-border/40 -mx-6 px-6 bg-muted/20">
            <div className="flex w-full items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <RefreshCcw size={12} className="mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest h-9 px-6 rounded-lg shadow-lg shadow-primary/20"
              >
                <Save size={12} className="mr-2" />
                {initialData?.id ? 'Update Solution' : 'Commit Solution'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
