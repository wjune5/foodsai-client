'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { routing } from '@/shared/i18n/routing';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations();

  const languageNames: Record<string, string> = {
    en: 'English',
    zh: '中文',
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-pink-300 hover:bg-white/10 transition-all duration-200"
        aria-label={t('settings.language')}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{languageNames[locale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 z-20">
            <div className="py-1">
              {routing.locales.map((lang) => (
                <Link
                  key={lang}
                  href={`/${lang}`}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                    locale === lang
                      ? 'bg-white/20 text-pink-500'
                      : 'text-gray-500 hover:text-pink-300 hover:bg-white/10'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {languageNames[lang]}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 