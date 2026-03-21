# Data Model: Zenith UI Components

This model defines the UI-specific entities and their attributes for the Zenith Management Hub.

## 1. DashboardMetric
**Attributes**:
- `label`: string (e.g., "Total Users")
- `value`: string/number (e.g., "1,234")
- `trend`: "up" | "down" | "neutral"
- `percentage`: number (e.g., 12.5)

## 2. ActivityItem
**Attributes**:
- `id`: string
- `type`: "user" | "system" | "security" | "portfolio"
- `message`: string
- `timestamp`: date/time
- `user`: string (initiator)

## 3. NavigationItem
**Attributes**:
- `title`: string
- `path`: string
- `icon`: IconComponent (Lucide)
- `permission`: string (required role)

## 4. SystemSetting
**Attributes**:
- `key`: string
- `value`: any
- `type`: "string" | "boolean" | "number" | "json"
- `category`: "appearance" | "engine" | "portfolio"
