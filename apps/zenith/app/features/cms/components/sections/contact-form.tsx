import type { ContactData } from '@repo/appwrite-core';
import { useEffect, useMemo } from 'react';
import { useCmsContext } from '../../context/cms-context';
import { usePlatformsQuery } from '../../hooks/use-cms-queries';
import type { ContactInput } from '../../types/contact';
import { CmsDiscardButton } from '../common/cms-discard-button';
import { CmsErrorState } from '../common/cms-error-state';
import { CmsSaveButton } from '../common/cms-save-button';
import { ContactFieldsSection } from './contact/contact-fields-section';
import { SocialPresenceSection } from './contact/social-presence-section';
import { type ContactFormInstance, useContactFormBase } from './contact/types';
import { Skeleton } from '@/components/ui/skeleton';
import { generateId } from '@/lib/utils';

/**
 * Section 07: Professional Outreach.
 * Orchestrates contact channel management (email, phone, location, social presence).
 */
export function ContactForm() {
  const { currentLocale, contact, saveSection, isSaving } = useCmsContext();
  const { data: platforms } = usePlatformsQuery();

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
          iconId:
            (item.iconId as string) ||
            (item.iconCode as string) ||
            'lucide:link',
          active: (item.active as boolean) ?? true,
          sort: (item.sort as number) ?? 0,
        };
      }),
    } as ContactInput;
  }, [contact.data, currentLocale]);

  const form: ContactFormInstance = useContactFormBase(
    initialData,
    async (value: ContactInput) => {
      const normalizedValue: ContactData = {
        ...(value as unknown as ContactData),
        socials: (value.socials || []).map((social) => ({
          ...social,
          iconId: social.iconId || 'lucide:link',
        })),
      };

      await saveSection('contact', normalizedValue);
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

  // Error state
  if (contact.isError) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
              Professional Outreach
            </h2>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold">
              Manage your contact channels and social presence
            </p>
          </div>
        </div>
        <CmsErrorState
          sectionName="Contact Information"
          errorMessage="Failed to load your contact information. Please check your connection."
          onRetry={() => window.location.reload()}
          showDismiss={false}
        />
      </div>
    );
  }

  if (contact.isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-6">
            {[1, 2, 3].map((id) => (
              <div key={`contact-field-${id}`} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-28 rounded-md" />
                <Skeleton className="h-7 w-24 rounded-md" />
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((id) => (
                <div
                  key={`social-skeleton-${id}`}
                  className="bg-card/30 border border-border/50 p-4"
                >
                  <div className="flex items-stretch h-full">
                    <div className="w-16 shrink-0 flex items-center justify-center border-r border-border/20 bg-muted/5">
                      <Skeleton className="size-11 rounded-xl" />
                    </div>

                    <div className="flex-1 px-4 py-1.5 flex flex-col min-w-0 gap-4">
                      <div className="grid grid-cols-2 gap-3 items-end">
                        <div className="space-y-1 min-w-35">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 overflow-hidden mt-auto ms-1">
                        <Skeleton className="h-3 w-16 shrink-0" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>

                    <div className="w-10 shrink-0 flex items-start justify-center border-l border-border/10 bg-muted/5">
                      <Skeleton className="size-7 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
          <ContactFieldsSection form={form} isLoading={contact.isLoading} />
        </div>

        {/* Social Meta */}
        <SocialPresenceSection
          form={form}
          isLoading={contact.isLoading}
          platforms={platforms || []}
          onAddSocial={addSocial}
          onRemoveSocial={removeSocial}
        />
      </div>
    </div>
  );
}
