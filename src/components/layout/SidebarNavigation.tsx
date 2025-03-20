import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { useSidebarItems } from '@/hooks/useSidebarItems';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Target,
  Users,
  UserCog,
  Settings,
  BarChart
} from 'lucide-react';

interface SidebarItemProps {
  item: {
    id: string;
    name: string;
    icon: string;
    path: string;
  };
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'LineChart':
      return LineChart;
    case 'Target':
      return Target;
    case 'Users':
      return Users;
    case 'UserCog':
      return UserCog;
    case 'Settings':
      return Settings;
    case 'BarChart':
      return BarChart;
    default:
      return LineChart;
  }
};

const SidebarItem: React.FC<SidebarItemProps> = ({ item }) => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const Icon = getIcon(item.icon);

  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
        location.pathname === item.path && 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50'
      )}
    >
      <Icon className="h-5 w-5" />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  );
};

export const SidebarNavigation = () => {
  const items = useSidebarItems();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <SidebarItem key={item.id} item={item} />
      ))}
    </nav>
  );
};
