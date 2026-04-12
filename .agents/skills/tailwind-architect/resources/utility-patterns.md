# Utility Patterns — Common Compositions

## Layout Compositions

### Full-Screen Center
```html
<div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-md p-6">Content</div>
</div>
```

### Sticky Header + Scrollable Content
```html
<div class="flex h-screen flex-col">
  <header class="sticky top-0 z-sticky border-b bg-background/80 backdrop-blur-xl">
    Header
  </header>
  <main class="flex-1 overflow-y-auto">
    Scrollable content
  </main>
</div>
```

### Sidebar Layout
```html
<div class="flex h-screen">
  <aside class="w-64 shrink-0 border-r bg-card overflow-y-auto">
    Sidebar
  </aside>
  <main class="flex-1 overflow-y-auto">
    Content
  </main>
</div>
```

### Auto-Fill Grid (Container Query Responsive)
```html
<div class="grid grid-cols-(repeat(auto-fill,minmax(280px,1fr))) gap-4">
  <!-- Cards auto-wrap based on container width -->
</div>
```

---

## Text Compositions

### Heading with Gradient
```html
<h1 class="bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent text-4xl font-bold tracking-tight">
  Gradient Heading
</h1>
```

### Truncated Text
```html
<!-- Single line -->
<p class="truncate">Very long text...</p>

<!-- Multi-line (clamp to 2 lines) -->
<p class="line-clamp-2">Long paragraph that wraps...</p>

<!-- Text balance (headings) -->
<h2 class="text-balance text-2xl font-semibold">
  A heading that wraps beautifully
</h2>
```

---

## Interactive Compositions

### Button with Inner Shadow
```html
<button class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
  shadow-(inset_0_1px_0_rgb(255_255_255/0.1))
  hover:shadow-(inset_0_1px_0_rgb(255_255_255/0.15),0_2px_8px_rgb(0_0_0/0.15))
  transition-all active:scale-[0.97]">
  Button
</button>
```

### Card with Hover Lift
```html
<div class="rounded-xl border bg-card p-6
  shadow-xs hover:shadow-md
  transition-all duration-200 hover:-translate-y-0.5">
  Card content
</div>
```

### Input with Focus Ring
```html
<input class="h-10 w-full rounded-lg border bg-background px-3 text-sm
  placeholder:text-muted-foreground
  focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
```

---

## Responsive Patterns

### Stack → Row
```html
<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
  <div>First</div>
  <div>Second</div>
</div>
```

### Hide/Show by Breakpoint
```html
<nav class="hidden md:flex">Desktop nav</nav>
<button class="md:hidden">Mobile menu</button>
```

### Responsive Padding
```html
<section class="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
  Responsive section
</section>
```

---

## Animation Compositions

### Fade In on Mount
```html
<div class="animate-fade-in">Content</div>
```

### Skeleton Shimmer
```html
<div class="animate-shimmer bg-linear-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] rounded-md h-4 w-32"></div>
```

### Spinner
```html
<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>
```
