'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { Home, Heart, Menu, Sparkles, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/shared/services/AuthContext';
import { ProfileDropdown } from './ProfileDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { Separator } from './Separator';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { SidebarTrigger } from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './DropdownMenu';

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  links: {
    title: string
    href: string
    isActive: boolean
    disabled?: boolean
  }[]
}

function TopNav({ className, links, ...props }: TopNavProps) {
  return ( 
      <nav
        className={cn(
          'hidden items-center space-x-4 md:flex lg:space-x-6',
          className
        )}
        {...props}
      >
        {links.map(({ title, href, isActive, disabled }) => (
          <Link
            key={`${title}-${href}`}
            href={href}
            className={cn(
              'hover:text-primary text-sm font-medium transition-colors',
              isActive ? '' : 'text-muted-foreground'
            )}
          >
            {title}
          </Link>
        ))}
      </nav>
  )
}

export default function Navigation() {
  const pathname = usePathname();
  const localize = useLocalizedPath();
  const t = useTranslations();
  const { isGuestMode } = useAuth();
  const [offset, setOffset] = React.useState(0);

  const navigation = [
    { name: t('navigation.inventory'), href: '/', icon: Home },
    { name: t('navigation.favorites'), href: '/favorites', icon: Heart }
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

  return (
    <header
      className={cn(
        'bg-background flex h-16 items-center gap-3 p-4 sm:gap-4 fixed top-0 left-0 right-0 z-50 border-b',
        offset > 10 ? 'shadow-sm' : 'shadow-none'
      )}
    >
      {/* Sidebar Trigger */}
      <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />

      {/* Separator - only on mobile */}
      <Separator orientation="vertical" className="h-6 sm:hidden" />

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

      {/* Right side items */}
      <div className="ml-auto flex items-center space-x-2">
        {/* Desktop Navigation */}
        <TopNav links={navLinks} />
        
        {/* <LanguageSwitcher /> */}
        <ProfileDropdown />
      </div>
    </header>
  );
} 