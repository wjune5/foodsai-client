'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { Home, Utensils, Heart, BarChart3, Menu, X, Sparkles, Settings, UserCircle, AlertTriangle, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/shared/services/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const localize = useLocalizedPath();
  const t = useTranslations();
  const { user, isGuestMode } = useAuth();

  const getUserDisplayName = () => {
    if (isGuestMode && user) {
      return 'Welcome';
    } else if (user) {
      return user.nickname || user.username || 'Welcome';
    }
    return 'Welcome';
  };

  const navigation = [
    { name: t('navigation.inventory'), href: '/', icon: Home },
    // { name: t('navigation.inventory'), href: '/inventory', icon: BarChart3 },
    { name: t('navigation.recipes'), href: '/recipes', icon: Utensils },
    { name: t('navigation.favorites'), href: '/favorites', icon: Heart },
    { name: t('navigation.settings'), href: '/settings', icon: Settings },
    { name: t('navigation.guestMode'), href: '/guest-mode-demo', icon: UserCircle },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isMenuOpen && !(e.target as Element).closest('nav')) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href={localize('/')} className="flex items-center space-x-2 group">
                <div className="icon-cute pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold gradient-text">{getUserDisplayName()}</span>
              </Link>
              {isGuestMode && (
                <div className="flex items-center mx-4 space-x-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full" title='💡 Your data is stored locally on this device. Consider creating an account to sync your data across devices.'>
                  <User className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Guest Mode</span>
                  {/* <AlertTriangle className="w-4 h-4 text-yellow-600" /> */}
                </div>
              )}
            </div>

            {/* Hamburger Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-full text-gray-600 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              >
                <span className="sr-only">{t('navigation.openMenu')}</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center md:space-x-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={localize(item.href)}
                    className={`group relative inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-white/20 text-pink-500 shadow-lg'
                        : 'text-gray-500 hover:text-pink-300 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-pink-500' : 'text-gray-600 group-hover:text-pink-300'
                    }`} />
                    {item.name}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 animate-pulse" />
                    )}
                  </Link>
                );
              })}
              
              {/* Language Switcher */}
              <LanguageSwitcher className="ml-2" />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 glass border-b border-white/20 md:hidden">
            <div className="px-4 pt-2 pb-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={localize(item.href)}
                    onClick={closeMenu}
                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon 
                      className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`} 
                    />
                    {item.name}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 animate-pulse" />
                    )}
                  </Link>
                );
              })}
              
              {/* Language Switcher for Mobile */}
              <div className="pt-2 border-t border-white/10">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
} 