import { Icon } from '@iconify/react';
import { Trash2 } from 'lucide-react';
import type { PlatformInput } from '../../../types/assets';
import type { ContactInput } from '../../../types/contact';
import type { ContactFormInstance } from './types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SocialItemProps {
  index: number;
  form: ContactFormInstance;
  platforms: PlatformInput[];
  onRemove: (index: number) => void;
}

/**
 * Type-Safe Structural Guard (§XVII)
 * Narrows the polymorphic field union to the SocialLinkInput structure.
 */
function isSocialLink(val: unknown): val is ContactInput['socials'][number] {
  return typeof val === 'object' && val !== null && 'platformId' in val;
}

/**
 * SocialItem (Constitution §XVII, §I)
 * High-density relational social presence item.
 */
export function SocialItem({
  index,
  form,
  platforms,
  onRemove,
}: SocialItemProps) {
  const fieldName = `socials[${index}]` as const;

  return (
    <form.Field name={fieldName}>
      {(field) => {
        // Absolute Resilience Shield (§XVII)
        // Traps library-level proxy/initialization exceptions
        try {
          const link = field?.state?.value;
          if (!isSocialLink(link)) return null;

          const selectedPlatform = platforms?.find(
            (p) => p.id === link.platformId,
          );

          return (
            <Card className="bg-accent/30 border-8 border-amber-border/40 overflow-hidden group hover:shadow-lg transition-all duration-300 relative h-32 shadow-none py-4">
              <div className="flex items-stretch h-full">
                {/* Relational Icon Anchor */}
                <div className="w-16 shrink-0 flex items-center justify-center border-r border-border/20 bg-muted/5">
                  <div className="size-11 rounded-xl bg-muted/10 border border-border/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                    {selectedPlatform?.iconCode ? (
                      <Icon
                        icon={selectedPlatform.iconCode}
                        className="size-6 text-foreground/40 group-hover:text-primary transition-all duration-300"
                      />
                    ) : (
                      <div className="size-6 rounded-lg border-2 border-dashed border-border/40" />
                    )}
                  </div>
                </div>

                {/* Inputs Container */}
                <div className="flex-1 px-4 py-1.5 flex flex-col min-w-0 gap-4">
                  <div className="grid grid-cols-2 gap-3 items-end">
                    {/* Platform Selection */}
                    <div className="flex-1 space-y-1 min-w-[140px]">
                      <Label className="text-(9px) font-bold uppercase tracking-widest text-primary/60 leading-none ms-1">
                        Platform
                      </Label>
                      <Select
                        value={link.platformId}
                        onValueChange={(val) => {
                          // Strict dispatch via template interpolation (§XVII)
                          form.setFieldValue(
                            `socials[${index}].platformId`,
                            val as ContactInput['socials'][number]['platformId'],
                          );
                          const plat = platforms?.find((p) => p.id === val);
                          if (plat) {
                            form.setFieldValue(
                              `socials[${index}].iconId`,
                              plat.iconCode,
                            );
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-8 bg-transparent text-(11px) font-black border-border/40 truncate rounded-none focus:ring-1 focus:ring-primary/30">
                          <SelectValue placeholder="Social Hub" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[140px]">
                          {platforms
                            .filter((p) => p.status === 'active')
                            .map((p) => (
                              <SelectItem
                                key={p.id}
                                value={p.id || ''}
                                className="text-(11px) font-bold"
                              >
                                {p.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Handle Input */}
                    <div className="flex-[1.5] space-y-1 min-w-0">
                      <Label className="text-(9px) font-bold uppercase tracking-widest text-primary/60 leading-none ms-1">
                        Identity / Handle
                      </Label>
                      <Input
                        value={link.username ?? ''}
                        onChange={(e) =>
                          form.setFieldValue(
                            `socials[${index}].username`,
                            e.target.value,
                          )
                        }
                        placeholder={
                          selectedPlatform?.urlTemplate
                            ? 'e.g. zenith'
                            : 'URL...'
                        }
                        className="h-8 bg-transparent text-(11px) font-medium border-border/40 rounded-none focus-visible:ring-1 focus-visible:ring-primary/30"
                      />
                    </div>
                  </div>

                  {/* Variable Injection Preview */}
                  <div className="flex items-center gap-2 overflow-hidden mt-auto ms-1">
                    <span className="text-(10px) font-bold uppercase tracking-widest text-primary/70 shrink-0">
                      Live Link:
                    </span>
                    <p
                      className={cn('text-(12px) font-medium truncate', {
                        'text-foreground': link.username,
                        'text-muted-foreground/30 italic': !link.username,
                      })}
                    >
                      {(() => {
                        if (!link.username) return 'Awaiting Variable...';
                        if (selectedPlatform?.urlTemplate) {
                          return selectedPlatform.urlTemplate.replace(
                            '{value}',
                            link.username,
                          );
                        }
                        return link.username;
                      })()}
                    </p>
                  </div>
                </div>

                {/* Actions - Right Sidebar */}
                <div className="w-10 shrink-0 flex items-start justify-center opacity-0 group-hover:opacity-100 transition-all border-l border-border/10 bg-muted/5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="size-7 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </Card>
          );
        } catch (error) {
          console.error(error);
          // Zero-Fault Recovery (§XVII)
          return null;
        }
      }}
    </form.Field>
  );
}
