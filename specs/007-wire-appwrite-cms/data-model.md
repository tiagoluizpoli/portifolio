# Data Model: Zenith CMS Wiring

This data model represents the authoritative schema for Appwrite collections after the proposed wiring alignment.

## Core Entities

### 1. Home
| Property | Type | Description |
|:---|:---|:---|
| `firstName` | string | User's first name |
| `lastName` | string | User's last name |
| `namePresentation`| string | Full name for display (e.g., "Full Name / Identity") |
| `title` | string | Headline punchline |
| `description` | string | Bio/Narrative content |
| `pictureId` | string | Appwrite File ID (shared) |
| `cvId` | string | Appwrite File ID (locale-specific) |
| `downloadButtonText`| string | Label for the CV download button |
| `journeyStartedIn` | integer| Year the user started their journey |
| `locale` | string | 'en' or 'pt' |

### 2. About
| Property | Type | Description |
|:---|:---|:---|
| `content` | string | Long-form professional narrative |
| `locale` | string | 'en' or 'pt' |

### 3. ImpactMetric
| Property | Type | Description |
|:---|:---|:---|
| `label` | string | Metric description |
| `value` | string | Quantifiable value (e.g. "5+") |
| `sourceId`| string | Foreign Key to MetricSource |
| `sourceKey` | string? | Key for automated sync (e.g. GitHub repo name) |
| `aboutId` | string | Foreign Key to About |

### 4. MetricSource
| Property | Type | Description |
|:---|:---|:---|
| `name` | string | Source display name (e.g., "GitHub Contributions")|
| `type` | string | 'manual', 'github', 'wakatime', 'custom' |
| `iconCode`| string | Iconify identifier |
| `status` | string | Lifecycle state ('active', 'archived') |

### 5. Experience (Preserved)
| Property | Type | Description |
|:---|:---|:---|
| `position` | string | Role title |
| `company` | string | Employer |
| `duration` | string | Time period text |
| `description` | string | Markdown details |
| `sort` | integer| Sort order |
| `locale` | string | 'en' or 'pt' |

### 6. Education (Preserved)
| Property | Type | Description |
|:---|:---|:---|
| `institution` | string | School/University |
| `degree` | string | Academic title |
| `duration` | string | Time period text |
| `description` | string | Markdown details |
| `sort` | integer| Sort order |
| `locale` | string | 'en' or 'pt' |

### 7. Skill
| Property | Type | Description |
|:---|:---|:---|
| `title` | string | Name of the skill |
| `iconCode` | string | Iconify identifier |
| `type` | string | Category (frontend, backend, fullstack) |
| `sort` | integer| Sort order |
| `locale` | string | 'en' or 'pt' |
| `status` | string | Lifecycle state (e.g. 'active', 'archived') |

### 8. Solution
| Property | Type | Description |
|:---|:---|:---|
| `title` | string | Solution title |
| `description` | string | High-level overview |
| `iconCode` | string | Iconify identifier |
| `url` | string? | Nullable external link |
| `sort` | integer| Sort order |
| `locale` | string | 'en' or 'pt' |

### 9. Contact Info
| Property | Type | Description |
|:---|:---|:---|
| `type` | string | 'email', 'phone', 'location' |
| `value` | string | Contact detail |
| `iconCode` | string | Iconify identifier |
| `sort` | integer| Sort order |
| `locale` | string | 'en' or 'pt' |

### 10. Social
| Property | Type | Description |
|:---|:---|:---|
| `type` | string | Platform name |
| `url` | string | Link to profile |
| `iconCode` | string | Iconify identifier |
| `sort` | integer| Sort order |
| `status` | string | Lifecycle state ('active', 'archived') |
