'use client';

import { useTranslations } from 'next-intl';
import Navigation from '@/shared/components/Navigation';
import CategoryManager from './components/CategoryManager';

export default function CategoriesPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('categories.title')}
          </h1>
        </div>

        {/* Category Manager */}
        <CategoryManager />
      </div>
    </div>
  );
} 