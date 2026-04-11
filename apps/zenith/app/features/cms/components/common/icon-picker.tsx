import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { Grid, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDebounce } from '@/features/cms/hooks/use-debounce';
import { searchIcons } from '@/infrastructure/appwrite/server';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * IconPicker (Constitution §XVII, §I)
 * High-fidelity icon curation component.
 * Standardized as Zenith Cockpit Dialog (Round 4).
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['icon-search', debouncedSearch],
    queryFn: async () => {
      try {
        const response = await (
          searchIcons as unknown as (p: {
            data: string;
          }) => Promise<{ icons: string[]; total: number; error?: string }>
        )({ data: debouncedSearch });
        return response || { icons: [], total: 0 };
      } catch (error) {
        console.error('Icon query failed:', error);
        return { icons: [], total: 0, error: 'Network error' };
      }
    },
    enabled: isOpen && debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const suggestedIcons = [
    'lucide:home',
    'lucide:user',
    'lucide:briefcase',
    'lucide:zap',
    'lucide:code',
    'lucide:database',
    'lucide:cloud',
    'lucide:layers',
    'lucide:layout',
  ];

  const displayIcons =
    debouncedSearch.length >= 2 ? data?.icons || [] : suggestedIcons;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 px-4 h-10 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-all group w-full"
        >
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform overflow-hidden">
            {value ? (
              <Icon
                icon={value}
                className="size-5 opacity-60 group-hover:opacity-100 transition-opacity"
              />
            ) : (
              <Grid className="size-4" />
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground truncate flex-1 text-left">
            {value || 'Select Icon...'}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="p-6 border-b border-border bg-muted/5 relative">
          <div className="absolute top-6 left-6 size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Grid className="size-5" />
          </div>
          <div className="pl-14">
            <DialogTitle className="text-xl font-black uppercase tracking-widest text-foreground">
              Icon Curation
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
              Analyze and select high-fidelity visual assets
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
            <input
              type="text"
              id="icon-search"
              name="icon-search"
              placeholder="Search icons (e.g. 'react', 'typescript')..."
              className="w-full h-10 pl-10 pr-10 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
              value={search ?? ''}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="size-4 animate-spin text-primary/40" />
              </div>
            )}
          </div>

          <div className="h-[350px] overflow-y-auto pr-1 custom-scrollbar">
            {displayIcons.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {displayIcons.map((icon: string) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      onChange?.(icon);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'aspect-square rounded-xl border border-border flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/20 transition-all group p-2',
                      value === icon
                        ? 'bg-primary/10 border-primary/40 text-primary shadow-inner shadow-primary/20 scale-[0.98]'
                        : 'bg-muted/20 hover:bg-muted/40',
                    )}
                  >
                    <div className="size-10 bg-muted rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner p-2 shrink-0">
                      <Icon
                        icon={icon}
                        className="size-full opacity-40 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground/60 font-black truncate w-full px-1 text-center uppercase tracking-tighter">
                      {icon.includes(':') ? icon.split(':')[1] : icon}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="size-12 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
                  <Search className="size-5 text-muted-foreground/20" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  No visual assets found for "{debouncedSearch}"
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
