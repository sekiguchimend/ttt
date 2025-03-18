
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SidebarItem, defaultItems } from '@/components/layout/SidebarConfig';

export function useSidebarItems() {
  const { isAdmin, user } = useAuth();
  const [items, setItems] = useState<SidebarItem[]>([]);

  useEffect(() => {
    const filteredItems = defaultItems.filter(item => {
      // 管理者以外には管理者専用項目を表示しない
      if (item.adminOnly && !isAdmin) return false;
      
      // 従業員ユーザーには employeeHidden がついた項目を表示しない（採用など）
      if (item.employeeHidden && user?.role === 'employee') return false;
      
      return true;
    });
    
    const savedOrder = localStorage.getItem('sidebar_order');
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        const orderedItems = parsed
          .filter((id: string) => filteredItems.some(item => item.id === id))
          .map((id: string) => filteredItems.find(item => item.id === id))
          .filter(Boolean);
        
        filteredItems.forEach(item => {
          if (!orderedItems.some((i: SidebarItem) => i.id === item.id)) {
            orderedItems.push(item);
          }
        });
        
        setItems(orderedItems);
      } catch (e) {
        setItems(filteredItems);
      }
    } else {
      setItems(filteredItems);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (items.length > 0) {
      const orderIds = items.map(item => item.id);
      localStorage.setItem('sidebar_order', JSON.stringify(orderIds));
    }
  }, [items]);

  return { items, setItems };
}
