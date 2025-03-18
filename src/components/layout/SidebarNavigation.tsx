
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';
import { useSidebarItems } from '@/hooks/useSidebarItems';
import { SidebarItem } from './SidebarConfig';

export const SidebarNavigation: React.FC = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const { items, setItems } = useSidebarItems();
  
  return (
    <div className="flex-1 overflow-y-auto py-4">
      <Reorder.Group values={items} onReorder={setItems} className="space-y-1 px-3">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Reorder.Item
              key={item.id}
              value={item}
              className={cn(
                "sidebar-item",
                isActive && "sidebar-item-active",
                !isActive && "hover:bg-accent"
              )}
            >
              <Link 
                to={item.path} 
                className="flex items-center gap-3 w-full"
              >
                <Icon size={20} className={cn(isActive && "text-primary")} />
                {!collapsed && (
                  <span className={cn(isActive && "font-medium")}>
                    {item.name}
                  </span>
                )}
              </Link>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
};
