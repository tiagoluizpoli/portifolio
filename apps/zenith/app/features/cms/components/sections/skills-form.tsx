import { rectSortingStrategy } from '@dnd-kit/sortable';
import { Icon } from '@iconify/react';
import { Pencil, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCmsContext } from '../../context/cms-context';
import type { Skill, SkillCategory } from '../../types/assets';
import { EMPTY_SKILL } from '../../types/assets';
import { IconPicker } from '../common/icon-picker';
import { SortableList } from '../common/sortable-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, generateId } from '@/lib/utils';

/**
 * SkillsForm (Constitution §XVII, §I)
 * Section 05: Technical Competencies.
 * Connected to live cms-context for categorical skill curation.
 */
export function SkillsForm() {
  const { state, currentLocale, updateSection } = useCmsContext();
  const skills = state.skills[currentLocale];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentSkill, setCurrentSkill] =
    useState<Omit<Skill, 'id'>>(EMPTY_SKILL);

  const handleChange = (newSkills: Skill[]) => {
    updateSection('skills', newSkills);
  };

  const handleReorder = (reorderedSkills: Skill[]) => {
    if (activeCategory !== 'all') {
      const newSkills = [...skills];
      let filterIndex = 0;
      skills.forEach((s, i) => {
        if (s.category === activeCategory) {
          newSkills[i] = reorderedSkills[filterIndex++];
        }
      });
      handleChange(newSkills);
    } else {
      handleChange(reorderedSkills);
    }
  };

  const commitSkill = () => {
    if (editingId) {
      handleChange(
        skills.map((s) =>
          s.id === editingId ? { ...currentSkill, id: editingId } : s,
        ),
      );
    } else {
      const skill: Skill = {
        ...currentSkill,
        id: generateId('skill'),
      };
      handleChange([...skills, skill]);
    }
    closeModal();
  };

  const openAddModal = () => {
    setEditingId(null);
    setCurrentSkill(EMPTY_SKILL);
    setIsModalOpen(true);
  };

  const openEditModal = (skill: Skill) => {
    setEditingId(skill.id);
    setCurrentSkill({
      name: skill.name,
      category: skill.category,
      icon: skill.icon,
      status: skill.status || 'active',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setCurrentSkill(EMPTY_SKILL);
  };

  const removeSkill = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleChange(skills.filter((s) => s.id !== id));
  };

  const filteredSkills =
    activeCategory === 'all'
      ? skills
      : skills.filter((s) => s.category === activeCategory);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-8">
      {/* Editorial Header */}
      <div className="flex items-end justify-between border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground font-display">
            Skills{' '}
            <span className="text-primary/40 font-medium">
              / Technical Competencies
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-2 font-medium uppercase tracking-widest">
            Section 05 — Orchestrating the Technical Repository
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="text-xs font-bold uppercase tracking-widest hover:bg-muted"
          >
            <RefreshCcw className="size-3 mr-2" />
            Reset
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAddModal}
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary/5 font-bold uppercase tracking-widest text-[10px] px-6 rounded-lg transition-all"
              >
                <Plus className="size-3 mr-2" />
                Add New Skill
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-background border-border rounded-xl sm:max-w-[425px]"
              onInteractOutside={closeModal}
              onEscapeKeyDown={closeModal}
              onPointerDownOutside={closeModal}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {editingId ? 'Modify Curation Registry' : 'Curation Registry'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground/60">
                  Define the identity and classification of this technical
                  asset.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                      Skill Identity
                    </Label>
                    <Input
                      placeholder="e.g. React"
                      value={currentSkill.name}
                      onChange={(e) =>
                        setCurrentSkill({
                          ...currentSkill,
                          name: e.target.value,
                        })
                      }
                      className="bg-muted/30 border-border rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                      Lifecycle Status
                    </Label>
                    <Select
                      value={currentSkill.status}
                      onValueChange={(val) =>
                        setCurrentSkill({
                          ...currentSkill,
                          status: val as 'active' | 'archived',
                        })
                      }
                    >
                      <SelectTrigger className="w-full bg-muted/30 border-border rounded-lg h-11">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="active"
                          className="text-[10px] font-bold uppercase"
                        >
                          Active
                        </SelectItem>
                        <SelectItem
                          value="archived"
                          className="text-[10px] font-bold uppercase"
                        >
                          Archived
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                    Classification
                  </Label>
                  <Select
                    value={currentSkill.category}
                    onValueChange={(val) =>
                      val &&
                      setCurrentSkill({
                        ...currentSkill,
                        category: val as SkillCategory,
                      })
                    }
                  >
                    <SelectTrigger className="w-full bg-muted/30 border-border rounded-lg h-11">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(['hard', 'soft', 'tool'] as SkillCategory[]).map(
                        (cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className="uppercase tracking-widest text-[10px] font-black"
                          >
                            {cat}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                    Visual Anchor
                  </Label>
                  <IconPicker
                    value={currentSkill.icon}
                    onChange={(val) =>
                      setCurrentSkill({ ...currentSkill, icon: val })
                    }
                  />
                </div>
              </div>
              <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-4 mt-6 border-t border-border">
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={closeModal}
                    variant="ghost"
                    className="flex-1 text-[10px] uppercase font-bold tracking-widest h-10 hover:bg-muted"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={commitSkill}
                    className="flex-1 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] h-10 rounded-lg shadow-lg shadow-primary/20"
                  >
                    {editingId ? 'Save Changes' : 'Commit to Toolkit'}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-8">
        {/* Categorical Filters */}
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="bg-muted border border-border rounded-xl p-1 h-11 inline-flex items-center justify-center">
            {(['all', 'hard', 'soft', 'tool'] as const).map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="px-6 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Toolkit Directory */}
        <SortableList
          items={filteredSkills}
          onReorder={handleReorder}
          strategy={rectSortingStrategy}
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
          renderItem={(skill) => (
            <Card
              key={skill.id}
              className="group relative rounded-xl bg-card border border-border/80 p-4 flex flex-col items-center justify-between h-[180px] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
            >
              {/* TOP STRIP (Badges & Actions) */}
              <div className="w-full flex items-center justify-between gap-2 relative z-20">
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[9px] font-black uppercase tracking-widest px-1.5 py-0 border-none h-4.5 rounded-[0.25rem] bg-background/50 backdrop-blur-md shadow-sm',
                      skill.category === 'hard' && 'text-blue-500',
                      skill.category === 'soft' && 'text-emerald-500',
                      skill.category === 'tool' && 'text-violet-500',
                    )}
                  >
                    {skill.category}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[9px] h-4.5 font-black uppercase tracking-widest px-1.5 py-0 border-none rounded-[0.25rem] bg-background/50 backdrop-blur-md shadow-sm transition-colors',
                      skill.status === 'active'
                        ? 'text-emerald-500'
                        : 'text-muted-foreground/60',
                    )}
                  >
                    {skill.status || 'active'}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 duration-300">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => openEditModal(skill)}
                    className="size-6 rounded-lg bg-background border border-border shadow-sm text-foreground/60 hover:text-primary hover:border-primary/40 transition-all"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => removeSkill(skill.id, e)}
                    className="size-6 rounded-lg bg-background border border-border shadow-sm text-destructive/60 hover:text-destructive hover:border-destructive/40 transition-all"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>

              {/* CENTER ANCHOR (Icon) */}
              <div className="size-16 rounded-xl bg-muted/10 border border-border/40 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/30 transition-all duration-700 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-foreground/30 group-hover:text-primary transition-all duration-500 relative z-10 p-3 size-full flex items-center justify-center">
                  <Icon
                    icon={skill.icon || 'lucide:code'}
                    className="size-full"
                  />
                </div>
              </div>

              {/* BOTTOM STRIP (Identity) */}
              <div className="w-full text-center">
                <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                  {skill.name}
                </h3>
              </div>

              {/* Decorative Subtle Background */}
              <div className="absolute -bottom-8 -right-8 size-20 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            </Card>
          )}
        />

        {filteredSkills.length === 0 && (
          <Card className="col-span-full py-16 text-center rounded-[1rem] border-2 border-dashed border-border bg-transparent shadow-none">
            <Search className="size-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">
              No technical competencies identified in this sector
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
