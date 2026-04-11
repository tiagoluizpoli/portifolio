import { Database, Layers, Layout, Plus, Search, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const CATEGORIES = [
  { id: 'all', label: 'All Tech', icon: Layers },
  { id: 'frontend', label: 'Frontend', icon: Layout },
  { id: 'backend', label: 'Backend', icon: Server },
  { id: 'fullstack', label: 'Full Stack', icon: Database },
] as const;

export type SkillCategory = (typeof CATEGORIES)[number]['id'];

interface SkillsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: SkillCategory;
  onTabChange: (tab: SkillCategory) => void;
  onAdd: () => void;
}

/**
 * SkillsFilters (Constitution §XVII)
 * Search and category orchestration for technical competencies.
 */
export function SkillsFilters({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onAdd,
}: SkillsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-x-3 gap-y-4 items-center">
      <div className="flex-1 relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
        <Input
          placeholder="Search technology..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 bg-card/20 border-border/40"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="h-10 px-6 border-border/40 bg-card/20 hover:bg-primary/10 hover:border-primary/50 group transition-all shrink-0"
      >
        <Plus
          size={16}
          className="mr-2 text-primary opacity-60 group-hover:scale-110 transition-transform"
        />
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          Add Technology
        </span>
      </Button>

      <Tabs
        value={activeTab}
        onValueChange={(val) => onTabChange(val as SkillCategory)}
        className="h-10 shrink-0"
      >
        <TabsList className="bg-card/40 border border-border/40 h-10 p-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="text-[10px] uppercase font-bold px-4"
            >
              <cat.icon size={12} className="mr-2 opacity-40" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
