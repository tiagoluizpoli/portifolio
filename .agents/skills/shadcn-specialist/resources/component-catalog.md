# Component Catalog — Exhaustive shadcn/ui Reference

Every component available in shadcn/ui, with its Radix dependency, installation command, and key props.

---

## Accordion
```bash
npx shadcn@latest add accordion
```
**Radix**: `@radix-ui/react-accordion`
**Sub-components**: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
**Props**: `type="single"|"multiple"`, `collapsible`, `defaultValue`, `value`, `onValueChange`

## Alert
```bash
npx shadcn@latest add alert
```
**Radix**: None
**Sub-components**: `Alert`, `AlertTitle`, `AlertDescription`
**Variants**: `default`, `destructive`

## AlertDialog
```bash
npx shadcn@latest add alert-dialog
```
**Radix**: `@radix-ui/react-alert-dialog`
**Sub-components**: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel`
**Use when**: Confirming destructive actions (delete, discard, etc.)

## AspectRatio
```bash
npx shadcn@latest add aspect-ratio
```
**Radix**: `@radix-ui/react-aspect-ratio`
**Props**: `ratio` (default: 1)

## Avatar
```bash
npx shadcn@latest add avatar
```
**Radix**: `@radix-ui/react-avatar`
**Sub-components**: `Avatar`, `AvatarImage`, `AvatarFallback`

## Badge
```bash
npx shadcn@latest add badge
```
**Radix**: None
**Variants**: `default`, `secondary`, `outline`, `destructive`

## Breadcrumb
```bash
npx shadcn@latest add breadcrumb
```
**Sub-components**: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`

## Button
```bash
npx shadcn@latest add button
```
**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes**: `default`, `sm`, `lg`, `icon`
**Props**: `asChild` — renders as child element (Slot pattern)

## Calendar
```bash
npx shadcn@latest add calendar
```
**Dep**: `react-day-picker`
**Props**: `mode="single"|"multiple"|"range"`, `selected`, `onSelect`, `disabled`

## Card
```bash
npx shadcn@latest add card
```
**Sub-components**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

## Carousel
```bash
npx shadcn@latest add carousel
```
**Dep**: `embla-carousel-react`
**Sub-components**: `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`

## Chart
```bash
npx shadcn@latest add chart
```
**Dep**: `recharts`
**Sub-components**: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`

## Checkbox
```bash
npx shadcn@latest add checkbox
```
**Radix**: `@radix-ui/react-checkbox`
**Props**: `checked`, `onCheckedChange`, `disabled`

## Collapsible
```bash
npx shadcn@latest add collapsible
```
**Radix**: `@radix-ui/react-collapsible`
**Sub-components**: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`

## Command
```bash
npx shadcn@latest add command
```
**Dep**: `cmdk`
**Sub-components**: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`

## ContextMenu
```bash
npx shadcn@latest add context-menu
```
**Radix**: `@radix-ui/react-context-menu`
**Sub-components**: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuSub`, `ContextMenuSubTrigger`, `ContextMenuSubContent`, `ContextMenuRadioGroup`

## DataTable
```bash
npx shadcn@latest add table
npm install @tanstack/react-table
```
**Dep**: `@tanstack/react-table`
**Features**: Column sorting, filtering, pagination, row selection, column visibility

## Dialog
```bash
npx shadcn@latest add dialog
```
**Radix**: `@radix-ui/react-dialog`
**Sub-components**: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`
**⚠️ MUST include**: `DialogTitle` and `DialogDescription` for accessibility

## Drawer
```bash
npx shadcn@latest add drawer
```
**Dep**: `vaul`
**Sub-components**: `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`, `DrawerClose`

## DropdownMenu
```bash
npx shadcn@latest add dropdown-menu
```
**Radix**: `@radix-ui/react-dropdown-menu`
**Sub-components**: Full sub-component tree (same as ContextMenu)

## Form
```bash
npx shadcn@latest add form
npm install react-hook-form @hookform/resolvers zod
```
**Dep**: `react-hook-form`, `@hookform/resolvers`, `zod`
**Sub-components**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`

## HoverCard
```bash
npx shadcn@latest add hover-card
```
**Radix**: `@radix-ui/react-hover-card`

## Input
```bash
npx shadcn@latest add input
```

## InputOTP
```bash
npx shadcn@latest add input-otp
```
**Dep**: `input-otp`

## Label
```bash
npx shadcn@latest add label
```
**Radix**: `@radix-ui/react-label`

## Menubar
```bash
npx shadcn@latest add menubar
```
**Radix**: `@radix-ui/react-menubar`

## NavigationMenu
```bash
npx shadcn@latest add navigation-menu
```
**Radix**: `@radix-ui/react-navigation-menu`

## Pagination
```bash
npx shadcn@latest add pagination
```

## Popover
```bash
npx shadcn@latest add popover
```
**Radix**: `@radix-ui/react-popover`

## Progress
```bash
npx shadcn@latest add progress
```
**Radix**: `@radix-ui/react-progress`

## RadioGroup
```bash
npx shadcn@latest add radio-group
```
**Radix**: `@radix-ui/react-radio-group`

## Resizable
```bash
npx shadcn@latest add resizable
```
**Dep**: `react-resizable-panels`

## ScrollArea
```bash
npx shadcn@latest add scroll-area
```
**Radix**: `@radix-ui/react-scroll-area`

## Select
```bash
npx shadcn@latest add select
```
**Radix**: `@radix-ui/react-select`

## Separator
```bash
npx shadcn@latest add separator
```
**Radix**: `@radix-ui/react-separator`

## Sheet
```bash
npx shadcn@latest add sheet
```
**Radix**: `@radix-ui/react-dialog` (variant)
**Props**: `side="top"|"right"|"bottom"|"left"`

## Sidebar
```bash
npx shadcn@latest add sidebar
```
**Architecture**: Provider + Trigger + Content pattern

## Skeleton
```bash
npx shadcn@latest add skeleton
```

## Slider
```bash
npx shadcn@latest add slider
```
**Radix**: `@radix-ui/react-slider`

## Sonner / Toast
```bash
npx shadcn@latest add sonner
```
**Dep**: `sonner`
**Usage**: `toast.success('Saved!')`, `toast.error('Failed!')`

## Switch
```bash
npx shadcn@latest add switch
```
**Radix**: `@radix-ui/react-switch`

## Table
```bash
npx shadcn@latest add table
```
**Sub-components**: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`

## Tabs
```bash
npx shadcn@latest add tabs
```
**Radix**: `@radix-ui/react-tabs`

## Textarea
```bash
npx shadcn@latest add textarea
```

## Toggle
```bash
npx shadcn@latest add toggle
```
**Radix**: `@radix-ui/react-toggle`

## ToggleGroup
```bash
npx shadcn@latest add toggle-group
```
**Radix**: `@radix-ui/react-toggle-group`

## Tooltip
```bash
npx shadcn@latest add tooltip
```
**Radix**: `@radix-ui/react-tooltip`
**⚠️ MUST wrap app in**: `<TooltipProvider>`
