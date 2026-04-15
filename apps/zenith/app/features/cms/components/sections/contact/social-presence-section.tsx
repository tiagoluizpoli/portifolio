import type { Platform } from '@repo/appwrite-core';
import { Plus, Settings2 } from 'lucide-react';
import { useState } from 'react';
import type { ContactInput } from '../../../types/contact';
import { PlatformManagerDrawer } from '../../platforms/platform-manager-drawer';
import { SocialItem } from './social-item';
import type { ContactFormInstance } from './types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface SocialPresenceSectionProps {
  form: ContactFormInstance;
  isLoading: boolean;
  platforms: Platform[];
  onAddSocial: () => void;
  onRemoveSocial: (index: number) => void;
}

/**
 * SocialPresenceSection
 * Manages user's social platform presence and linked accounts.
 * Right column of the two-column contact layout.
 */
export function SocialPresenceSection({
  form,
  isLoading,
  platforms,
  onAddSocial,
  onRemoveSocial,
}: SocialPresenceSectionProps) {
  const [isPlatformsOpen, setIsPlatformsOpen] = useState(false);

  return (
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
            onClick={onAddSocial}
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
            {isLoading ? (
              [1, 2, 3].map((id) => (
                <Card
                  key={`social-skeleton-${id}`}
                  className="bg-card/30 border border-border/50 p-4 relative group overflow-hidden"
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
                      onRemove={onRemoveSocial}
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
  );
}
