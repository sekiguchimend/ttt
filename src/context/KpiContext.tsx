import React, { createContext, useContext, useState, useEffect } from 'react';
import { KpiMetric, KpiTarget, KpiAchievement, KpiType, KPI_TYPE_OPTIONS, KPI_CATEGORIES } from '@/types/kpi';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  userId: string;
  name: string;
  amount: number;
  date: string;
  category: 'sales' | 'development';
  description?: string;
}

// サンプルデータ
const SAMPLE_KPI_DATA: KpiMetric[] = [
  {
    id: '1',
    userId: '2', // 山田太郎（一般ユーザー）
    type: 'appointments',
    name: 'アポイント件数',
    value: 12,
    minimumTarget: 15,
    standardTarget: 20,
    stretchTarget: 25,
    unit: '件',
    date: '2023-06-01',
    category: 'sales',
  },
  {
    id: '2',
    userId: '2',
    type: 'closings',
    name: 'クロージング件数',
    value: 3,
    minimumTarget: 3,
    standardTarget: 5,
    stretchTarget: 8,
    unit: '件',
    date: '2023-06-01',
    category: 'sales',
  },
  {
    id: '3',
    userId: '1', // 管理者
    type: 'appointments',
    name: 'アポイント件数',
    value: 18,
    minimumTarget: 10,
    standardTarget: 15,
    stretchTarget: 20,
    unit: '件',
    date: '2023-06-01',
    category: 'sales',
  },
  {
    id: '4',
    userId: '2',
    type: 'contract_negotiations',
    name: '受託開発の商談',
    value: 5,
    minimumTarget: 3,
    standardTarget: 5,
    stretchTarget: 8,
    unit: '件',
    date: '2023-06-01',
    category: 'development',
  },
  {
    id: '5',
    userId: '2',
    type: 'contract_closings',
    name: '受託開発のクロージング',
    value: 2,
    minimumTarget: 1,
    standardTarget: 2,
    stretchTarget: 4,
    unit: '件',
    date: '2023-06-01',
    category: 'development',
  },
];

