# Composition Patterns — Combining shadcn Components

## 1. The Wrapper Pattern

Never modify `components/ui/` files. Instead, create wrappers in `components/composed/`:

```tsx
// components/composed/LoadingButton.tsx
import { Button, type ButtonProps } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, children, disabled, ...props }, ref) => (
    <Button ref={ref} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
)
```

## 2. Dialog + Form Composition

```tsx
// Every dialog with a form follows this structure
export function CreateItemDialog({ open, onOpenChange, onSubmit }: Props) {
  const form = useForm<Schema>({ resolver: zodResolver(schema) })

  const handleSubmit = async (data: Schema) => {
    await onSubmit(data)
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Item</DialogTitle>
          <DialogDescription>Add a new item to your collection.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* FormField components */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <LoadingButton type="submit" loading={form.formState.isSubmitting}>
                Create
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

## 3. Responsive Drawer/Dialog

Mobile shows a Drawer, desktop shows a Dialog:

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery'

export function ResponsiveModal({ open, onOpenChange, children }: Props) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  )
}
```

## 4. Combobox with Async Search

```tsx
export function AsyncCombobox({ onSelect, searchFn }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchFn(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox">Select...</Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} />
          <CommandList>
            {isLoading && <CommandLoading>Searching...</CommandLoading>}
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {results.map(item => (
                <CommandItem
                  key={item.id}
                  onSelect={() => { onSelect(item); setOpen(false) }}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

## 5. Confirm Delete with AlertDialog

```tsx
export function ConfirmDelete({ itemName, onConfirm }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The item will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```
