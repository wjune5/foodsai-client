# Internationalization (i18n) Guide

This guide explains how to use the internationalization system in the Smart Fridge Organizer app.

## Overview

The app supports multiple languages through a comprehensive i18n system built with Next.js App Router. Currently supported languages:
- **English (en)** - Default language
- **Chinese (zh)** - Traditional Chinese

## File Structure

```
shared/i18n/
├── index.ts                 # Main i18n utilities
├── translations/
│   ├── en.json             # English translations
│   └── zh.json             # Chinese translations
├── routing.ts              # Route utilities
├── navigation.ts           # Navigation utilities
├── request.ts              # Request utilities
└── INTERNATIONALIZATION.md # This documentation
```

## Basic Usage

### 1. Using Translations in Components

```tsx
import { useTranslation, type Locale } from '@/shared/i18n';

interface MyComponentProps {
  params: { locale: string };
}

export default function MyComponent({ params }: MyComponentProps) {
  const { locale } = params;
  const { t } = useTranslation(locale as Locale);

  return (
    <div>
      <h1>{t('home.welcome')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

### 2. Translation with Parameters

```tsx
// In your component
const { t } = useTranslation(locale as Locale);

// Using parameters
const message = t('inventory.daysLeft', { days: 5 });
// English: "5 days left"
// Chinese: "还剩 5 天"

// In translation files
// en.json
"daysLeft": "{{days}} days left"

// zh.json
"daysLeft": "还剩 {{days}} 天"
```

### 3. Date and Number Formatting

```tsx
import { formatDate, formatNumber, formatCurrency, formatRelativeTime } from '@/shared/i18n';

// Date formatting
const formattedDate = formatDate(new Date(), locale);
// English: "Dec 15, 2023"
// Chinese: "2023年12月15日"

// Number formatting
const formattedNumber = formatNumber(1234.56, locale);
// English: "1,234.56"
// Chinese: "1,234.56"

// Currency formatting
const formattedCurrency = formatCurrency(1234.56, locale, 'USD');
// English: "$1,234.56"
// Chinese: "US$1,234.56"

// Relative time
const relativeTime = formatRelativeTime(someDate, locale);
// English: "2 days ago"
// Chinese: "2天前"
```

## URL Structure

The app uses locale-prefixed URLs:

- **English**: `/en/inventory`, `/en/recipes`
- **Chinese**: `/zh/inventory`, `/zh/recipes`
- **Default (English)**: `/inventory`, `/recipes` (redirects to `/en/inventory`)

### Creating Locale-Aware Links

```tsx
import { addLocaleToPathname } from '@/shared/i18n';
import Link from 'next/link';

// In your component
const locale = 'zh';
const inventoryPath = addLocaleToPathname('/inventory', locale);
// Result: '/zh/inventory'

return (
  <Link href={inventoryPath}>
    Go to Inventory
  </Link>
);
```

## Adding New Languages

### 1. Add Language to Supported Locales

```tsx
// In shared/i18n/index.ts
export type Locale = 'en' | 'zh' | 'es'; // Add new locale
export const locales: Locale[] = ['en', 'zh', 'es'];
```

### 2. Create Translation File

```json
// shared/i18n/translations/es.json
{
  "common": {
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito"
  },
  "navigation": {
    "dashboard": "Panel",
    "foodInventory": "Inventario de Alimentos"
  }
  // ... rest of translations
}
```

### 3. Update Locale Maps

```tsx
// In shared/i18n/index.ts
const localeMap: Record<Locale, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  es: 'es-ES', // Add new locale
};

const displayNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español', // Add display name
};
```

## Translation File Structure

Translation files are organized hierarchically:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save",
    "cancel": "Cancel"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "inventory": "Inventory"
  },
  "pages": {
    "home": {
      "title": "Welcome",
      "description": "Description"
    },
    "inventory": {
      "title": "Food Inventory",
      "addItem": "Add Item",
      "categories": {
        "dairy": "Dairy",
        "meat": "Meat"
      }
    }
  }
}
```

## Best Practices

### 1. Use Descriptive Keys

```json
// Good
"inventory.addItem": "Add Food Item"

// Avoid
"add": "Add Food Item"
```

### 2. Group Related Translations

```json
{
  "inventory": {
    "title": "Food Inventory",
    "addItem": "Add Food Item",
    "categories": {
      "dairy": "Dairy",
      "meat": "Meat"
    }
  }
}
```

### 3. Use Parameters for Dynamic Content

```json
// Instead of multiple keys
"daysLeft1": "1 day left",
"daysLeft2": "2 days left"

// Use parameters
"daysLeft": "{{days}} days left"
```

### 4. Keep Translations Consistent

```json
// Use consistent terminology
"common.save": "Save",
"inventory.saveItem": "Save Item",
"recipes.saveRecipe": "Save Recipe"
```

## Testing Translations

### 1. Manual Testing

1. Start the development server
2. Navigate to different locales: `/en`, `/zh`
3. Test all pages and components
4. Verify text appears in correct language

### 2. Automated Testing

```tsx
// Example test
import { t } from '@/shared/i18n';

describe('Translations', () => {
  it('should translate common keys', () => {
    expect(t('common.loading', 'en')).toBe('Loading...');
    expect(t('common.loading', 'zh')).toBe('加载中...');
  });
});
```

## Common Issues and Solutions

### 1. Missing Translation Keys

If you see a translation key instead of translated text, add the missing key to all translation files.

### 2. Locale Not Detected

Ensure your page component receives the `params` prop with locale:

```tsx
interface PageProps {
  params: { locale: string };
}

export default function Page({ params }: PageProps) {
  const { locale } = params;
  // Use locale...
}
```

### 3. Links Not Working

Use `addLocaleToPathname` for all internal links:

```tsx
import { addLocaleToPathname } from '@/shared/i18n';

const href = addLocaleToPathname('/inventory', locale);
```

## Performance Considerations

1. **Bundle Size**: Translation files are loaded on-demand
2. **Caching**: Translations are cached in memory
3. **Tree Shaking**: Unused translations are removed in production

## Future Enhancements

- [ ] Add more languages (Spanish, French, German)
- [ ] Implement translation memory
- [ ] Add translation management interface
- [ ] Support for RTL languages
- [ ] Pluralization rules
- [ ] Context-aware translations 