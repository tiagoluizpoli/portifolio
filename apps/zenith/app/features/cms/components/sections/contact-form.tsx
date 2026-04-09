import {
  Dribbble,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCcw,
  Trash2,
  Twitch,
  Twitter,
  Youtube,
} from 'lucide-react';
import { useCmsContext } from '../../context/cms-context';
import type { SocialLink, SocialType } from '../../types/contact';
import { SortableList } from '../common/sortable-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn, generateId } from '@/lib/utils';

/**
 * ContactForm (Constitution §XVII, §I)
 * Section 07: Communication Channels.
 * Connected to live cms-context for global contact orchestration.
 */
export function ContactForm() {
  const { state, currentLocale, updateSection } = useCmsContext();
  const formData = state.contact[currentLocale];

  const handleChange = (data: typeof formData) => {
    updateSection('contact', data);
  };

  const addSocial = () => {
    const newSocial: SocialLink = {
      id: generateId('social'),
      type: 'github',
      url: '',
      active: true,
    };
    handleChange({ ...formData, socials: [...formData.socials, newSocial] });
  };

  const removeSocial = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleChange({
      ...formData,
      socials: formData.socials.filter((s) => s.id !== id),
    });
  };

  const updateSocial = (id: string, updates: Partial<SocialLink>) => {
    handleChange({
      ...formData,
      socials: formData.socials.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    });
  };

  const getSocialIcon = (type: SocialType) => {
    const props = { className: 'size-5', fill: 'currentColor' };
    switch (type) {
      case 'github':
        return <Github {...props} />;
      case 'linkedin':
        return <Linkedin {...props} />;
      case 'twitter':
        return <Twitter {...props} />;
      case 'instagram':
        return <Instagram {...props} />;
      case 'facebook':
        return <Facebook {...props} />;
      case 'youtube':
        return <Youtube {...props} />;
      case 'twitch':
        return <Twitch {...props} />;
      case 'dribbble':
        return <Dribbble {...props} />;
      default:
        return <Globe className="size-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mb-8">
      {/* Editorial Header */}
      <div className="flex items-end justify-between border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground font-display">
            Contact{' '}
            <span className="text-primary/40 font-medium">
              / Communication Channels
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-2 font-medium uppercase tracking-widest">
            Section 07 — Orchestrating the Visual Orbit
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-bold uppercase tracking-widest hover:bg-muted"
          >
            <RefreshCcw className="size-3 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Core Contact Info */}
        <div className="space-y-8">
          <Card className="p-4 bg-transparent border border-border space-y-6 shadow-none rounded-lg">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">
              Reachability Grid
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                  Primary Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      handleChange({ ...formData, email: e.target.value })
                    }
                    className="pl-10 bg-transparent border-border h-11 rounded-lg w-full"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                  Official Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      handleChange({ ...formData, phone: e.target.value })
                    }
                    className="pl-10 bg-transparent border-border h-11 rounded-lg w-full"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                  Base Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      handleChange({ ...formData, location: e.target.value })
                    }
                    className="pl-10 bg-transparent border-border h-11 rounded-lg w-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Social Curation */}
        <div className="space-y-8">
          <Card className="p-4 bg-card border border-border space-y-6 shadow-none rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">
                Social Presence
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-primary/20 text-primary hover:bg-primary/5 transition-all text-[10px] font-bold uppercase tracking-widest"
                onClick={addSocial}
              >
                <Plus className="size-3.5 mr-2" />
                Add Link
              </Button>
            </div>

            <SortableList
              items={formData.socials}
              onReorder={(newSocials) =>
                handleChange({ ...formData, socials: newSocials })
              }
              renderItem={(social) => (
                <div className="flex items-start gap-4 w-full group/card transition-all">
                  {/* Icon Block */}
                  <div
                    className={cn(
                      'size-[76px] shrink-0 rounded-xl flex items-center justify-center transition-all',
                      social.active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground/40',
                    )}
                  >
                    {getSocialIcon(social.type)}
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <Select
                        value={social.type}
                        onValueChange={(val) =>
                          updateSocial(social.id, { type: val as SocialType })
                        }
                      >
                        <SelectTrigger className="h-6 min-h-0 bg-transparent border-none p-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 focus:ring-0 w-fit hover:text-primary transition-colors">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="twitch">Twitch</SelectItem>
                          <SelectItem value="dribbble">Dribbble</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Separator className="flex-1 bg-border h-px" />
                      <div className="flex items-center gap-2 px-1">
                        <Checkbox
                          id={`active-${social.id}`}
                          checked={social.active}
                          onCheckedChange={(checked) =>
                            updateSocial(social.id, { active: !!checked })
                          }
                          className="rounded-sm size-4 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label
                          htmlFor={`active-${social.id}`}
                          className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 cursor-pointer hover:text-primary transition-colors"
                        >
                          {social.active ? 'Visible' : 'Hidden'}
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={social.url}
                        onChange={(e) =>
                          updateSocial(social.id, { url: e.target.value })
                        }
                        placeholder="https://..."
                        className="h-9 bg-transparent border-border rounded-md text-xs w-full"
                      />

                      {/* Standardized Remove Icon visible by default */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => removeSocial(social.id, e)}
                        className="size-9 shrink-0 rounded-md text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all opacity-100 bg-background/50 shadow-sm border border-border/50"
                        title="Discard Link"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            />

            {formData.socials.length === 0 && (
              <Card className="text-center py-10 border-2 border-dashed border-border rounded-2xl bg-transparent shadow-none">
                <Globe className="size-10 mx-auto text-muted-foreground/10 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 italic">
                  No social links curated
                </p>
              </Card>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
