# Deprecated Code Detection — Complete Pattern Catalog

This is the active scanner reference. Every pattern here triggers an immediate flagged finding in the review report, with the exact replacement and risk classification.

---

## Risk Classifications

| Level | Meaning | Action |
|:---|:---|:---|
| 🔴 **BREAKING** | Will cease to work in next major version or already broken | Fix before merge |
| 🟠 **DEGRADED** | Works but with reduced functionality, performance, or security | Fix this sprint |
| 🟡 **COSMETIC** | Deprecated but still functional with no near-term removal | Schedule for backlog |

---

## Category 1: React Deprecated Patterns

### 1.1 Class Components
```tsx
// ❌ DEPRECATED: Class component
class MyComponent extends React.Component<Props, State> {
  render() { return <div /> }
}

// ✅ REPLACEMENT: Function component
const MyComponent = ({ prop }: Props): JSX.Element => {
  return <div />;
};
```
**Risk**: 🟡 COSMETIC — Still works, but incompatible with Server Components, Concurrent features, and React 19+ direction.

---

### 1.2 Legacy Lifecycle Methods
```tsx
// ❌ ALL BLOCKED:
componentWillMount()       // Removed in React 17
componentWillReceiveProps()// Removed in React 17
componentWillUpdate()      // Removed in React 17

// Also deprecated (but not yet removed):
componentDidMount()        // Use useEffect(() => {}, []) 
componentDidUpdate()       // Use useEffect(() => {}, [dep])
componentWillUnmount()     // Use useEffect cleanup: return () => {}
```
**Risk**: 🔴 BREAKING (Will* variants) / 🟡 COSMETIC (Did* variants)

---

### 1.3 ReactDOM.render
```tsx
// ❌ DEPRECATED: ReactDOM.render (React 18)
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// ✅ REPLACEMENT: createRoot
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```
**Risk**: 🔴 BREAKING — Disables Concurrent Mode, all React 18 features, React 19 upgrade path.

---

### 1.4 String Refs
```tsx
// ❌ DEPRECATED: String refs (removed React 19)
<input ref="myInput" />
this.refs.myInput.focus();

// ✅ REPLACEMENT: useRef
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
inputRef.current?.focus();
```
**Risk**: 🔴 BREAKING in React 19

---

### 1.5 React.FC / React.FunctionComponent
```tsx
// ❌ DISCOURAGED: React.FC (not deprecated but problematic)
const MyComponent: React.FC<Props> = ({ children }) => { ... }
// Problem: implicitly types children, obscures return type, adds wrapper complexity

// ✅ REPLACEMENT: Explicit return type
const MyComponent = ({ children }: PropsWithChildren<Props>): JSX.Element => { ... }
// Or just omit the explicit type if it can be inferred
```
**Risk**: 🟡 COSMETIC

---

### 1.6 findDOMNode
```tsx
// ❌ DEPRECATED: findDOMNode (removed in React 19)
import ReactDOM from 'react-dom';
const node = ReactDOM.findDOMNode(this);

// ✅ REPLACEMENT: useRef
const ref = useRef<HTMLDivElement>(null);
<div ref={ref} />
// ref.current is the DOM node
```
**Risk**: 🔴 BREAKING in React 19

---

### 1.7 createFactory
```tsx
// ❌ DEPRECATED: React.createFactory (removed in React 19)
const factory = React.createFactory(MyComponent);
factory({ prop: 'value' });

// ✅ REPLACEMENT: JSX or createElement
<MyComponent prop="value" />
React.createElement(MyComponent, { prop: 'value' });
```
**Risk**: 🔴 BREAKING

---

### 1.8 Legacy Context API
```tsx
// ❌ DEPRECATED: Legacy context (childContextTypes, contextTypes)
static childContextTypes = { theme: PropTypes.string };
getChildContext() { return { theme: 'dark' }; }

// ✅ REPLACEMENT: createContext + useContext
const ThemeContext = createContext<string>('dark');
const theme = useContext(ThemeContext);
```
**Risk**: 🟠 DEGRADED

