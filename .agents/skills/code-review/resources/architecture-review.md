# Architecture Review — SOLID, Patterns & God Class Detection

---

## SOLID Principles — Deep Application Guide

### S — Single Responsibility Principle

**The Rule**: A module/class/component should have one, and only one, reason to change.

**In React, "one responsibility" means**:
- A component renders one conceptual UI region
- A custom hook manages one slice of derived state
- A server function performs one operation
- A schema validates one entity

**Violations to catch:**
```typescript
// ❌ VIOLATION: Component that fetches, transforms, validates, and renders
const SkillsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/skills')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  }, []);
  
  const filteredSkills = data?.filter(s => s.active);
  const groupedSkills = groupBy(filteredSkills, 'category');
  
  return (/* 200 lines of JSX */)
};

// ✅ CORRECT: Each concern is isolated
// Fetching → useSkillsQuery (TanStack Query)
// Filtering → useSkillFilters (custom hook)
// Grouping → groupSkillsByCategory (pure function)
// Rendering → SkillsPage + SkillGroup + SkillCard
```

---

### O — Open/Closed Principle

**The Rule**: Software should be open for extension, closed for modification.

**In React, this means**:
- Adding new variants shouldn't require modifying existing component internals
- New functionality should come via props/slots, not if/else chains on existing props

**Violations to catch:**
```tsx
// ❌ VIOLATION: Every new type requires modifying the component
const Button = ({ type }: { type: 'primary' | 'secondary' | 'danger' | 'ghost' }) => {
  if (type === 'primary') return <button className="bg-blue-500" />;
  if (type === 'secondary') return <button className="bg-gray-200" />;
  if (type === 'danger') return <button className="bg-red-500" />;
  // Adding 'ghost' requires modifying this file
};

// ✅ CORRECT: Variants as data, not conditions
const buttonVariants = cva('base-button', {
  variants: {
    variant: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-200',
      danger: 'bg-red-500',
      ghost: 'bg-transparent',
    },
  },
  defaultVariants: { variant: 'primary' },
});
```

---

### L — Liskov Substitution Principle

**The Rule**: Subtypes must be substitutable for their base types without changing behavior.

**In TypeScript/React:**
```typescript
// ❌ VIOLATION: Extended type breaks the expected contract
interface Base {
  onClick: () => void;
}
interface Derived extends Base {
  onClick: (event: MouseEvent) => void; // Changed signature — breaks substitutability
}

// ❌ VIOLATION: Component that doesn't honor its prop contract
const Input = ({ value, onChange }: InputProps) => {
  // Ignores onChange when value equals '' — breaking the contract
  return <input value={value} onChange={v => v !== '' && onChange(v)} />;
};
```

---

### I — Interface Segregation Principle

**The Rule**: No code should depend on methods it doesn't use. Interfaces should be small & focused.

**Violations to catch:**
```typescript
// ❌ VIOLATION: Fat prop interfaces force consumers to pass unused props
interface CardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  avatarUrl?: string;
  authorName?: string;
  authorBio?: string;
  publishedAt?: Date;
  tags?: string[];
  category?: string;
  isFeatured?: boolean;
  // ...20 more
}

// ✅ CORRECT: Composition over monolithic interfaces
interface CardHeaderProps { title: string; description?: string }
interface CardMediaProps { imageUrl: string; alt: string }
interface CardAuthorProps { name: string; avatarUrl?: string }
```

---

### D — Dependency Inversion Principle

**The Rule**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Violations to catch:**
```typescript
// ❌ VIOLATION: Component directly imports a concrete implementation
import { appwriteClient } from '../lib/appwrite'; // Concrete!

const SkillsList = () => {
  useEffect(() => {
    appwriteClient.databases.listDocuments(...); // Direct coupling
  }, []);
};

// ✅ CORRECT: Component depends on an abstraction
const SkillsList = ({ useSkills }: { useSkills: () => SkillsResult }) => {
  const { data } = useSkills(); // Abstract hook
};

// Implementation detail is injected (or provided via React context)
<SkillsList useSkills={useAppwriteSkills} />
```

---

