'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from "@/shared/components/Navigation";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/AppSidebar";

interface LayoutContentProps {
  children: ReactNode;
}

const LayoutContent = ({ children }: LayoutContentProps) => {
  const pathname = usePathname();
  const isOnboardingPage = pathname?.includes('/onboarding');

  // If on onboarding page, render without sidebar and navigation
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  // Otherwise, render with sidebar and navigation
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <div className="w-full">
        <Navigation />
        <div className="pt-16">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LayoutContent;
