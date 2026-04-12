# Form Patterns — react-hook-form + Zod + shadcn

## Standard Form Architecture

```
Schema (Zod)  →  react-hook-form  →  Form/FormField/FormItem  →  shadcn Input/Select/etc.
     ↓                  ↓                      ↓
   validation       state mgmt           UI rendering
```

### Full Form Template

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

// 1. Schema
const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
  bio: z.string().max(500).optional(),
  notifications: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

// 2. Component
export function UserForm({ defaultValues, onSubmit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: '', email: '', role: 'viewer', bio: '', notifications: true,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Text Input */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Select */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Textarea */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us about yourself..." {...field} />
              </FormControl>
              <FormDescription>Max 500 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Switch */}
        <FormField
          control={form.control}
          name="notifications"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Email Notifications</FormLabel>
                <FormDescription>Receive email updates.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  )
}
```

### Server Error Handling

```tsx
const onSubmit = async (data: FormData) => {
  try {
    await api.saveUser(data)
    toast.success('Saved!')
  } catch (err) {
    if (err instanceof ApiError && err.field) {
      form.setError(err.field as keyof FormData, { message: err.message })
    } else {
      form.setError('root', { message: 'Something went wrong' })
    }
  }
}

// Display root error at top of form:
{form.formState.errors.root && (
  <Alert variant="destructive">
    <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
  </Alert>
)}
```

### Dependent Fields

```tsx
// Watch a field to conditionally render others
const role = form.watch('role')

{role === 'admin' && (
  <FormField
    control={form.control}
    name="adminCode"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Admin Code</FormLabel>
        <FormControl>
          <Input type="password" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)}
```