## God Class/Component Detection

### Hard Rule: 300 Lines Maximum

Any file exceeding 300 lines is automatically flagged as a God Class candidate. The number itself isn't the point — the point is that >300 lines almost always signals a responsibility violation.

### Detection Script
```bash
echo "=== GOD CLASS DETECTOR ==="
find . \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -name "*.test.*" \
  -not -name "*.spec.*" | \
  while read f; do
    lines=$(wc -l < "$f")
    if [ "$lines" -gt 300 ]; then
      hooks=$(grep -c "use[A-Z]" "$f" 2>/dev/null || echo 0)
      exports=$(grep -c "^export " "$f" 2>/dev/null || echo 0)
      echo "⚠️  $f"
      echo "   Lines: $lines | Hooks used: $hooks | Exports: $exports"
    fi
  done
```

### Decomposition Strategy

When a God Class is found, apply this decomposition algorithm:

1. **Identify all "reasons to change"** — list every concept the file owns
2. **Group related concepts** — which ones belong together?
3. **Select a pattern**: 
   - Same visual tree? → **Composite Pattern**
   - Shared form state? → **FormProvider + sub-components**
   - Shared data? → **Context + hook**
   - Pure logic? → **Custom hooks + utilities**
4. **Extract one at a time** — never rewrite all at once; extract + verify before next

### Composite Pattern Reference
```tsx
// God: <SkillDialog /> (450 lines)
// ↓
// Decomposed:
export { SkillDialog } from './skill-dialog.root';

// skill-dialog.root.tsx (~80 lines)
// skill-dialog.header.tsx (~40 lines)
// skill-dialog.form.tsx (~120 lines) — may decompose further
// skill-dialog.actions.tsx (~40 lines)
// skill-dialog.icon-picker.tsx (~80 lines)
// types.ts (~30 lines)
// index.ts (barrel)
```

---

## Design Pattern Anti-Patterns

### Prop Drilling > 2 Levels
```tsx
// ❌ VIOLATION: Data drilled through uninvolved intermediaries
<Page>   // has `user` prop
  <Layout user={user}>   // passes it through
    <Sidebar user={user}>  // passes it through
      <UserAvatar user={user} />  // finally uses it
    </Sidebar>
  </Layout>
</Page>

// ✅ CORRECTION: Context or component composition
const UserContext = createContext<User | null>(null);
// Or: Lift <UserAvatar /> to <Page /> level directly
```

### Over-State / Derived State
```tsx
// ❌ VIOLATION: Storing derived data in state
const [items, setItems] = useState<Item[]>([]);
const [filteredItems, setFilteredItems] = useState<Item[]>([]);  // DERIVED

useEffect(() => {
  setFilteredItems(items.filter(i => i.active));  // Keeping in sync
}, [items]);

// ✅ CORRECTION: Compute derived values inline
const filteredItems = useMemo(() => items.filter(i => i.active), [items]);
```

### Index as Key Anti-Pattern
```tsx
// ❌ VIOLATION: List index as key (causes diff issues with reordering)
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ CORRECTION: Stable, unique identifier
{items.map(item => <Item key={item.id} {...item} />)}
```

### Inline Object/Array Props (Referential Equality Killer)
```tsx
// ❌ VIOLATION: Creates a new object on every render
<MyComponent style={{ color: 'red' }} options={['a', 'b']} />

// ✅ CORRECTION: Defined outside component or memoized
const STYLE = { color: 'red' } as const;
const OPTIONS = ['a', 'b'] as const;
<MyComponent style={STYLE} options={OPTIONS} />
```

---

## Architectural Consistency Checklist

- [ ] Does the new code follow the same folder structure as existing code?
- [ ] Are all new components in `components/composed/` or `components/ui/`?
- [ ] Are server functions in `functions/` or `server/` (project convention)?
- [ ] Are schemas in `schemas/` with corresponding types in `types/`?
- [ ] Does the code follow the naming conventions of the rest of the codebase?
- [ ] Is the routing pattern consistent with existing routes?
- [ ] Are all new public APIs (exports, props) documented with JSDoc?
