
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';
import { SidebarHeader } from './SidebarHeader';
import { SidebarUserInfo } from './SidebarUserInfo';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarFooter } from './SidebarFooter';

interface DesktopSidebarProps {
  className?: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ className }) => {
  const { collapsed } = useSidebar();
  
  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' }
  };
  
  return (
    <motion.div
      initial="expanded"
      animate={collapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "hidden lg:block h-screen sticky top-0 bg-background border-r",
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
  );
};
