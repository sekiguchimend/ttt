import React from 'react';
import { 
  Briefcase, Users, Calculator, BarChart3, ShoppingBag, Settings, FileCheck
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  name: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
  employeeHidden?: boolean;
}

export const defaultItems: SidebarItem[] = [
  { id: '1', name: '営業', icon: ShoppingBag, path: '/sales' },
  { id: '2', name: 'KPI管理', icon: BarChart3, path: '/kpi' },
  { id: '3', name: '採用', icon: Briefcase, path: '/recruitment', adminOnly: true },
  { id: '4', name: '人事・給与', icon: Users, path: '/hr', adminOnly: true },
  { id: '5', name: '業務委託管理', icon: FileCheck, path: '/contractors', adminOnly: true },
  { id: '6', name: '固定費管理', icon: Calculator, path: '/fixed-costs', adminOnly: true },
  { id: '7', name: '設定', icon: Settings, path: '/settings', adminOnly: false },
];
