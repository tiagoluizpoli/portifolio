import { Mail, MapPin, Phone } from 'lucide-react';
import type { ContactFormInstance } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface ContactFieldsSectionProps {
  form: ContactFormInstance;
  isLoading: boolean;
}

/**
 * ContactFieldsSection
 * Displays core contact channels: email, phone, location.
 * Left column of the two-column contact layout.
 */
export function ContactFieldsSection({
  form,
  isLoading,
}: ContactFieldsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((id) => (
          <div key={`contact-field-${id}`} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <Label
              htmlFor="contactEmail"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
              <Input
                id="contactEmail"
                name="email"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                className="pl-10 bg-transparent border-border h-11"
              />
            </div>
          </div>
        )}
      </form.Field>

      <form.Field name="phone">
        {(field) => (
          <div className="space-y-2">
            <Label
              htmlFor="contactPhone"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
            >
              Phone / Whatsapp
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
              <Input
                id="contactPhone"
                name="phone"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                className="pl-10 bg-transparent border-border h-11"
              />
            </div>
          </div>
        )}
      </form.Field>

      <form.Field name="location">
        {(field) => (
          <div className="space-y-2">
            <Label
              htmlFor="contactLocation"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
            >
              Location
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
              <Input
                id="contactLocation"
                name="location"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                className="pl-10 bg-transparent border-border h-11"
              />
            </div>
          </div>
        )}
      </form.Field>
    </>
  );
}
