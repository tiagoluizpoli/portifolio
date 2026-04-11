import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { RefreshCcw, Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SkillInput, skillSchema } from '../../../types/assets';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SkillInput | null;
  onSubmit: (data: SkillInput) => void;
}

/**
 * SkillDialog (Constitution §XVII, §I)
 * Managed Dialog for technical competency CRUD.
 * Orchestrates localized form state and validation.
 * Refined for high visibility on dark backgrounds (Round 3.5).
 */
export function SkillDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: SkillDialogProps) {
  const form = useForm({
    defaultValues: (initialData || {
      id: '',
      title: '',
      type: 'frontend',
      iconCode: 'lucide:code',
      status: 'active',
      sort: 0,
    }) as SkillInput,
    validatorAdapter: zodValidator(),
    validators: {
      onChange: skillSchema,
    },
    onSubmit: async ({ value }: { value: SkillInput }) => {
      onSubmit(value);
      onOpenChange(false);
    },
    // biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass
  } as any);

  // Sync form with initialData when it changes or dialog opens
  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
    } else if (open && !initialData) {
      form.reset({
        id: '',
        title: '',
        type: 'frontend',
        iconCode: 'lucide:code',
        status: 'active',
        sort: 0,
      } as SkillInput);
    }
  }, [open, initialData, form.reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">
            {initialData?.id ? 'Edit Competency' : 'Add New Technology'}
          </DialogTitle>
          <DialogDescription className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest mt-1">
            Configure technical metadata and visual identification.
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
                  Technology Name
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. React, PostgreSQL, Docker"
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

          <div className="grid grid-cols-2 gap-4">
            {/* Type Field */}
            <form.Field name="type">
              {/* biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass */}
              {(field: any) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
                  >
                    Engineering Type
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(
                        val as 'frontend' | 'backend' | 'fullstack',
                      )
                    }
                  >
                    <SelectTrigger className="h-11 bg-card/20 border-border/40 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="fullstack">Full Stack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            {/* Status Field */}
            <form.Field name="status">
              {/* biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass */}
              {(field: any) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
                  >
                    Lifecycle Status
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as 'active' | 'archived')
                    }
                  >
                    <SelectTrigger className="h-11 bg-card/20 border-border/40 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          {/* IconPicker Field */}
          <form.Field name="iconCode">
            {/* biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass */}
            {(field: any) => (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Visual Asset
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
                {initialData?.id ? 'Update Skill' : 'Commit New Skill'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
