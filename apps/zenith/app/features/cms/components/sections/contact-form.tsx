import type { ContactData } from '@repo/appwrite-core';
import { useForm } from '@tanstack/react-form';
import { Mail, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useCmsContext } from '../../context/cms-context';
import {
  type ContactInput,
  contactSchema,
  type SocialLinkInput,
} from '../../types/contact';
import { CmsDiscardButton } from '../common/cms-discard-button';
import { CmsSaveButton } from '../common/cms-save-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { generateId } from '@/lib/utils';

/**
 * ContactForm (Constitution §XVII, §I)
 * Section 07: Professional Outreach.
 */
export function ContactForm() {
  const { currentLocale, contact, saveSection, isSaving } = useCmsContext();

  const initialData = useMemo(() => {
    const defaults = {
      id: generateId(),
      locale: currentLocale,
      email: '',
      phone: '',
      location: '',
      socials: [],
    };
    const data = (contact.data || {}) as Record<string, unknown>;
    return {
      ...defaults,
      ...data,
      socials:
        (data.socials as SocialLinkInput[]) ||
        (data.socialLinks as SocialLinkInput[]) ||
        (data.social_links as SocialLinkInput[]) ||
        [],
    } as ContactInput;
  }, [contact.data, currentLocale]);

  const form = useForm({
    defaultValues: initialData as ContactInput,
    validators: {
      // @ts-expect-error - TanStack Form depth limits (§XVII)
      onChange: contactSchema,
    },
    onSubmit: async ({ value }) => {
      await saveSection('contact', value as unknown as ContactData);
    },
  });

  // Reactive reset when data arrives (§V)
  useEffect(() => {
    if (contact.data) {
      form.reset(initialData as ContactInput);
    }
  }, [contact.data, form.reset, initialData]);

  const addSocial = () => {
    form.pushFieldValue('socials', {
      id: generateId('soc'),
      platform: '',
      url: '',
      iconId: '',
      active: true,
      sort: 0,
    });
  };

  const removeSocial = (index: number) => {
    form.removeFieldValue('socials', index);
  };

  if (contact.isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((id) => (
            <Skeleton
              key={`contact-skel-${id}`}
              className="h-24 w-full rounded-xl"
            />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((id) => (
              <Skeleton
                key={`social-skel-${id}`}
                className="h-20 w-full rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
            Contact Channels
          </h2>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mt-1">
            Orchestrate your professional outreach and social presence
          </p>
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isPristine]}
        >
          {([canSubmit, isPristine]) => (
            <div className="flex items-center gap-3">
              <CmsDiscardButton
                isSaving={isSaving}
                isPristine={isPristine}
                onClick={() => form.reset()}
              />
              <CmsSaveButton
                isSaving={isSaving}
                canSubmit={canSubmit}
                onClick={() => form.handleSubmit()}
              />
            </div>
          )}
        </form.Subscribe>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Core Channels */}
        <div className="space-y-6">
          {contact.isLoading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>
          ) : (
            <>
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-3">
                    <Label
                      htmlFor="contactEmail"
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                    >
                      Primary Email
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
                  <div className="space-y-3">
                    <Label
                      htmlFor="contactPhone"
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                    >
                      Professional Line
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
                  <div className="space-y-3">
                    <Label
                      htmlFor="contactLocation"
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60"
                    >
                      Geo Location
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
          )}
        </div>

        {/* Social Meta */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
              Social Presence
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addSocial}
              className="h-7 text-[9px] font-bold uppercase tracking-widest text-primary"
            >
              <Plus size={12} className="mr-1" />
              Add Social
            </Button>
          </div>

          <form.Field name="socials">
            {(field) => (
              <div className="space-y-4">
                {contact.isLoading ? (
                  [1, 2, 3].map((id) => (
                    <Card
                      key={`social-skeleton-${id}`}
                      className="bg-card/30 border border-border/50 p-4 relative group"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-9 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-9 w-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-8 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </Card>
                  ))
                ) : (
                  <>
                    {field.state.value.map((link, index) => (
                      <Card
                        key={link.id}
                        className="bg-card/30 border border-border/50 p-4 relative group"
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <form.Field name={`socials[${index}].platform`}>
                            {(subField) => (
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`social-platform-${index}`}
                                  className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider"
                                >
                                  Platform
                                </Label>
                                <Input
                                  id={`social-platform-${index}`}
                                  name={`socials[${index}].platform`}
                                  value={subField.state.value ?? ''}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                  placeholder="e.g. LinkedIn"
                                  className="bg-transparent h-9 text-xs"
                                />
                              </div>
                            )}
                          </form.Field>

                          <form.Field name={`socials[${index}].url`}>
                            {(subField) => (
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`social-url-${index}`}
                                  className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider"
                                >
                                  Profile URL
                                </Label>
                                <Input
                                  id={`social-url-${index}`}
                                  name={`socials[${index}].url`}
                                  value={subField.state.value ?? ''}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                  placeholder="https://..."
                                  className="bg-transparent h-9 text-xs"
                                />
                              </div>
                            )}
                          </form.Field>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <form.Field name={`socials[${index}].iconId`}>
                            {(subField) => (
                              <div className="flex items-center gap-3">
                                <Label
                                  htmlFor={`social-icon-${index}`}
                                  className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Icon ID
                                </Label>
                                <Input
                                  id={`social-icon-${index}`}
                                  name={`socials[${index}].iconId`}
                                  value={subField.state.value ?? ''}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                  placeholder="lucide:link"
                                  className="bg-transparent h-8 text-[10px] w-32"
                                />
                              </div>
                            )}
                          </form.Field>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocial(index)}
                            className="h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={12} className="mr-2" />
                            Remove
                          </Button>
                        </div>
                      </Card>
                    ))}

                    {field.state.value.length === 0 && (
                      <div className="h-32 border border-dashed border-border/60 rounded-lg flex items-center justify-center bg-card/10">
                        <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
                          No social links
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </form.Field>
        </div>
      </div>
    </div>
  );
}
