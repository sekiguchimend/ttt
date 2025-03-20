
import React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';

interface SidebarHeaderProps {
  className?: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ className }) => {
  const { collapsed, toggleCollapse } = useSidebar();
  
  return (
    <div className={cn(
      "flex items-center p-4 border-b",
      collapsed ? "justify-center" : "justify-between",
      className
    )}>
      {!collapsed && (
        <div className="font-semibold text-lg">ERP System</div>
      )}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleCollapse} 
        className="hidden lg:flex"
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </Button>
    </div>
  );
};