---

### 1.9 defaultProps on Function Components
```tsx
// ❌ DEPRECATED: Function.defaultProps (removed React 19)
const MyComponent = ({ name }: Props) => <div>{name}</div>;
MyComponent.defaultProps = { name: 'default' };

// ✅ REPLACEMENT: Default parameter values
const MyComponent = ({ name = 'default' }: Props) => <div>{name}</div>;
```
**Risk**: 🔴 BREAKING in React 19

---

### 1.10 ReactDOM.hydrate
```tsx
// ❌ DEPRECATED: ReactDOM.hydrate (React 18)
ReactDOM.hydrate(<App />, document.getElementById('root'));

// ✅ REPLACEMENT: hydrateRoot
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root')!, <App />);
```
**Risk**: 🔴 BREAKING

---

## Category 2: TypeScript Deprecated/Unsafe Patterns

### 2.1 `any` Type Usage
```typescript
// ❌ BLOCKED: any type — turns off type checking entirely
const value: any = getData();
function process(input: any): any { ... }

// ✅ REPLACEMENT: Proper types or unknown with type guards
const value: unknown = getData();
if (typeof value === 'string') { /* now safe */ }

// Or use generics
function process<T>(input: T): ProcessedResult<T> { ... }
```
**Risk**: 🟠 DEGRADED — Working, but silent source of runtime errors.

---

### 2.2 Unsafe Type Assertions
```typescript
// ❌ BLOCKED: Unguarded type assertions
const user = response as User;
const id = value as string;

// ✅ REPLACEMENT: Zod parse or type guards
const user = UserSchema.parse(response);
// or:
function isUser(val: unknown): val is User {
  return typeof val === 'object' && val !== null && 'id' in val;
}
```
**Risk**: 🟠 DEGRADED

---

### 2.3 Non-Null Assertions Without Comment
```typescript
// ❌ WARNED: Non-null assertion with no justification
const el = document.getElementById('root')!;

// ✅ REPLACEMENT: With guard or explicit comment
// SAFETY: Element is guaranteed to exist by the HTML template
const el = document.getElementById('root')!;

// Or use a proper guard:
const el = document.getElementById('root');
if (!el) throw new Error('Root element not found');
```
**Risk**: 🟡 COSMETIC (when clearly safe, document it)

---

### 2.4 `namespace` Declarations
```typescript
// ❌ DEPRECATED: TypeScript namespace (pre-module era)
namespace MyApp {
  export interface User { ... }
}

// ✅ REPLACEMENT: ES Modules
export interface User { ... }
```
**Risk**: 🟡 COSMETIC

---

### 2.5 `enum` (preferably avoid)
```typescript
// ⚠️  DISCOURAGED: TypeScript enum (emits runtime code)
enum Direction { Up = 'UP', Down = 'DOWN' }

// ✅ REPLACEMENT: const object + typeof
const Direction = { Up: 'UP', Down: 'DOWN' } as const;
type Direction = typeof Direction[keyof typeof Direction];
```
**Risk**: 🟡 COSMETIC — Works, but generates extra JS and has nasty edge cases.

---

## Category 3: Tailwind CSS v3 → v4 Deprecated Classes

Tailwind v4 is a complete rewrite. Many v3 class names were removed, renamed, or changed behavior.

### 3.1 Removed Utility Classes
```html
<!-- ❌ REMOVED in v4 -->
<div class="transform">           <!-- Now always on — remove the class -->
<div class="filter">              <!-- Now always on — remove the class -->
<div class="ring-offset-2">       <!-- Merged into ring utility -->
<div class="basis-auto">          <!-- Changed syntax -->
<div class="decoration-clone">   <!-- Renamed -->
<div class="decoration-slice">   <!-- Renamed -->
<div class="shadow-sm">          <!-- Renamed to shadow-xs in v4 -->
<div class="shadow">             <!-- Renamed to shadow-sm in v4 -->
<div class="blur-sm">            <!-- Renamed to blur-xs in v4 -->

<!-- ❌ REMOVED: opacity modifiers (old slash syntax) -->
<div class="bg-blue-500 bg-opacity-50">   <!-- Old way -->

<!-- ✅ REPLACEMENT: Opacity via slash modifier -->
<div class="bg-blue-500/50">
```

