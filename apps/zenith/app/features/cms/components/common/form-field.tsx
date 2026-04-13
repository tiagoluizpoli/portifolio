import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * Universal CMS Form Field (Constitution §IV, §XVII)
 *
 * Provides a standardized, high-density UI wrapper for TanStack Form fields.
 * Decoupled from specific form schemas via a minimal FieldApi interface.
 */

interface MinimalFieldApi<TValue> {
  // biome-ignore lint/suspicious/noExplicitAny: required for TanStack field inference
  name: any;
  state: {
    value: TValue;
    meta: {
      // biome-ignore lint/suspicious/noExplicitAny: TanStack Form validator depth varies by adapter
      errors: any[];
    };
  };
  handleBlur: () => void;
  // biome-ignore lint/suspicious/noExplicitAny: required for generic functional updaters
  handleChange: (value: any) => void;
}

interface CmsFormFieldProps<TValue> {
  field: MinimalFieldApi<TValue>;
  label: string;
  placeholder?: string;
  className?: string;
  textarea?: boolean;
  type?: string;
  showBadge?: string;
  disabled?: boolean;
}

export function CmsFormField<TValue>({
  field,
  label,
  placeholder,
  className,
  textarea = false,
  type = 'text',
  showBadge,
  disabled = false,
}: CmsFormFieldProps<TValue>) {
  return (
    <div className="space-y-3">
      <Label
        htmlFor={field.name}
        className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
      >
        {label}
      </Label>
      <div className="relative">
        {textarea ? (
          <Textarea
            id={field.name}
            value={(field.state.value as string) || ''}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'min-h-[80px] bg-transparent border-border text-sm leading-relaxed rounded-lg focus-visible:ring-primary/20 resize-none',
              className,
            )}
          />
        ) : (
          <Input
            id={field.name}
            type={type}
            value={field.state.value as string | number}
            onBlur={field.handleBlur}
            onChange={(e) =>
              field.handleChange(
                type === 'number' ? Number(e.target.value) : e.target.value,
              )
            }
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'h-11 bg-transparent border-border text-base font-medium rounded-lg focus-visible:ring-primary/20',
              type === 'number' && 'no-spinner',
              className,
            )}
          />
        )}
        {showBadge && (
          <div className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none opacity-20">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {showBadge}
            </span>
          </div>
        )}
      </div>
      {field.state.meta.errors.length > 0 && (
        <p className="text-[10px] font-bold text-destructive uppercase tracking-tighter animate-in fade-in slide-in-from-top-1">
          {field.state.meta.errors.join(', ')}
        </p>
      )}
    </div>
  );
}
