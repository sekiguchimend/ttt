
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from './SidebarContext';
import { MobileSidebar } from './MobileSidebar';
import { DesktopSidebar } from './DesktopSidebar';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      {isMobile ? (
        <MobileSidebar className={className} />
      ) : (
        <DesktopSidebar className={className} />
      )}
    </SidebarProvider>
  );
};