### 3.2 Screen and Container Changes
```css
/* ❌ v3: tailwind.config.js (JavaScript config) */
module.exports = {
  theme: { extend: { colors: { brand: '#3B82F6' } } }
}

/* ✅ v4: CSS-first config in main CSS file */
@import "tailwindcss";
@theme {
  --color-brand: #3B82F6;
}
```

### 3.3 Deprecated Arbitrary Values Syntax
```html
<!-- ❌ OLD: Some arbitrary value patterns changed -->
<div class="w-[calc(100%-2rem)]">   <!-- Check if v4 compatible -->

<!-- ✅ Some now use CSS variables instead -->
<div style="width: calc(100% - 2rem)">
```

### 3.4 JIT-Only Features Now Default
Many classes that required JIT mode in v3 are now always available in v4. Remove any `mode: 'jit'` config.

---

## Category 4: Node.js Deprecated APIs

### 4.1 Callback-Style `fs`
```javascript
// ❌ DEPRECATED: Callback fs
const fs = require('fs');
fs.readFile('path', callback);

// ✅ REPLACEMENT: Promise-based
import { readFile } from 'fs/promises';
const content = await readFile('path', 'utf-8');
```

### 4.2 `url.parse` / `url.format`
```javascript
// ❌ DEPRECATED: Legacy URL parsing
const url = require('url');
const parsed = url.parse('https://example.com');

// ✅ REPLACEMENT: WHATWG URL API
const parsed = new URL('https://example.com');
```

### 4.3 `crypto` Legacy APIs
```javascript
// ❌ DEPRECATED: createCipher/createDecipher (removed Node 22)
crypto.createCipher('aes256', password);

// ✅ REPLACEMENT: createCipheriv with explicit IV
crypto.createCipheriv('aes-256-gcm', key, iv);
```

---

## Category 5: Browser Deprecated APIs

### 5.1 `document.write`
```javascript
// ❌ DEPRECATED: document.write (blocks rendering, XSS risk)
document.write('<script src="..."></script>');

// ✅ REPLACEMENT: DOM manipulation or dynamic imports
const script = document.createElement('script');
script.src = '...';
document.head.appendChild(script);
```

### 5.2 `escape` / `unescape`
```javascript
// ❌ DEPRECATED: escape/unescape
const encoded = escape(str);

// ✅ REPLACEMENT:
const encoded = encodeURIComponent(str);
const decoded = decodeURIComponent(str);
```

### 5.3 Synchronous XHR
```javascript
// ❌ DEPRECATED: Synchronous XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open('GET', url, false); // third arg = synchronous

// ✅ REPLACEMENT: fetch
const response = await fetch(url);
const data = await response.json();
```

### 5.4 `navigator.getUserMedia` (callback style)
```javascript
// ❌ DEPRECATED:
navigator.getUserMedia(constraints, success, error);

// ✅ REPLACEMENT:
navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
```

---

## Category 6: Appwrite SDK Drift

### 6.1 SDK Version Check
```bash
# Check current installed version
cat package.json | grep "node-appwrite"
# Check for breaking changes since last version
```

### 6.2 Known Breaking Changes: SDK v11 → v13+
```typescript
// ❌ REMOVED: createSession (login)
await account.createSession(email, password);

// ✅ REPLACEMENT:
await account.createEmailPasswordSession(email, password);

// ❌ REMOVED: Generic createDocument without permissions
await databases.createDocument(dbId, collId, 'unique()', data);

// ✅ REPLACEMENT: ID.unique() + explicit permissions
await databases.createDocument(
  dbId, collId, ID.unique(), data,
  [Permission.read(Role.any()), Permission.write(Role.user(userId))]
);
```

