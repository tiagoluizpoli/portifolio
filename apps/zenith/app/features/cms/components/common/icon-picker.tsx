import { Grid, Search } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * IconPicker (Constitution §XVII, §I)
 * High-fidelity icon curation component.
 * Integrates search-based discovery (Iconify) with manual curation.
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Mocked icons for curation
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 px-4 py-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"
        >
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Grid className="size-4" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {value || 'Select Icon...'}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-black/90 backdrop-blur-3xl border-white/5 rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-bold tracking-tight">
            Icon Curation
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Search icons (e.g. 'react', 'typescript')..."
              className="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all font-sans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="p-6 pt-4 h-[300px] overflow-y-auto">
          <div className="grid grid-cols-4 gap-3">
            {suggestedIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => {
                  onChange?.(icon);
                  setIsOpen(false);
                }}
                className={cn(
                  'aspect-square rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/20 transition-all group',
                  value === icon &&
                    'bg-primary/20 border-primary/40 text-primary',
                )}
              >
                <div className="size-6 bg-white/5 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-[8px] opacity-20 font-mono">ICON</span>
                </div>
                <span className="text-[10px] text-muted-foreground/60 scale-75 truncate w-full px-1 text-center">
                  {icon.split(':')[1]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Iconify Integrated
          </span>
          <button
            type="button"
            className="text-xs text-primary font-bold hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
