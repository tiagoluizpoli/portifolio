import {
  Code2,
  Cpu,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { useCmsContext } from '../../context/cms-context';
import type { Skill, SkillCategory } from '../../types/assets';
import { EMPTY_SKILL } from '../../types/assets';
import { IconPicker } from '../common/icon-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import { cn } from '@/lib/utils';

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
        id: Math.random().toString(36).substr(2, 9),
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
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                    Skill Identity
                  </Label>
                  <Input
                    placeholder="e.g. React, Docker, Python..."
                    value={currentSkill.name}
                    onChange={(e) =>
                      setCurrentSkill({ ...currentSkill, name: e.target.value })
                    }
                    className="bg-transparent border-border rounded-lg h-11"
                  />
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
                    <SelectTrigger className="w-full bg-transparent border-border rounded-lg h-11">
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
              <DialogFooter>
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={closeModal}
                    variant="ghost"
                    className="flex-1 text-[10px] uppercase font-bold tracking-widest bg-muted hover:bg-muted/80 text-muted-foreground"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={commitSkill}
                    className="flex-2 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] h-10 rounded-lg shadow-sm"
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
          <TabsList className="bg-muted border border-border rounded-md p-1 h-11 inline-flex items-center justify-center">
            {(['all', 'hard', 'soft', 'tool'] as const).map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="px-6 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Toolkit Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSkills.map((skill) => (
            <Card
              key={skill.id}
              className="group relative rounded-xl bg-card border border-border/50 p-5 flex flex-col items-center justify-center shadow-sm hover:border-primary/40 hover:bg-card hover:shadow-md transition-all duration-300 overflow-hidden h-[150px]"
            >
              {/* Action Toolkit (Edit / Discard) */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-0.5 rounded-md border border-border/50 shadow-sm z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditModal(skill)}
                  title="Modify Skill"
                  className="size-6 rounded-sm text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => removeSkill(skill.id, e)}
                  title="Discard Skill"
                  className="size-6 rounded-sm text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>

              <div className="size-[56px] shrink-0 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 mb-4 transition-all duration-500 shadow-inner">
                <div className="text-foreground/70 group-hover:text-primary transition-colors">
                  {skill.category === 'hard' && <Code2 className="size-6" />}
                  {skill.category === 'soft' && <Cpu className="size-6" />}
                  {skill.category === 'tool' && <Wrench className="size-6" />}
                </div>
              </div>

              <div className="flex flex-col w-full text-center items-center space-y-2">
                <h3 className="text-sm font-extrabold tracking-tight text-foreground line-clamp-1 w-full px-2">
                  {skill.name}
                </h3>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-transparent',
                    skill.category === 'hard' && 'bg-blue-500/15 text-blue-400',
                    skill.category === 'soft' &&
                      'bg-green-500/15 text-green-400',
                    skill.category === 'tool' &&
                      'bg-purple-500/15 text-purple-400',
                  )}
                >
                  {skill.category}
                </Badge>
              </div>
            </Card>
          ))}

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
    </div>
  );
}
