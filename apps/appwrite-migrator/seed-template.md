# Seed Template Specification

Generated at: 2026-04-18T05:31:26.661Z

## Table `about`

### Unique Logic Keys
- byLocale: locale
- byName: locale, name
- byTitle: locale, title
- byBio: locale, bio

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| name | string | required | 255 | - |
| title | string | required | 255 | - |
| bio | string | required | 4096 | - |
| locale | enum | required | - | - |

### Example Row

```json
{
  "name": "about_name",
  "title": "about_title",
  "bio": "about_bio",
  "locale": "en"
}
```

## Table `home`

### Unique Logic Keys
- byLocaleHeroTitle: locale, heroTitle
- byLocaleHeroSubtitle: locale, heroSubtitle
- byLocaleCtaText: locale, ctaText
- byLocaleCtaLink: locale, ctaLink

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| heroTitle | string | required | 255 | - |
| heroSubtitle | string | required | 512 | - |
| ctaText | string | required | 64 | - |
| ctaLink | string | required | 255 | - |
| locale | enum | required | - | - |

### Example Row

```json
{
  "heroTitle": "home_heroTitle",
  "heroSubtitle": "home_heroSubtitle",
  "ctaText": "home_ctaText",
  "ctaLink": "home_ctaLink",
  "locale": "en"
}
```

## Table `contact_info`

### Unique Logic Keys
- byLocaleEmail: locale, email
- byLocalePhone: locale, phone
- byLocaleLocation: locale, location

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| email | email | required | - | - |
| phone | string | required | 32 | - |
| location | string | required | 128 | - |
| locale | enum | required | - | - |

### Example Row

```json
{
  "email": "seed@example.com",
  "phone": "contact_info_phone",
  "location": "contact_info_location",
  "locale": "en"
}
```

## Table `socials`

### Unique Logic Keys
- byPlatformUsername: platformId, username

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| platformId | string | required | 36 | - |
| username | string | required | 128 | - |
| iconId | string | required | 128 | - |
| active | boolean | required | - | true |
| sort | integer | required | - | 0 |

### Example Row

```json
{
  "platformId": "socials_platformId",
  "username": "socials_username",
  "iconId": "socials_iconId",
  "active": true,
  "sort": 0
}
```

## Table `platforms`

### Unique Logic Keys
- byTitle: title

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| title | string | required | 128 | - |
| urlTemplate | string | required | 255 | - |
| iconCode | string | required | 64 | - |
| status | enum | required | - | - |
| sort | integer | required | - | 0 |

### Example Row

```json
{
  "title": "platforms_title",
  "urlTemplate": "platforms_urlTemplate",
  "iconCode": "platforms_iconCode",
  "status": "active",
  "sort": 0
}
```

## Table `solutions`

### Unique Logic Keys
- byLocaleTitle: title, locale

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| title | string | required | 128 | - |
| description | string | required | 1024 | - |
| iconCode | string | required | 64 | - |
| sort | integer | required | - | 0 |
| locale | enum | required | - | - |

### Example Row

```json
{
  "title": "solutions_title",
  "description": "solutions_description",
  "iconCode": "solutions_iconCode",
  "sort": 0,
  "locale": "en"
}
```

## Table `skills`

### Unique Logic Keys
- byTypeTitle: title, type

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| title | string | required | 64 | - |
| type | enum | required | - | - |
| iconCode | string | required | 64 | - |
| status | enum | required | - | - |
| sort | integer | required | - | 0 |

### Example Row

```json
{
  "title": "skills_title",
  "type": "frontend",
  "iconCode": "skills_iconCode",
  "status": "active",
  "sort": 0
}
```

## Table `educations`

### Unique Logic Keys
- byLocaleTitleOrganization: title, organization, locale

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| title | string | required | 128 | - |
| organization | string | required | 128 | - |
| location | string | required | 128 | - |
| period | string | required | 64 | - |
| description | string | required | 2048 | - |
| current | boolean | required | - | false |
| sort | integer | required | - | 0 |
| locale | enum | required | - | - |

### Example Row

```json
{
  "title": "educations_title",
  "organization": "educations_organization",
  "location": "educations_location",
  "period": "educations_period",
  "description": "educations_description",
  "current": false,
  "sort": 0,
  "locale": "en"
}
```

## Table `experiences`

### Unique Logic Keys
- byLocaleTitleOrganization: title, organization, locale

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| title | string | required | 128 | - |
| organization | string | required | 128 | - |
| location | string | required | 128 | - |
| period | string | required | 64 | - |
| description | string | required | 4096 | - |
| current | boolean | required | - | false |
| sort | integer | required | - | 0 |
| locale | enum | required | - | - |

### Example Row

```json
{
  "title": "experiences_title",
  "organization": "experiences_organization",
  "location": "experiences_location",
  "period": "experiences_period",
  "description": "experiences_description",
  "current": false,
  "sort": 0,
  "locale": "en"
}
```

## Table `impact_metrics`

### Unique Logic Keys
- byAboutCodeLocale: aboutId, internalCode, locale

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| aboutId | string | required | 36 | - |
| internalCode | string | required | 64 | - |
| label | string | required | 128 | - |
| value | string | required | 64 | - |
| sourceId | string | required | 36 | - |
| isPlaceholder | boolean | required | - | false |
| locale | enum | required | - | - |

### Example Row

```json
{
  "aboutId": "impact_metrics_aboutId",
  "internalCode": "impact_metrics_internalCode",
  "label": "impact_metrics_label",
  "value": "impact_metrics_value",
  "sourceId": "impact_metrics_sourceId",
  "isPlaceholder": false,
  "locale": "en"
}
```

## Table `metric_sources`

### Unique Logic Keys
- byName: name

### Columns

| key | type | required | size | default |
| --- | --- | --- | --- | --- |
| name | string | required | 128 | - |
| type | string | required | 64 | - |
| iconCode | string | required | 64 | - |
| status | string | required | 32 | - |

### Example Row

```json
{
  "name": "metric_sources_name",
  "type": "metric_sources_type",
  "iconCode": "metric_sources_iconCode",
  "status": "metric_sources_status"
}
```
