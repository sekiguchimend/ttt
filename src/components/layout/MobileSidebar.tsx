
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';
import { SidebarHeader } from './SidebarHeader';
import { SidebarUserInfo } from './SidebarUserInfo';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarFooter } from './SidebarFooter';
import { MobileSidebarButton } from './MobileSidebarButton';

interface MobileSidebarProps {
  className?: string;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ className }) => {
  const { mobileOpen, closeMobileMenu } = useSidebar();
  
  const mobileMenuVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  };
  
  return (
    <>
      <MobileSidebarButton />
      <motion.div
        initial="closed"
        animate={mobileOpen ? "open" : "closed"}
        variants={mobileMenuVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r shadow-lg",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader />
          <SidebarUserInfo />
          <SidebarNavigation />
          <SidebarFooter />
        </div>
      </motion.div>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};
