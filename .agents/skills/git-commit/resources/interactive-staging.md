# Interactive Staging — `git add -p` Deep Dive

Interactive staging is the core skill that separates atomic commits from dump commits. When a file contains changes for multiple logical intents (common after long development sessions), `git add -p` lets you select exactly which lines go into each commit.

---

## When to Use `-p`

**Use `git add -p` when:**
- You fixed a bug AND added a feature in the same file during the same session
- You refactored code AND added a comment explaining it
- A component has both a layout fix and a new prop
- A schema file has both a migration change and a type correction

**Don't use `git add -p` when:**
- The entire file belongs to one intent (just `git add <file>`)
- You want to stage a whole directory

---

## The Basic Flow

```bash
# Start interactive staging for a specific file
git add -p src/features/auth/components/LoginForm.tsx

# Or for ALL changes at once
git add -p
```

Git will show you each "hunk" (contiguous block of changes) one at a time and ask what to do with it.

---

## Hunk Prompt Options

```
Stage this hunk [y,n,q,a,d,s,e,?]?
```

| Key | Action | When to Use |
|:---|:---|:---|
| `y` | **yes** — stage this hunk | This hunk belongs to the current commit |
| `n` | **no** — skip this hunk | This hunk belongs to a different commit |
| `q` | **quit** — stop reviewing | You've staged what you need |
| `a` | **all** — stage remaining hunks in file | Rest of the file belongs to this commit |
| `d` | **don't** — skip this file entirely | Nothing in this file belongs to this commit |
| `s` | **split** — divide hunk into smaller hunks | The hunk is too big and mixes intents |
| `e` | **edit** — manually edit which lines to stage | Surgical precision — stage specific lines |
| `?` | **help** | Show command help |

---

## The Essential Commands

### `y` and `n` — Basic Selection

```diff
@@ -12,10 +12,15 @@ export function LoginForm() {
   const [loading, setLoading] = useState(false);
+  const [showPassword, setShowPassword] = useState(false); // NEW: show/hide password
 
   const handleSubmit = async (data: LoginInput) => {
-    setLoading(true);
-    await signIn(data);
-    setLoading(false);
+    setLoading(true);
+    try {
+      await signIn(data);          // FIX: wrap in try/catch to handle network errors
+      router.navigate({ to: '/dashboard' });
+    } catch (err) {
+      setError('Sign in failed. Please try again.');
+    } finally {
+      setLoading(false);
+    }
   };
```

- First hunk (show password state): `n` — this is a feat, commit separately
- Second hunk (try/catch fix): `y` — this is the bug fix we're committing now

### `s` — Split a Hunk

If a hunk is too large and mixes changes:

```bash
Stage this hunk [y,n,q,a,d,s,e,?]? s
Split into 2 hunks.
@@ -15,4 +15,4 @@ ...
```

Git splits the hunk into smaller pieces. You then decide on each piece.

### `e` — Edit the Hunk (Surgical Precision)

When `s` can't split small enough — you need line-level control:

```bash
Stage this hunk [y,n,q,a,d,s,e,?]? e
```

Git opens the hunk in your editor (usually `vim` or `$EDITOR`). The file shows:

```diff
# Manual hunk edit mode — see bottom for more help
@@ -12,8 +12,12 @@
   const [loading, setLoading] = useState(false);
+  const [showPassword, setShowPassword] = useState(false);
 
   return (
     <form>
+      <input type={showPassword ? 'text' : 'password'} />
+      <button onClick={() => setShowPassword(v => !v)}>Toggle</button>
       <button type="submit" disabled={loading}>
```

**To exclude a line from staging:**
- Change `+` at the start to ` ` (space) — the line becomes context only, not staged
- **Never** delete lines that start with `+` — this corrupts the patch
- **Never** modify lines that start with `-` — this also corrupts the patch

```diff
# To NOT stage the showPassword lines, change their + to space:
@@ -12,8 +12,12 @@
   const [loading, setLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);  ← was +, now space (not staged)
 
   return (
     <form>
       <input type={showPassword ? 'text' : 'password'} />   ← space (not staged)
       <button onClick={() => setShowPassword(v => !v)}>Toggle</button>  ← space (not staged)
       <button type="submit" disabled={loading}>
```

Save and quit the editor. Only the lines you kept as `+` will be staged.

---

## Post-Staging Verification

After using `git add -p`, always verify what's staged:

```bash
# Show the staged diff — this is EXACTLY what will go into the commit
git diff --cached

# Show the unstaged diff — this is what remains for future commits
git diff

# Summary view
git diff --cached --stat
git diff --stat
```

If the staged diff matches your intent, commit. If it includes wrong lines, unstage and try again:

```bash
# Unstage a specific file and try again
git restore --staged <filename>
git add -p <filename>

# Unstage everything
git reset HEAD
```

---

## Real-World `-p` Session

**Scenario**: A session touched `UserProfile.tsx` with:
1. Bug fix: null-guard on missing user displayName (commit 1)
2. Feature: avatar upload button (commit 2)

```bash
$ git add -p src/components/UserProfile.tsx

# Hunk 1: null guard fix
@@ -8,7 +8,7 @@ export function UserProfile({ user }) {
   return (
     <div>
-      <h1>{user.displayName}</h1>
+      <h1>{user.displayName ?? 'Anonymous'}</h1>
       <p>{user.email}</p>

Stage this hunk [y,n,q,a,d,s,e,?]? y   ← stage the fix

# Hunk 2: avatar upload button
@@ -18,6 +18,12 @@ export function UserProfile({ user }) {
   return (
     <div>
+      <AvatarUploadButton
+        userId={user.$id}
+        onUpload={handleAvatarChange}
+      />
       <h1>{user.displayName ?? 'Anonymous'}</h1>

Stage this hunk [y,n,q,a,d,s,e,?]? n   ← skip the feature

$ git diff --cached          # Verify: only the null guard is staged
$ git commit -m "fix(profile): handle missing displayName with fallback"

$ git add src/components/UserProfile.tsx   # Now stage the rest
$ git commit -m "feat(profile): add avatar upload button"
```

Two clean, atomic commits from one messy file. ✅

---

## Editor Setup for `git add -p -e`

Set your preferred editor for hunk editing:

```bash
# Use VS Code (recommended)
git config --global core.editor "code --wait"

# Use nano (beginner-friendly)
git config --global core.editor "nano"

# Use vim (advanced)
git config --global core.editor "vim"
```
