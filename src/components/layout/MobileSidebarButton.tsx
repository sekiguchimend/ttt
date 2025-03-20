
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from './SidebarContext';

export const MobileSidebarButton: React.FC = () => {
  const { mobileOpen, toggleMobileMenu } = useSidebar();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="fixed top-4 left-4 z-50 lg:hidden"
      onClick={toggleMobileMenu}
    >
      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
    </Button>
  );
};