### 6.3 Permission Model Drift
```typescript
// ❌ OLD: String-based permissions
['read("any")', 'write("user:userId")']

// ✅ CURRENT: Permission + Role helpers
[Permission.read(Role.any()), Permission.write(Role.user(userId))]
```

---

## Category 7: TanStack / Framework Deprecations

### 7.1 TanStack Query v4 → v5
```typescript
// ❌ REMOVED in v5: onSuccess/onError on useQuery
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  onSuccess: (data) => setData(data),  // REMOVED
  onError: (err) => setError(err),     // REMOVED
});

// ✅ REPLACEMENT: useEffect watching query state
const query = useQuery({ queryKey: ['data'], queryFn: fetchData });
useEffect(() => {
  if (query.data) setData(query.data);
  if (query.error) setError(query.error);
}, [query.data, query.error]);

// ❌ REMOVED: isLoading → replaced with isPending
if (isLoading) ...   // REMOVED on mutations

// ✅ REPLACEMENT:
if (isPending) ...
```

### 7.2 ESLint Config Format (Flat Config)
```javascript
// ❌ DEPRECATED: .eslintrc format (v8 and below)
module.exports = { rules: { ... } };

// ✅ REPLACEMENT: flat config (eslint.config.js)
export default [{ rules: { ... } }];
```

---

## Detection Bash Scanner (Generic)

Run this against all changed files for a broad deprecated pattern sweep:

```bash
FILES=$(git diff --name-only HEAD | grep -E "\.(ts|tsx|js|jsx)$")

echo "=== DEPRECATED PATTERN SCAN ==="
for f in $FILES; do
  echo "\n--- $f ---"
  
  # React deprecated
  grep -n "componentDidMount\|componentWillMount\|componentWillReceiveProps\|componentWillUpdate\|ReactDOM\.render\|createFactory\|findDOMNode\|childContextTypes\|contextTypes\|defaultProps\|React\.FC\b" "$f" 2>/dev/null | \
    sed 's/^/  🔴 React: /'

  # TypeScript unsafe
  grep -n "\bany\b\|@ts-ignore\|@ts-nocheck" "$f" 2>/dev/null | \
    sed 's/^/  🟠 TypeScript: /'

  # Appwrite SDK drift
  grep -n "createSession\|unique()\|read(\"any\")\|write(\"user" "$f" 2>/dev/null | \
    sed 's/^/  🟠 Appwrite: /'

  # TanStack Query v4 patterns
  grep -n "onSuccess:\|onError:.*useQuery\|isLoading.*Mutation\|\.isLoading\b" "$f" 2>/dev/null | \
    sed 's/^/  🟡 TanStack: /'

  # Node deprecated
  grep -n "url\.parse\|escape(\|unescape(\|\.createCipher\b\|\.createDecipher\b\|fs\.readFile.*callback\|fs\.writeFile.*callback" "$f" 2>/dev/null | \
    sed 's/^/  🟡 Node: /'

done

echo "\n=== END DEPRECATED SCAN ==="
```

---

## Deprecation Decision Matrix

When deprecated code is found, use this matrix to decide on action:

| Risk | Used In | Consequence | Action |
|:---|:---|:---|:---|
| 🔴 BREAKING | Critical path | App breaks on upgrade | Fix before merge |
| 🔴 BREAKING | Non-critical | Breaks on upgrade | Fix this sprint |
| 🟠 DEGRADED | Critical path | Loss of feature/security | Fix this sprint |
| 🟠 DEGRADED | Non-critical | Cosmetic or minor loss | Next sprint |
| 🟡 COSMETIC | Anywhere | No near-term impact | Backlog with tech debt label |
