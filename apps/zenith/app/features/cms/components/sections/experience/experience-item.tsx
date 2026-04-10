import { Briefcase, Calendar, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExperienceItemProps {
  index: number;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form's complex type passing
  form: any;
  onRemove: (index: number) => void;
}

export function ExperienceItem({ index, form, onRemove }: ExperienceItemProps) {
  const itemId = form.getFieldValue(`items[${index}].id`);

  return (
    <Card className="bg-card/50 border border-border/50 shadow-none overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <form.Field name={`items[${index}].title`}>
              {/* @ts-ignore - TanStack Form depth limits (§XVII) */}
              {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form recursion depth */}
              {(field: any) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                  >
                    Position Title
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        field.handleChange(e.target.value)
                      }
                      placeholder="Senior Software Engineer"
                      className="pl-10 bg-transparent h-10 text-sm font-bold"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name={`items[${index}].organization`}>
              {/* @ts-ignore - TanStack Form depth limits (§XVII) */}
              {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form recursion depth */}
              {(field: any) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                  >
                    Organization
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      field.handleChange(e.target.value)
                    }
                    placeholder="Tech Corp Inc."
                    className="bg-transparent h-10 text-sm"
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-4">
            <form.Field name={`items[${index}].period`}>
              {/* @ts-ignore - TanStack Form depth limits (§XVII) */}
              {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form recursion depth */}
              {(field: any) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                  >
                    Period
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        field.handleChange(e.target.value)
                      }
                      placeholder="Jan 2020 — Present"
                      className="pl-10 bg-transparent h-10 text-sm"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name={`items[${index}].location`}>
              {/* @ts-ignore - TanStack Form depth limits (§XVII) */}
              {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form recursion depth */}
              {(field: any) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                  >
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        field.handleChange(e.target.value)
                      }
                      placeholder="Remote / New York, NY"
                      className="pl-10 bg-transparent h-10 text-sm"
                    />
                  </div>
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-4">
            <form.Field name={`items[${index}].description`}>
              {/* @ts-ignore - TanStack Form depth limits (§XVII) */}
              {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form recursion depth */}
              {(field: any) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/60"
                  >
                    Description & Impact
                  </Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      field.handleChange(e.target.value)
                    }
                    placeholder="Led architecture for..."
                    className="bg-transparent min-h-[100px] text-xs resize-none"
                  />
                </div>
              )}
            </form.Field>

            <div className="flex items-center justify-between">
              {/* @ts-ignore - TanStack Form depth limits (§XVII) */}
              <form.Field name={`items[${index}].current`}>
                {/* @ts-ignore - TanStack Form depth limits (§XVII) */}
                {/* biome-ignore lint/suspicious/noExplicitAny: TanStack Form recursion depth */}
                {(field: any) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`current-${itemId}`}
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(!!checked)
                      }
                    />
                    <Label
                      htmlFor={`current-${itemId}`}
                      className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60"
                    >
                      Current Role
                    </Label>
                  </div>
                )}
              </form.Field>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={12} className="mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
