'use client';

import React from 'react';
import { useAuth } from '@/shared/services/AuthContext';
import { User, Settings, LogOut, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu';

interface UserProfileDropdownProps {
  className?: string;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ className = '' }) => {
  const { user, isGuestMode, logout, exitGuestMode } = useAuth();
  const router = useRouter();
  const localize = useLocalizedPath();
  const t = useTranslations();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    router.push(localize('/profile'));
  };

  const handleSettingsClick = () => {
    router.push(localize('/setting'));
  };

  const handleLogout = () => {
    if (isGuestMode) {
      exitGuestMode();
    } else {
      logout();
    }
  };

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors ${className}`}>
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white">Guest</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Guest User</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Exit Guest Mode</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors ${className}`}>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.nickname || user.username || 'User'}
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {getInitials((user.nickname || user.username) ?? '')}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.nickname || user.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {isGuestMode ? 'Guest Mode' : 'Authenticated'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('settings.title')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('auth.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 