'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { Home, Sparkles, User, ArrowLeft, Tag, Book, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/shared/context/AuthContext';
import { ProfileDropdown } from './ProfileDropdown';
import { Separator } from './Separator';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from './ui/sidebar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';

interface TopNavProps {
  className?: string;
  links: {
    title: string
    href: string
    isActive: boolean
    disabled?: boolean
  }[]
}

function TopNav({ className, links }: TopNavProps) {
  const isMobile = useIsMobile()
  const t = useTranslations();
  const localize = useLocalizedPath();

  // Hide TopNav on mobile and tablet devices (same as sidebar logic)
  if (isMobile) {
    return null
  }

    return (
    <NavigationMenu className={cn('mr-6', className)} viewport={false}>
      <NavigationMenuList>
        {links.map(({ title, href, isActive, disabled }) => (
          <NavigationMenuItem key={`${title}-${href}`}>
            <NavigationMenuLink asChild>
              <Link 
                href={href} 
                className={cn(
                  navigationMenuTriggerStyle(),
                  isActive ? 'bg-accent text-accent-foreground' : ''
                )}
              >
                {title}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        
        {/* Customize Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            {t('navigation.customize')}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[180px]">
              <li>
                <NavigationMenuLink asChild>
                  <Link 
                    href={localize('/categories')}
                    className="flex-row items-center gap-2"
                  >
                    <Tag className="w-4 h-4" />
                    {t('navigation.categories')}
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link 
                    href={localize('/icons')}
                    className="flex-row items-center gap-2"
                  >
                    <Book className="w-4 h-4" />
                    {t('navigation.icons')}
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
         </NavigationMenu>
   )
}

export default function Navigation() {
  const pathname = usePathname();
  const localize = useLocalizedPath();
  const t = useTranslations();
  const { isGuestMode, enterGuestMode, isAuthenticated } = useAuth();
  const [offset, setOffset] = React.useState(0);
  const router = useRouter();
  const isMobile = useIsMobile(); // Move hook call to top level

  // Check if we're on a food item details page
  const isDetailsPage = (pathname.includes('/inventory/') || pathname.includes('/records/')) && pathname.split('/').length > 3;

  const navigation = [
    { name: t('navigation.inventory'), href: '/', icon: Home },
    { name: t('navigation.records'), href: '/records', icon: Book },
    // { name: t('navigation.favorites'), href: '/favorites', icon: Heart }
  ];

  const navLinks = navigation.map(item => ({
    title: item.name,
    href: localize(item.href),
    isActive: pathname === item.href,
  }));

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    if (!isAuthenticated && !isGuestMode) {
      enterGuestMode();
    }
  }, [isGuestMode]);
  return (
    <header
      className={cn(
        'bg-background flex h-16 items-center gap-3 p-4 sm:gap-4 fixed top-0 left-0 right-0 z-50 border-b glass',
        offset > 10 ? 'shadow-sm' : 'shadow-none'
      )}
    >
      {/* Back Button - left of sidebar trigger */}
      {isDetailsPage && (
        <>
          <button
            onClick={() => router.back()}
            className="flex items-center text-pink-600 hover:text-pink-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

        </>
      )}

      {/* Logo - only show when not on details page */}
      {!isDetailsPage && (
        <div className="flex items-center flex-shrink-0">
          <Link href={localize('/')} className="flex items-center space-x-2 group">
            <div className="icon-cute pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold gradient-text">Foodsai</span>
          </Link>
          {isGuestMode && !isMobile && (
            <div className="flex items-center ml-4 space-x-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full" title='💡 Your data is stored locally on this device. Consider creating an account to sync your data across devices.'>
              <User className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Guest Mode</span>
            </div>
          )}
        </div>
      )}

      {/* Right side items */}
      <div className="ml-auto flex items-center space-x-2">
        {/* Sidebar Trigger - Always visible with proper spacing */}
        <SidebarTrigger variant='outline' className='scale-110 sm:scale-100 flex-shrink-0 min-w-[40px]' />
        {/* Separator - Only show on mobile and tablet devices */}
        {isMobile && <Separator orientation="vertical" className="h-6" />}
        {/* Desktop Navigation - Only show on large screens to avoid crowding */}
        <TopNav links={navLinks} />

        {/* <LanguageSwitcher /> */}
        <div className="flex-shrink-0">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
} 