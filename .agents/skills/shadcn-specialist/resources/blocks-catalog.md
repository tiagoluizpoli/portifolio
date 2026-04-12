# Blocks Catalog — Pre-Built Page Layouts

shadcn blocks are pre-built, copy-paste page layouts. They combine multiple components into full page designs.

---

## Dashboard Blocks

### dashboard-01 — Overview Dashboard
**Components**: Card, Chart, Table, Badge
**Layout**: Header → 4-column metrics grid → chart + recent activity (2-column)

### dashboard-02 — Sidebar Dashboard
**Components**: Sidebar, Card, Chart, Button, DropdownMenu
**Layout**: Collapsible sidebar → header with breadcrumbs → content area

### dashboard-03 — Multi-Tab Dashboard
**Components**: Tabs, Card, Table, Badge, DropdownMenu
**Layout**: Header → tab navigation → tabbed content panels

### dashboard-04 — Resizable Dashboard
**Components**: Resizable, Sidebar, Card, Chart
**Layout**: Resizable left panel → resizable right panel → flexible content

### dashboard-05 — Analytics Dashboard
**Components**: Card, Chart, DatePicker, Select
**Layout**: Date range selector → KPI cards → multi-chart grid

---

## Authentication Blocks

### authentication-01 — Simple Login
**Components**: Card, Form, Input, Button, Label
**Layout**: Centered card with email/password fields

### authentication-02 — Split Login
**Components**: Card, Form, Input, Button, Image
**Layout**: Left half image → right half login form

### authentication-03 — Social Login
**Components**: Card, Form, Input, Button, Separator
**Layout**: Login form + social provider buttons (GitHub, Google)

### authentication-04 — Multi-Step Registration
**Components**: Card, Form, Input, Button, Steps
**Layout**: Step indicator → progressive form fields

---

## Sidebar Blocks

### sidebar-01 — Basic Sidebar
**Components**: Sidebar, SidebarMenu, SidebarGroup
**Layout**: Logo → nav groups → footer

### sidebar-02 — Collapsible Sidebar
**Components**: Sidebar, SidebarMenu, Collapsible, Tooltip
**Layout**: Icon-only collapsed state → full expanded state

### sidebar-03 — Sidebar with Search
**Components**: Sidebar, SidebarMenu, Command, Avatar
**Layout**: Logo → search → nav groups → user profile

### sidebar-04 — Floating Sidebar
**Components**: Sidebar, SidebarMenu, Sheet
**Layout**: Overlay sidebar for mobile, persistent for desktop

---

## Settings Blocks

### settings-01 — Profile Settings
**Components**: Form, Input, Textarea, Avatar, Button
**Layout**: Sidebar nav → profile form with avatar upload

### settings-02 — Appearance Settings
**Components**: Form, RadioGroup, Select, Switch
**Layout**: Theme selector → font selector → interface options

### settings-03 — Notification Settings
**Components**: Form, Switch, Checkbox, Card
**Layout**: Notification categories → toggle list per category

---

## Using Blocks

```bash
# View available blocks
npx shadcn@latest add --list

# Install a block
npx shadcn@latest add sidebar-01

# Blocks install into your project with all required sub-components
```

**Customization**: Blocks are just code — modify layout, add/remove sections, swap components as needed.
