'use client';

import React from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { User, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './DropdownMenu';

export function ProfileDropdown() {
    const { user, isGuestMode, isAuthenticated, logout, exitGuestMode } = useAuth();
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
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarFallback>GU</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-56 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    forceMount
                >
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm leading-none font-medium">Guest User</p>
                            <p className="text-muted-foreground text-xs leading-none">
                                {t('settings.guestMode')}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <button onClick={handleProfileClick} className="w-full text-left">
                                <User className="mr-2 h-4 w-4" />
                                {t('user.profile')}
                            </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <button onClick={handleSettingsClick} className="w-full text-left">
                                <Settings className="mr-2 h-4 w-4" />
                                {t('settings.title')}
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('user.logout')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                    <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                        {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.nickname || user.username || 'User'} />
                        ) : null}
                        <AvatarFallback>
                            {getInitials((user.nickname || user.username) ?? '')}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                align="end"
                side="bottom"
                sideOffset={8}
                forceMount
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm leading-none font-medium">
                            {user.nickname || user.username}
                        </p>
                        <p className="text-muted-foreground text-xs leading-none">
                            {isGuestMode ? 'Guest Mode' : 'Authenticated'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <button onClick={handleProfileClick} className="w-full text-left">
                            <User className="mr-2 h-4 w-4" />
                            {t('user.profile')}
                        </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <button onClick={handleSettingsClick} className="w-full text-left">
                            <Settings className="mr-2 h-4 w-4" />
                            {t('settings.title')}
                        </button>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                
                {isAuthenticated && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            {t('auth.signOut')}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 