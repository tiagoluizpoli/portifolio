import { Icon } from '@iconify/react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { savePlatforms } from '../../../../infrastructure/cms/server';
import { CMS_KEYS, usePlatformsQuery } from '../../hooks/use-cms-queries';
import type { PlatformInput } from '../../types/assets';
import { CmsDiscardButton } from '../common/cms-discard-button';
import { CmsSaveButton } from '../common/cms-save-button';
import { IconPicker } from '../common/icon-picker';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PlatformManagerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * PlatformManagerDrawer (Constitution §XVII, §XIX)
 * Atomic side-drawer for Managing shared Platform metadata.
 * Implements "Variable Injection" pattern for URL templates.
 */
export function PlatformManagerDrawer({
  open,
  onOpenChange,
}: PlatformManagerDrawerProps) {
  const queryClient = useQueryClient();
  const { data: platforms, isLoading } = usePlatformsQuery();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: savePlatforms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CMS_KEYS.platforms() });
      toast.success('Platforms synchronized successfully');
    },
    onError: () => {
      toast.error('Failed to sync platforms');
    },
  });

  const form = useForm({
    defaultValues: {
      items: platforms || [],
    },
    onSubmit: async ({ value }) => {
      // biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass
      await mutation.mutateAsync({ data: value.items } as any);
    },
  });

  // Filtered platforms for the list
  const filteredPlatforms = (form.state.values.items || []).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const addPlatform = () => {
    const newItem: PlatformInput = {
      id: '',
      title: 'New Platform',
      urlTemplate: 'https://',
      iconCode: 'lucide:link',
      status: 'active',
      sort: form.state.values.items.length,
    };
    // biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass
    (form as any).setFieldValue('items', [...form.state.values.items, newItem]);
    setEditingId(''); // Mark as editing the new one (empty ID)
  };

  const removePlatform = (index: number) => {
    const newItems = [...form.state.values.items];
    newItems.splice(index, 1);
    // biome-ignore lint/suspicious/noExplicitAny: TanStack depth bypass
    (form as any).setFieldValue('items', newItems);
    if (editingId === form.state.values.items[index]?.id) {
      setEditingId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-primary/10">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black uppercase tracking-tighter">
                Platform Cockpit
              </SheetTitle>
              <SheetDescription className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                Manage global social presence and URL templates.
              </SheetDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addPlatform}
              className="h-8 text-[9px] font-bold uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
            >
              <Plus className="size-3 mr-2" />
              New Platform
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
            <Input
              placeholder="SEARCH PLATFORMS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-muted/30 border-none text-[10px] font-bold uppercase tracking-widest"
            />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))
            ) : filteredPlatforms.length === 0 ? (
              <div className="h-40 border border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center bg-muted/10 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                  No match found in headquarters
                </p>
              </div>
            ) : (
              filteredPlatforms.map((platform, _filteredIndex) => {
                const globalIndex = form.state.values.items.indexOf(platform);
                const isEditing = editingId === (platform.id || '');

                return (
                  <Card
                    key={platform.id || `new-${globalIndex}`}
                    size="sm"
                    className={cn(
                      'relative overflow-hidden transition-all duration-300 border border-solid bg-muted/40 hover:bg-muted/60',
                      isEditing
                        ? 'border-primary shadow-xl shadow-primary/5'
                        : 'border-border/40',
                    )}
                  >
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className="flex items-center gap-3 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-md p-0.5 w-full text-left bg-transparent border-none appearance-none font-sans"
                          onClick={() => setEditingId(platform.id || '')}
                        >
                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 overflow-hidden">
                            <Icon
                              icon={platform.iconCode}
                              className="size-4 opacity-60 transition-opacity"
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-tight">
                              {platform.title}
                            </h4>
                            <p className="text-[8px] font-medium text-muted-foreground/50 truncate max-w-[200px]">
                              {platform.urlTemplate}
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removePlatform(globalIndex)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="pt-3 border-t border-border/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-2 gap-3">
                            <form.Field name={`items[${globalIndex}].title`}>
                              {(field) => (
                                <div className="space-y-1.5">
                                  <Label className="text-[9px] font-bold uppercase text-muted-foreground/60">
                                    Label
                                  </Label>
                                  <Input
                                    value={field.state.value}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    className="h-9 text-xs font-bold"
                                  />
                                </div>
                              )}
                            </form.Field>

                            <form.Field name={`items[${globalIndex}].status`}>
                              {(field) => (
                                <div className="space-y-1.5">
                                  <Label className="text-[9px] font-bold uppercase text-muted-foreground/60">
                                    Status
                                  </Label>
                                  <Select
                                    value={field.state.value}
                                    onValueChange={(val) =>
                                      field.handleChange(
                                        val as 'active' | 'archived',
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-9 text-xs font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem
                                        value="active"
                                        className="text-xs"
                                      >
                                        Active
                                      </SelectItem>
                                      <SelectItem
                                        value="archived"
                                        className="text-xs"
                                      >
                                        Archived
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </form.Field>
                          </div>

                          <form.Field
                            name={`items[${globalIndex}].urlTemplate`}
                          >
                            {(field) => (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[9px] font-bold uppercase text-muted-foreground/60">
                                    URL Template
                                  </Label>
                                  <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">
                                    Use {'{value}'} as variable
                                  </span>
                                </div>
                                <Input
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  placeholder="https://github.com/{value}"
                                  className="h-9 text-xs font-medium"
                                />
                              </div>
                            )}
                          </form.Field>

                          <form.Field name={`items[${globalIndex}].iconCode`}>
                            {(field) => (
                              <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold uppercase text-muted-foreground/60">
                                  Identity Icon
                                </Label>
                                <IconPicker
                                  value={field.state.value}
                                  onChange={(val) => field.handleChange(val)}
                                />
                              </div>
                            )}
                          </form.Field>

                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(null)}
                              className="h-8 text-[9px] font-black uppercase tracking-widest text-primary"
                            >
                              Close Editor
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-4">
          <CmsDiscardButton
            isSaving={mutation.isPending}
            isPristine={!form.state.isDirty}
            onClick={() => {
              form.reset();
              setEditingId(null);
            }}
            className="flex-1"
          >
            Reset
          </CmsDiscardButton>
          <CmsSaveButton
            isSaving={mutation.isPending}
            canSubmit={form.state.canSubmit}
            onClick={() => form.handleSubmit()}
            className="flex-1"
          >
            Sync All Platforms
          </CmsSaveButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