interface KpiContextType {
  metrics: KpiMetric[];
  targets: KpiTarget[];
  achievements: KpiAchievement[];
  transactions: Transaction[];
  addMetric: (metric: Omit<KpiMetric, 'id'>) => Promise<void>;
  updateMetric: (id: string, metric: Partial<KpiMetric>) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
  addTarget: (target: Omit<KpiTarget, 'id'>) => Promise<void>;
  updateTarget: (id: string, target: Partial<KpiTarget>) => Promise<void>;
  deleteTarget: (id: string) => Promise<void>;
  addAchievement: (achievement: Omit<KpiAchievement, 'id'>) => Promise<void>;
  updateAchievement: (id: string, achievement: Partial<KpiAchievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getMetricById: (id: string) => KpiMetric | undefined;
  getTargetById: (id: string) => KpiTarget | undefined;
  getAchievementById: (id: string) => KpiAchievement | undefined;
  getTransactionById: (id: string) => Transaction | undefined;
  getTargetsByMetric: (metricId: string) => KpiTarget[];
  getAchievementsByTarget: (targetId: string) => KpiAchievement[];
  loading: boolean;
}

const KpiContext = createContext<KpiContextType>({
  metrics: [],
  targets: [],
  achievements: [],
  transactions: [],
  addMetric: async () => {},
  updateMetric: async () => {},
  deleteMetric: async () => {},
  addTarget: async () => {},
  updateTarget: async () => {},
  deleteTarget: async () => {},
  addAchievement: async () => {},
  updateAchievement: async () => {},
  deleteAchievement: async () => {},
  addTransaction: async () => {},
  updateTransaction: async () => {},
  deleteTransaction: async () => {},
  getMetricById: () => undefined,
  getTargetById: () => undefined,
  getAchievementById: () => undefined,
  getTransactionById: () => undefined,
  getTargetsByMetric: () => [],
  getAchievementsByTarget: () => [],
  loading: true,
});

export const KpiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<KpiMetric[]>([]);
  const [targets, setTargets] = useState<KpiTarget[]>([]);
  const [achievements, setAchievements] = useState<KpiAchievement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // KPI指標データの取得
  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setMetrics(data.map(metric => ({
          id: metric.id,
          userId: metric.user_id,
          type: metric.type,
          name: metric.name,
          value: metric.value,
          minimumTarget: metric.minimum_target,
          standardTarget: metric.standard_target,
          stretchTarget: metric.stretch_target,
          unit: metric.unit,
          date: metric.date,
          category: metric.category,
          description: metric.description,
        })));
      }
    } catch (error) {
      console.error('Error fetching KPI metrics:', error);
      toast({
        title: "エラー",
        description: "KPI指標データの取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // KPI目標データの取得
  const fetchTargets = async () => {
    try {
      const { data, error } = await supabase
        .from('kpi_targets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTargets(data.map(target => ({
          id: target.id,
          metricId: target.metric_id,
          year: target.year,
          value: target.value,
          description: target.description,
        })));
      }
    } catch (error) {
      console.error('Error fetching KPI targets:', error);
      toast({
        title: "エラー",
        description: "KPI目標データの取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // KPI実績データの取得
  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('kpi_achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setAchievements(data.map(achievement => ({
          id: achievement.id,
          targetId: achievement.target_id,
          month: achievement.month,
          value: achievement.value,
          notes: achievement.notes,
        })));
      }
    } catch (error) {
      console.error('Error fetching KPI achievements:', error);
      toast({
        title: "エラー",
        description: "KPI実績データの取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // 取引データの取得
  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTransactions(data.map(transaction => ({
          id: transaction.id,
          userId: transaction.user_id,
          name: transaction.name,
          amount: transaction.amount,
          date: transaction.date,
          category: transaction.category,
          description: transaction.description,
        })));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "エラー",
        description: "取引データの取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // 初期データの読み込み
  useEffect(() => {
    Promise.all([
      fetchMetrics(),
      fetchTargets(),
      fetchAchievements(),
      fetchTransactions()
    ]).finally(() => {
    setLoading(false);
    });
  }, []);

  // KPI指標の追加
  const addMetric = async (data: Omit<KpiMetric, 'id'>) => {
    try {
      const { data: newMetric, error } = await supabase
        .from('kpi_metrics')
        .insert({
          user_id: data.userId,
          type: data.type,
          name: data.name,
          value: data.value,
          minimum_target: data.minimumTarget,
          standard_target: data.standardTarget,
          stretch_target: data.stretchTarget,
          unit: data.unit,
          date: data.date,
          category: data.category,
          description: data.description,
        })
        .select()
        .single();

      if (error) throw error;

      if (newMetric) {
        setMetrics(prev => [{
          id: newMetric.id,
          userId: newMetric.user_id,
          type: newMetric.type,
          name: newMetric.name,
          value: newMetric.value,
          minimumTarget: newMetric.minimum_target,
          standardTarget: newMetric.standard_target,
          stretchTarget: newMetric.stretch_target,
          unit: newMetric.unit,
          date: newMetric.date,
          category: newMetric.category,
          description: newMetric.description,
        }, ...prev]);

        toast({
          title: "成功",
          description: "KPI指標を追加しました。",
        });
      }
    } catch (error) {
      console.error('Error adding KPI metric:', error);
      toast({
        title: "エラー",
        description: "KPI指標の追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI指標の更新
  const updateMetric = async (id: string, data: Partial<KpiMetric>) => {
    try {
      const { error } = await supabase
        .from('kpi_metrics')
        .update({
          value: data.value,
          minimum_target: data.minimumTarget,
          standard_target: data.standardTarget,
          stretch_target: data.stretchTarget,
          unit: data.unit,
          date: data.date,
          category: data.category,
          description: data.description,
        })
        .eq('id', id);

      if (error) throw error;

      setMetrics(prev => prev.map(metric => 
        metric.id === id ? { ...metric, ...data } : metric
      ));

      toast({
        title: "成功",
        description: "KPI指標を更新しました。",
      });
    } catch (error) {
      console.error('Error updating KPI metric:', error);
      toast({
        title: "エラー",
        description: "KPI指標の更新に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI指標の削除
  const deleteMetric = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kpi_metrics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMetrics(prev => prev.filter(metric => metric.id !== id));

      toast({
        title: "成功",
        description: "KPI指標を削除しました。",
      });
    } catch (error) {
      console.error('Error deleting KPI metric:', error);
      toast({
        title: "エラー",
        description: "KPI指標の削除に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI目標の追加
  const addTarget = async (data: Omit<KpiTarget, 'id'>) => {
    try {
      const { data: newTarget, error } = await supabase
        .from('kpi_targets')
        .insert({
          metric_id: data.metricId,
          year: data.year,
          value: data.value,
          description: data.description,
        })
        .select()
        .single();

      if (error) throw error;

      if (newTarget) {
        setTargets(prev => [{
          id: newTarget.id,
          metricId: newTarget.metric_id,
          year: newTarget.year,
          value: newTarget.value,
          description: newTarget.description,
        }, ...prev]);

        toast({
          title: "KPI目標を追加しました",
          description: "KPI目標を追加しました。",
        });
      }
    } catch (error) {
      console.error('Error adding KPI target:', error);
      toast({
        title: "エラー",
        description: "KPI目標の追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI目標の更新
  const updateTarget = async (id: string, data: Partial<KpiTarget>) => {
    try {
      const { data: updatedTarget, error } = await supabase
        .from('kpi_targets')
        .update({
          metric_id: data.metricId,
          year: data.year,
          value: data.value,
          description: data.description,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updatedTarget) {
        setTargets(prev => prev.map(target =>
          target.id === id
            ? {
                id: updatedTarget.id,
                metricId: updatedTarget.metric_id,
                year: updatedTarget.year,
                value: updatedTarget.value,
                description: updatedTarget.description,
              }
            : target
        ));

        toast({
          title: "KPI目標を更新しました",
          description: "KPI目標を更新しました。",
        });
      }
    } catch (error) {
      console.error('Error updating KPI target:', error);
    toast({
        title: "エラー",
        description: "KPI目標の更新に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI目標の削除
  const deleteTarget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kpi_targets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTargets(prev => prev.filter(target => target.id !== id));

      toast({
        title: "KPI目標を削除しました",
        description: "KPI目標を削除しました。",
      });
    } catch (error) {
      console.error('Error deleting KPI target:', error);
    toast({
        title: "エラー",
        description: "KPI目標の削除に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI実績の追加
  const addAchievement = async (data: Omit<KpiAchievement, 'id'>) => {
    try {
      const { data: newAchievement, error } = await supabase
        .from('kpi_achievements')
        .insert({
          target_id: data.targetId,
          month: data.month,
          value: data.value,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;

      if (newAchievement) {
        setAchievements(prev => [{
          id: newAchievement.id,
          targetId: newAchievement.target_id,
          month: newAchievement.month,
          value: newAchievement.value,
          notes: newAchievement.notes,
        }, ...prev]);

        toast({
          title: "KPI実績を追加しました",
          description: "KPI実績を追加しました。",
        });
      }
    } catch (error) {
      console.error('Error adding KPI achievement:', error);
    toast({
        title: "エラー",
        description: "KPI実績の追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI実績の更新
  const updateAchievement = async (id: string, data: Partial<KpiAchievement>) => {
    try {
      const { data: updatedAchievement, error } = await supabase
        .from('kpi_achievements')
        .update({
          target_id: data.targetId,
          month: data.month,
          value: data.value,
          notes: data.notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updatedAchievement) {
        setAchievements(prev => prev.map(achievement =>
          achievement.id === id
            ? {
                id: updatedAchievement.id,
                targetId: updatedAchievement.target_id,
                month: updatedAchievement.month,
                value: updatedAchievement.value,
                notes: updatedAchievement.notes,
              }
            : achievement
        ));

        toast({
          title: "KPI実績を更新しました",
          description: "KPI実績を更新しました。",
        });
      }
    } catch (error) {
      console.error('Error updating KPI achievement:', error);
      toast({
        title: "エラー",
        description: "KPI実績の更新に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI実績の削除
  const deleteAchievement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kpi_achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAchievements(prev => prev.filter(achievement => achievement.id !== id));
    
    toast({
        title: "KPI実績を削除しました",
        description: "KPI実績を削除しました。",
      });
    } catch (error) {
      console.error('Error deleting KPI achievement:', error);
      toast({
        title: "エラー",
        description: "KPI実績の削除に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // KPI指標の取得
  const getMetricById = (id: string) => {
    return metrics.find(metric => metric.id === id);
  };

  // KPI目標の取得
  const getTargetById = (id: string) => {
    return targets.find(target => target.id === id);
  };

  // KPI実績の取得
  const getAchievementById = (id: string) => {
    return achievements.find(achievement => achievement.id === id);
  };

  // KPI目標の取得（指標別）
  const getTargetsByMetric = (metricId: string) => {
    return targets.filter(target => target.metricId === metricId);
  };

  // KPI実績の取得（目標別）
  const getAchievementsByTarget = (targetId: string) => {
    return achievements.filter(achievement => achievement.targetId === targetId);
  };

  // 取引の追加
  const addTransaction = async (data: Omit<Transaction, 'id'>) => {
    try {
      console.log('KpiContext addTransaction called with data:', data);
      
      // データの検証
      if (!data.userId) {
        console.error('Missing userId in transaction data');
        throw new Error('ユーザーIDが指定されていません');
      }

      console.log('Attempting to insert transaction into Supabase');
      // Supabaseへのデータ保存
      const { data: newTransaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: data.userId,
          name: data.name,
          amount: data.amount,
          date: data.date,
          category: data.category,
          description: data.description || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Supabase response:', newTransaction);

      if (newTransaction) {
        console.log('Transaction successfully created, updating local state');
        // ローカルの状態を更新
        const formattedTransaction = {
          id: newTransaction.id,
          userId: newTransaction.user_id,
          name: newTransaction.name,
          amount: newTransaction.amount,
          date: newTransaction.date,
          category: newTransaction.category,
          description: newTransaction.description,
        };

        setTransactions(prev => {
          console.log('Previous transactions:', prev);
          const newTransactions = [formattedTransaction, ...prev];
          console.log('New transactions array:', newTransactions);
          return newTransactions;
    });
    
    toast({
          title: "成功",
          description: "取引を追加しました。",
        });
      } else {
        console.error('No transaction data returned from Supabase');
        throw new Error('取引の保存に失敗しました');
      }
    } catch (error) {
      console.error('Error in KpiContext addTransaction:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "取引の追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 取引の更新
  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          name: data.name,
          amount: data.amount,
          date: data.date,
          category: data.category,
          description: data.description,
        })
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.map(transaction =>
        transaction.id === id
          ? { ...transaction, ...data }
          : transaction
      ));
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "エラー",
        description: "取引の更新に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 取引の削除
  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "エラー",
        description: "取引の削除に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 取引の取得
  const getTransactionById = (id: string) => {
    return transactions.find(transaction => transaction.id === id);
  };

  return (
    <KpiContext.Provider value={{
      metrics,
      targets,
      achievements,
      transactions,
      addMetric,
      updateMetric,
      deleteMetric,
      addTarget,
      updateTarget,
      deleteTarget,
      addAchievement,
      updateAchievement,
      deleteAchievement,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getMetricById,
      getTargetById,
      getAchievementById,
      getTransactionById,
      getTargetsByMetric,
      getAchievementsByTarget,
      loading,
    }}>
      {children}
    </KpiContext.Provider>
  );
};

// Custom hook for using KPI context
const useKpi = () => useContext(KpiContext);

export { useKpi };
