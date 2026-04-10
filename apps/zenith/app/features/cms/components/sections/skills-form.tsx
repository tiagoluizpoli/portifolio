import type { Skill } from '@repo/appwrite-core/domain';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import {
  AppWindow,
  Briefcase,
  ChevronRight,
  Database,
  Layers,
  Layout,
  Plus,
  Save,
  Search,
  Server,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCmsContext } from '../../context/cms-context';
import { type SkillsInput, skillsSchema } from '../../types/assets';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateId } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All Tech', icon: Layers },
  { id: 'frontend', label: 'Frontend', icon: Layout },
  { id: 'backend', label: 'Backend', icon: Server },
  { id: 'fullstack', label: 'Full Stack', icon: Database },
  { id: 'tool', label: 'Workspace', icon: Briefcase },
] as const;

/**
 * SkillsForm (Constitution §XVII, §I)
 * Section 02: Technical Ordinance.
 */
export function SkillsForm() {
  const { currentLocale, skills, saveSection, isSaving } = useCmsContext();
  const [activeTab, setActiveTab] =
    useState<(typeof CATEGORIES)[number]['id']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const initialItems = useMemo<Skill[]>(() => {
    return (skills.data || []).map(
      (item) =>
        ({
          id: item.id || generateId('sk'),
          locale: item.locale || currentLocale,
          title: item.title || '',
          type: item.type || 'frontend',
          level: item.level ?? 80,
          iconCode: item.iconCode || 'lucide:code',
          status: (item.status === 'archived' ? 'archived' : 'active') as
            | 'active'
            | 'archived',
          sort: item.sort || 0,
        }) as Skill,
    );
  }, [skills.data, currentLocale]);

  const form = useForm({
    defaultValues: { items: initialItems } as SkillsInput,
    validatorAdapter: zodValidator(),
    validators: {
      // @ts-expect-error - TanStack Form depth limits (§XVII)
      onChange: skillsSchema,
    },
    onSubmit: async ({ value }) => {
      await saveSection('skills', value.items as unknown as Skill[]);
    },
  });

  useEffect(() => {
    if (skills.data) {
      form.reset({ items: initialItems } as SkillsInput);
    }
  }, [skills.data, form.reset, initialItems]);

  const addSkill = () => {
    form.setFieldValue('items', (prev: Skill[]) => [
      ...prev,
      {
        id: generateId(),
        locale: currentLocale,
        title: '',
        type: activeTab === 'all' ? 'frontend' : activeTab,
        level: 80,
        iconCode: 'lucide:code',
        status: 'active',
        sort: prev.length,
      },
    ]);
  };

  const removeSkill = (index: number) => {
    form.setFieldValue('items', (prev: Skill[]) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const filteredIndices = useMemo<number[]>(() => {
    const currentItems = (form.getFieldValue('items') as Skill[]) || [];
    return currentItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        const matchesSearch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      })
      .map(({ index }) => index);
  }, [form.getFieldValue('items'), activeTab, searchQuery]);

  if (skills.isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
            <Skeleton key={`skel-${id}`} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">
            Technical Ordinance
          </h2>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mt-1">
            Curate and categorize your engineering competencies
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isPristine]}
          >
            {([canSubmit, isPristine]) => (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPristine || isSaving}
                  onClick={() => form.reset()}
                  className="text-[10px] font-bold uppercase tracking-widest h-9"
                >
                  Discard Changes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!canSubmit || isSaving}
                  onClick={() => form.handleSubmit()}
                  className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest h-9 shadow-lg shadow-primary/20"
                >
                  {isSaving ? (
                    'Synchronizing...'
                  ) : (
                    <>
                      <Save size={12} className="mr-2" />
                      Save Stack
                    </>
                  )}
                </Button>
              </>
            )}
          </form.Subscribe>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
          <Input
            placeholder="Search technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card/20 border-border/40"
          />
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(val) =>
            setActiveTab(val as (typeof CATEGORIES)[number]['id'])
          }
          className="h-11"
        >
          <TabsList className="bg-card/40 border border-border/40 h-11 p-1">
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

      <div className="space-y-4">
        <form.Field name="items">
          {(field) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={addSkill}
                className="h-[104px] border border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 group transition-all"
              >
                <div className="size-8 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={16} className="text-muted-foreground/40" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Add Technology
                </span>
              </button>

              {filteredIndices.map((index: number) => {
                const item = field.state.value[index];
                const Icon =
                  CATEGORIES.find((c) => c.id === item.type)?.icon || AppWindow;

                return (
                  <Card
                    key={item.id}
                    className="bg-card/40 border border-border/40 overflow-hidden group hover:border-primary/40 transition-all duration-300"
                  >
                    <CardContent className="p-0">
                      <div className="px-4 py-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Icon size={16} className="text-primary" />
                          </div>
                          <div>
                            <form.Field name={`items[${index}].title`}>
                              {(subField) => (
                                <input
                                  value={subField.state.value}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) => subField.handleChange(e.target.value)}
                                  placeholder="Tech Name"
                                  className="bg-transparent border-none p-0 h-4 text-sm font-bold focus:ring-0 w-32 placeholder:text-muted-foreground/20"
                                />
                              )}
                            </form.Field>
                            <form.Field name={`items[${index}].type`}>
                              {(subField) => (
                                <Select
                                  value={subField.state.value}
                                  onValueChange={(val: Skill['type']) =>
                                    subField.handleChange(val)
                                  }
                                >
                                  <SelectTrigger className="h-4 p-0 border-none bg-transparent text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 hover:text-primary transition-colors focus:ring-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="frontend">
                                      Frontend
                                    </SelectItem>
                                    <SelectItem value="backend">
                                      Backend
                                    </SelectItem>
                                    <SelectItem value="fullstack">
                                      Full Stack
                                    </SelectItem>
                                    <SelectItem value="tool">
                                      Workspace/Tools
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </form.Field>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSkill(index)}
                          className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 rounded-full"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                      <div className="px-4 pb-3 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <form.Field name={`items[${index}].level`}>
                            {(subField) => (
                              <div
                                className="h-full bg-primary/50 transition-all duration-1000"
                                style={{ width: `${subField.state.value}%` }}
                              />
                            )}
                          </form.Field>
                        </div>
                        <form.Field name={`items[${index}].level`}>
                          {(subField) => (
                            <div className="flex items-center bg-primary/5 px-1.5 py-0.5 rounded border border-primary/20">
                              <input
                                type="number"
                                value={subField.state.value}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) =>
                                  subField.handleChange(Number(e.target.value))
                                }
                                className="w-5 bg-transparent border-none p-0 text-[10px] font-black text-primary text-center focus:ring-0"
                              />
                              <span className="text-[8px] font-black text-primary/50 ml-0.5">
                                %
                              </span>
                            </div>
                          )}
                        </form.Field>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </form.Field>
      </div>

      {!searchQuery && activeTab === 'all' && (
        <Card className="bg-primary/5 border-primary/20 border-dashed">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <ChevronRight className="text-primary size-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-1">
                Stack Optimization Tip
              </h4>
              <p className="text-[10px] leading-relaxed text-muted-foreground/80 font-medium">
                Keep your technical ordinance focused. Highlight around 12-16
                core technologies that define your current professional
                velocity.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
