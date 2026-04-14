import type { ContactData } from '@repo/appwrite-core';
import { Mail, MapPin, Phone, Plus, Settings2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCmsContext } from '../../context/cms-context';
import { usePlatformsQuery } from '../../hooks/use-cms-queries';
import type { ContactInput } from '../../types/contact';
import { CmsDiscardButton } from '../common/cms-discard-button';
import { CmsSaveButton } from '../common/cms-save-button';
import { PlatformManagerDrawer } from '../platforms/platform-manager-drawer';
import { SocialItem } from './contact/social-item';
import { type ContactFormInstance, useContactFormBase } from './contact/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { generateId } from '@/lib/utils';

/**
 * Section 07: Professional Outreach.
 */
export function ContactForm() {
  const { currentLocale, contact, saveSection, isSaving } = useCmsContext();
  const { data: platforms } = usePlatformsQuery();
  const [isPlatformsOpen, setIsPlatformsOpen] = useState(false);

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
      socials: (
        (data.socials as unknown[]) ||
        (data.socialLinks as unknown[]) ||
        (data.social_links as unknown[]) ||
        []
      ).map((s) => {
        const item = s as Record<string, unknown>;
        return {
          ...item,
          platformId: (item.platformId as string) || '',
          username: (item.username as string) || (item.url as string) || '',
          active: (item.active as boolean) ?? true,
          sort: (item.sort as number) ?? 0,
        };
      }),
    } as ContactInput;
  }, [contact.data, currentLocale]);

  const form: ContactFormInstance = useContactFormBase(
    initialData,
    async (value: ContactInput) => {
      await saveSection('contact', value as unknown as ContactData);
    },
  );

  // Reactive reset when data arrives (§V)
  useEffect(() => {
    if (contact.data) {
      form.reset(initialData as ContactInput);
    }
  }, [contact.data, form.reset, initialData]);

  const addSocial = () => {
    form.pushFieldValue('socials', {
      id: generateId('soc'),
      platformId: '',
      username: '',
      iconId: 'lucide:link',
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
                canSubmit={canSubmit && !isPristine}
                onClick={() => form.handleSubmit()}
              />
            </div>
          )}
        </form.Subscribe>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Core Channels */}
        <div className="space-y-4">
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
          )}
        </div>

        {/* Social Meta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
              Social Presence
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPlatformsOpen(true)}
                className="h-7 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors"
              >
                <Settings2 size={12} className="mr-1" />
                Manage Platforms
              </Button>
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
          </div>

          <PlatformManagerDrawer
            open={isPlatformsOpen}
            onOpenChange={setIsPlatformsOpen}
          />

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
                    {field.state.value.map(
                      (_: ContactInput['socials'][number], index: number) => (
                        <SocialItem
                          key={field.state.value[index].id}
                          index={index}
                          form={form}
                          platforms={platforms || []}
                          onRemove={removeSocial}
                        />
                      ),
                    )}

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
