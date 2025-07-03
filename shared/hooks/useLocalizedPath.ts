// shared/hooks/useLocalizedPath.ts
'use client';
import { useLocale } from 'next-intl';

export default function useLocalizedPath() {
  const locale = useLocale();

  return (path: string) => {
    if (!path.startsWith('/')) path = '/' + path;
    return `/${locale}${path}`;
  };
}
