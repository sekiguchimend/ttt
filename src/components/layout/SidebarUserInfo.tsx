
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from './SidebarContext';

export const SidebarUserInfo: React.FC = () => {
  const { user } = useAuth();
  const { collapsed } = useSidebar();
  
  if (collapsed || !user) return null;
  
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{user.name}</div>
          <div className="text-xs text-muted-foreground truncate">{user.department}</div>
        </div>
      </div>
    </div>
  );
};
