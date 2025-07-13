'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, Settings, User, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import useLocalizedPath from '@/shared/hooks/useLocalizedPath'
import { useAuth } from '@/shared/services/AuthContext'
import LanguageSwitcher from '@/shared/components/LanguageSwitcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from '@/shared/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const pathname = usePathname()
  const localize = useLocalizedPath()
  const t = useTranslations()
  const { isGuestMode } = useAuth()

  const navigation = [
    { name: t('navigation.inventory'), href: '/', icon: Home },
    { name: t('navigation.favorites'), href: '/favorites', icon: Heart },
    { name: t('navigation.settings'), href: '/setting', icon: Settings },
  ]

  return (
    <Sidebar collapsible='offcanvas' variant='floating'>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <div className="icon-cute pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold gradient-text">Smart Fridge</span>
          </div>
          <SidebarTrigger className="md:hidden" />
        </div>
        {isGuestMode && (
          <div className="flex items-center justify-center space-x-2 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-md w-fit mx-auto" title='💡 Your data is stored locally on this device. Consider creating an account to sync your data across devices.'>
            <User className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-800">Guest Mode</span>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    'w-full',
                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                  )}
                >
                  <Link href={localize(item.href)}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <LanguageSwitcher className="mb-3" />
        <SidebarSeparator />
        <div className="px-2 py-2 text-xs text-muted-foreground">
          <p>Smart Fridge v1.0</p>
          <p>© 2024 FoodSai</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 