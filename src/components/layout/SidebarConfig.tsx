export interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  adminOnly: boolean;
}

export const defaultItems: SidebarItem[] = [
  {
    id: 'sales',
    name: '営業',
    icon: 'LineChart',
    path: '/sales',
    adminOnly: false
  },
  {
    id: 'kpi',
    name: 'KPI管理',
    icon: 'Target',
    path: '/kpi',
    adminOnly: false
  },
  {
    id: 'recruitment',
    name: '採用管理',
    icon: 'Users',
    path: '/recruitment',
    adminOnly: true
  },
  {
    id: 'employees',
    name: '従業員管理',
    icon: 'UserCog',
    path: '/employees',
    adminOnly: true
  },
  {
    id: 'settings',
    name: '設定',
    icon: 'Settings',
    path: '/settings',
    adminOnly: true
  },
  {
    id: 'financial-report',
    name: '財務レポート',
    icon: 'BarChart',
    path: '/financial-report',
    adminOnly: true
  }
]; 