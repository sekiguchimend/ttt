import React, { createContext, useContext, useState, useEffect } from 'react';
import { FixedCost, FixedCostCategory, MonthlySummary } from '@/types/fixed-costs';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FixedCostsContextType {
  costs: FixedCost[];
  categories: FixedCostCategory[];
  monthlySummaries: MonthlySummary[];
  addCost: (data: Omit<FixedCost, 'id'>) => Promise<void>;
  updateCost: (id: string, data: Partial<FixedCost>) => Promise<void>;
  deleteCost: (id: string) => Promise<void>;
  addCategory: (data: Omit<FixedCostCategory, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<FixedCostCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCostById: (id: string) => FixedCost | undefined;
  getCategoryById: (id: string) => FixedCostCategory | undefined;
  getCostsByMonth: (month: string) => FixedCost[];
  calculateMonthlySummaries: () => Promise<void>;
  loading: boolean;
}

const FixedCostsContext = createContext<FixedCostsContextType>({
  costs: [],
  categories: [],
  monthlySummaries: [],
  addCost: async () => {},
  updateCost: async () => {},
  deleteCost: async () => {},
  addCategory: async () => {},
  updateCategory: async () => {},
  deleteCategory: async () => {},
  getCostById: () => undefined,
  getCategoryById: () => undefined,
  getCostsByMonth: () => [],
  calculateMonthlySummaries: async () => {},
  loading: true,
});

export const FixedCostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [costs, setCosts] = useState<FixedCost[]>([]);
  const [categories, setCategories] = useState<FixedCostCategory[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 固定費データの取得
  const fetchCosts = async () => {
    try {
      const { data, error } = await supabase
        .from('fixed_costs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setCosts(data.map(cost => ({
          id: cost.id,
          name: cost.name,
          categoryId: cost.category_id,
          amount: cost.amount,
          paymentDate: cost.payment_date,
          isRecurring: cost.is_recurring,
          recurringInterval: cost.recurring_interval,
          notes: cost.notes,
        })));
      }
    } catch (error) {
      console.error('Error fetching fixed costs:', error);
      toast({
        title: "エラー",
        description: "固定費データの取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // カテゴリーデータの取得
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('fixed_cost_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setCategories(data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
        })));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "エラー",
        description: "カテゴリーデータの取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // 初期データの読み込み
  useEffect(() => {
    Promise.all([fetchCosts(), fetchCategories()]).finally(() => {
    setLoading(false);
    });
  }, []);
  
  // 固定費の追加
  const addCost = async (data: Omit<FixedCost, 'id'>) => {
    try {
      const { data: newCost, error } = await supabase
        .from('fixed_costs')
        .insert({
          name: data.name,
          category_id: data.categoryId,
          amount: data.amount,
          payment_date: data.paymentDate,
          is_recurring: data.isRecurring,
          recurring_interval: data.recurringInterval,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;

      if (newCost) {
        setCosts(prev => [{
          id: newCost.id,
          name: newCost.name,
          categoryId: newCost.category_id,
          amount: newCost.amount,
          paymentDate: newCost.payment_date,
          isRecurring: newCost.is_recurring,
          recurringInterval: newCost.recurring_interval,
          notes: newCost.notes,
        }, ...prev]);

        toast({
          title: "固定費を追加しました",
          description: `${data.name}を追加しました。`,
        });
      }
    } catch (error) {
      console.error('Error adding fixed cost:', error);
      toast({
        title: "エラー",
        description: "固定費の追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 固定費の更新
  const updateCost = async (id: string, data: Partial<FixedCost>) => {
    try {
      const { data: updatedCost, error } = await supabase
        .from('fixed_costs')
        .update({
          name: data.name,
          category_id: data.categoryId,
          amount: data.amount,
          payment_date: data.paymentDate,
          is_recurring: data.isRecurring,
          recurring_interval: data.recurringInterval,
          notes: data.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updatedCost) {
        setCosts(prev => prev.map(cost =>
          cost.id === id
            ? {
                id: updatedCost.id,
                name: updatedCost.name,
                categoryId: updatedCost.category_id,
                amount: updatedCost.amount,
                paymentDate: updatedCost.payment_date,
                isRecurring: updatedCost.is_recurring,
                recurringInterval: updatedCost.recurring_interval,
                notes: updatedCost.notes,
              }
            : cost
        ));

        toast({
          title: "固定費を更新しました",
          description: `${data.name}の情報を更新しました。`,
        });
      }
    } catch (error) {
      console.error('Error updating fixed cost:', error);
      toast({
        title: "エラー",
        description: "固定費の更新に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 固定費の削除
  const deleteCost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fixed_costs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCosts(prev => prev.filter(cost => cost.id !== id));

      toast({
        title: "固定費を削除しました",
        description: "固定費を削除しました。",
      });
    } catch (error) {
      console.error('Error deleting fixed cost:', error);
      toast({
        title: "エラー",
        description: "固定費の削除に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // カテゴリーの追加
  const addCategory = async (data: Omit<FixedCostCategory, 'id'>) => {
    try {
      const { data: newCategory, error } = await supabase
        .from('fixed_cost_categories')
        .insert({
          name: data.name,
          description: data.description,
        })
        .select()
        .single();

      if (error) throw error;

      if (newCategory) {
        setCategories(prev => [{
          id: newCategory.id,
          name: newCategory.name,
          description: newCategory.description,
        }, ...prev]);

        toast({
          title: "カテゴリーを追加しました",
          description: `${data.name}を追加しました。`,
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "エラー",
        description: "カテゴリーの追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // カテゴリーの更新
  const updateCategory = async (id: string, data: Partial<FixedCostCategory>) => {
    try {
      const { data: updatedCategory, error } = await supabase
        .from('fixed_cost_categories')
        .update({
          name: data.name,
          description: data.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updatedCategory) {
        setCategories(prev => prev.map(category =>
          category.id === id
            ? {
                id: updatedCategory.id,
                name: updatedCategory.name,
                description: updatedCategory.description,
              }
            : category
        ));

        toast({
          title: "カテゴリーを更新しました",
          description: `${data.name}の情報を更新しました。`,
        });
      }
    } catch (error) {
      console.error('Error updating category:', error);
    toast({
        title: "エラー",
        description: "カテゴリーの更新に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // カテゴリーの削除
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fixed_cost_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(category => category.id !== id));

      toast({
        title: "カテゴリーを削除しました",
        description: "カテゴリーを削除しました。",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
    toast({
        title: "エラー",
        description: "カテゴリーの削除に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 固定費の取得
  const getCostById = (id: string) => {
    return costs.find(cost => cost.id === id);
  };

  // カテゴリーの取得
  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  // 月別の固定費取得
  const getCostsByMonth = (month: string) => {
    return costs.filter(cost => {
      const paymentDate = new Date(cost.paymentDate);
      const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      return paymentMonth === month;
    });
  };
  
  // 月次サマリーの計算
  const calculateMonthlySummaries = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const summaries: MonthlySummary[] = [];

      for (let month = 1; month <= 12; month++) {
        const monthStr = `${currentYear}-${String(month).padStart(2, '0')}`;
        const monthCosts = getCostsByMonth(monthStr);
        
        const categoryTotals = categories.reduce((acc, category) => {
          acc[category.id] = monthCosts
            .filter(cost => cost.categoryId === category.id)
            .reduce((sum, cost) => sum + cost.amount, 0);
          return acc;
        }, {} as Record<string, number>);

        const total = monthCosts.reduce((sum, cost) => sum + cost.amount, 0);

        summaries.push({
          year: currentYear,
          month,
          total,
          categoryTotals,
        });
      }

      setMonthlySummaries(summaries);
    } catch (error) {
      console.error('Error calculating monthly summaries:', error);
    toast({
        title: "エラー",
        description: "月次サマリーの計算に失敗しました。",
        variant: "destructive",
    });
    }
  };
  
  return (
    <FixedCostsContext.Provider value={{
      costs,
      categories,
      monthlySummaries,
      addCost,
      updateCost,
      deleteCost,
      addCategory,
      updateCategory,
      deleteCategory,
      getCostById,
      getCategoryById,
      getCostsByMonth,
      calculateMonthlySummaries,
      loading,
    }}>
      {children}
    </FixedCostsContext.Provider>
  );
};

export const useFixedCosts = () => useContext(FixedCostsContext);
