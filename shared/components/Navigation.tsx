'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { Home, Heart, Menu, X, Sparkles, Settings, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/shared/services/AuthContext';
import { UserProfileDropdown } from '@/app/[locale]/auth/components/UserProfileDropdown';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const localize = useLocalizedPath();
  const t = useTranslations();
  const { user, isGuestMode } = useAuth();

  const navigation = [
    { name: t('navigation.inventory'), href: '/', icon: Home },
    { name: t('navigation.favorites'), href: '/favorites', icon: Heart },
    { name: t('navigation.profile'), href: '/profile', icon: User },
    { name: t('navigation.settings'), href: '/settings', icon: Settings },
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
      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Hamburger Menu (Mobile) + Logo */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu (Mobile) */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-full text-gray-600 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  aria-label="Open menu"
                >
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Logo */}
              <div className="flex items-center">
                <Link href={localize('/')} className="flex items-center space-x-2 group">
                  <div className="icon-cute pulse">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold gradient-text">Smart Fridge</span>
                </Link>
                {isGuestMode && (
                  <div className="hidden md:flex items-center ml-4 space-x-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full" title='💡 Your data is stored locally on this device. Consider creating an account to sync your data across devices.'>
                    <User className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Guest Mode</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Navigation Items + Avatar */}
            <div className="flex items-center space-x-2">
              {/* Desktop Navigation Items */}
              <div className="hidden md:flex md:items-center md:space-x-2">
                {navigation.slice(0, 2).map((item) => {
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

              {/* Avatar (Both Mobile and Desktop) */}
              <div className="flex items-center">
                <UserProfileDropdown />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Side Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-pink-500" />
                  <span className="text-lg font-bold text-gray-800">Menu</span>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={localize(item.href)}
                      onClick={closeMenu}
                      className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-pink-50 text-pink-600 border border-pink-200'
                          : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      <item.icon 
                        className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-pink-600' : 'text-gray-500 group-hover:text-pink-600'
                        }`} 
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Footer with Language Switcher */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Language</span>
                  <LanguageSwitcher />
                </div>
                {isGuestMode && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Guest Mode</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Data stored locally
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
} 