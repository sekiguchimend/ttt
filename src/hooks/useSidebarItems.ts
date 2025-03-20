import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { defaultItems } from '@/components/layout/SidebarConfig';
import type { SidebarItem } from '@/types/sidebar';

export const useSidebarItems = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<SidebarItem[]>([]);

  useEffect(() => {
    // 管理者の場合は全てのメニューを表示
    if (isAdmin) {
      setItems(defaultItems as SidebarItem[]);
      return;
    }

    // 従業員の場合はadminOnlyがfalseのメニューのみを表示
    const filteredItems = defaultItems.filter(item => !item.adminOnly) as SidebarItem[];
    setItems(filteredItems);
  }, [isAdmin]);

  return items;
};
