import type { MetricSource } from '@repo/appwrite-core/domain';
import { useForm } from '@tanstack/react-form';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { type ImpactMetricInput, metricSchema } from '../../../types/about';
import { IconPicker } from '../../common/icon-picker';
import { MetricDialogHeader } from './metric-dialog-header';
import { Button } from '@/components/ui/button';
import {
  DialogFooter,
  Dialog as StandardDialog,
  DialogContent as StandardDialogContent,
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
import { generateId } from '@/lib/utils';

interface MetricDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (metric: ImpactMetricInput) => void;
  sources: MetricSource[] | undefined;
  initialData?: ImpactMetricInput | null;
  aboutId: string;
  locale: string;
}

/**
 * MetricDialog (Constitution §XVII)
 * Orchestrator for impact metric recruitment.
 * Consolidated implementation to maintain type safety without 'any' prop passing.
 */
export function MetricDialog({
  isOpen,
  onClose,
  onSubmit,
  sources,
  initialData,
  aboutId,
  locale,
}: MetricDialogProps) {
  const isEditing = !!initialData;

  const form = useForm({
    defaultValues: (initialData || {
      id: generateId('metric'),
      aboutId,
      locale,
      internalCode: '',
      label: '',
      value: '',
      prefix: '',
      suffix: '',
      sourceId: 'manual',
      sourceKey: '',
      iconCode: '',
    }) as ImpactMetricInput,
    validators: {
      onChange: metricSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
      onClose();
    },
  });

  // Sync form state when editing target changes (§XVII)
  useEffect(() => {
    if (isOpen) {
      form.reset(
        (initialData || {
          id: generateId('metric'),
          aboutId,
          locale,
          internalCode: '',
          label: '',
          value: '',
          prefix: '',
          suffix: '',
          sourceId: 'manual',
          sourceKey: '',
          iconCode: '',
        }) as ImpactMetricInput,
      );
    }
  }, [initialData, isOpen, form.reset, aboutId, locale]);

  return (
    <StandardDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <StandardDialogContent className="sm:max-w-3xl bg-background border-border shadow-2xl p-0 overflow-hidden">
        <MetricDialogHeader isEditing={isEditing} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {/* Internal Fields Section */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="sourceId">
                {(field) => (
                  <div className="space-y-2 col-span-1">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40"
                    >
                      Source
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => field.handleChange(val)}
                    >
                      <SelectTrigger className="w-full !h-10 bg-transparent border-border focus:ring-primary/20 text-xs font-bold uppercase tracking-widest text-left">
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem
                          value="manual"
                          className="text-xs font-bold uppercase py-2"
                        >
                          Manual Input
                        </SelectItem>
                        {sources?.map((source) => (
                          <SelectItem
                            key={source.id}
                            value={source.id}
                            className="text-xs font-bold uppercase py-2"
                          >
                            {source.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              <form.Field name="iconCode">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40"
                    >
                      Icon
                    </Label>
                    <IconPicker
                      value={field.state.value}
                      onChange={(val) => field.handleChange(val)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="label">
                {(field) => (
                  <div className="space-y-2 col-span-1">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40"
                    >
                      Display Label
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Happy Clients"
                      className="!h-10 bg-transparent border-border focus:ring-primary/20 text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-[9px] font-bold text-destructive uppercase tracking-widest italic">
                          {String(
                            (
                              field.state.meta.errors[0] as {
                                message?: string;
                              }
                            )?.message || field.state.meta.errors[0],
                          )}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Field name="internalCode">
                {(field) => (
                  <div className="space-y-2 col-span-1">
                    <Label
                      htmlFor={field.name}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40"
                    >
                      Internal Key
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., clients_count"
                      className="!h-10 bg-transparent border-border focus:ring-primary/20 text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-[9px] font-bold text-destructive uppercase tracking-widest italic">
                          {String(
                            (
                              field.state.meta.errors[0] as {
                                message?: string;
                              }
                            )?.message || field.state.meta.errors[0],
                          )}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.sourceId}>
                {(sourceId) => (
                  <>
                    {sourceId === 'manual' ? (
                      <form.Field name="value">
                        {(field) => (
                          <div className="space-y-2 col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label
                              htmlFor={field.name}
                              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40"
                            >
                              Metric Value
                            </Label>
                            <Input
                              id={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder="e.g., 500"
                              className="!h-10 bg-transparent border-border focus:ring-primary/20 text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
                            />
                          </div>
                        )}
                      </form.Field>
                    ) : (
                      <form.Field name="sourceKey">
                        {(field) => (
                          <div className="space-y-2 col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label
                              htmlFor={field.name}
                              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40"
                            >
                              External Key Mapping
                            </Label>
                            <Input
                              id={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder="e.g., statistics.total_donations"
                              className="!h-10 bg-transparent border-border focus:ring-primary/20 text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
                            />
                          </div>
                        )}
                      </form.Field>
                    )}
                  </>
                )}
              </form.Subscribe>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                <form.Field name="prefix">
                  {(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40"
                      >
                        Prefix
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., +"
                        className="!h-10 bg-transparent border-border focus:ring-primary/20 text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="suffix">
                  {(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40"
                      >
                        Suffix
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g., k"
                        className="!h-10 bg-transparent border-border focus:ring-primary/20 text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/20"
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border pt-6 -mx-6 px-6 bg-muted/5">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-[10px] font-bold uppercase tracking-widest hover:bg-transparent h-10"
            >
              Discard
            </Button>
            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.isPristine,
              ]}
            >
              {([canSubmit, isSubmitting, isPristine]) => (
                <Button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    (!isEditing && (isPristine as boolean))
                  }
                  className="h-10 px-8 rounded-lg bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Save className="size-3" />
                  )}
                  {isEditing ? 'SAVE CHANGES' : 'SAVE METRIC'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </StandardDialogContent>
    </StandardDialog>
  );
}
