
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from './SidebarContext';

export const SidebarFooter: React.FC = () => {
  const { logout } = useAuth();
  const { collapsed } = useSidebar();
  
  return (
    <div className="p-4 border-t">
      <Button
        variant="ghost"
        className={cn("w-full justify-start", !collapsed ? "px-3" : "px-0 justify-center")}
        onClick={logout}
      >
        <LogOut size={20} className="mr-2" />
        {!collapsed && "ログアウト"}
      </Button>
    </div>
  );
};
