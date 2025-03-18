import React, { createContext, useContext, useState, useEffect } from 'react';
import { KpiMetric, KpiType, KPI_TYPE_OPTIONS, KPI_CATEGORIES } from '@/types/kpi';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  kpis: KpiMetric[];
  userKpis: KpiMetric[];
  addKpi: (kpi: Omit<KpiMetric, 'id'>) => void;
  updateKpi: (id: string, kpi: Partial<KpiMetric>) => void;
  deleteKpi: (id: string) => void;
  getKpisByUser: (userId: string) => KpiMetric[];
  getKpisByUserAndCategory: (userId: string, category?: string) => KpiMetric[];
  assignKpiTemplate: (userId: string, kpiTypes: KpiType[]) => void;
  getUserKpiTypes: (userId: string) => KpiType[];
  getUserKpiCategories: (userId: string) => string[];
  loading: boolean;
}

const KpiContext = createContext<KpiContextType>({
  kpis: [],
  userKpis: [],
  addKpi: () => {},
  updateKpi: () => {},
  deleteKpi: () => {},
  getKpisByUser: () => [],
  getKpisByUserAndCategory: () => [],
  assignKpiTemplate: () => {},
  getUserKpiTypes: () => [],
  getUserKpiCategories: () => [],
  loading: false,
});

export const KpiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kpis, setKpis] = useState<KpiMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // ローカルストレージからKPIデータを読み込む
  useEffect(() => {
    const storedKpis = localStorage.getItem('erp_kpis');
    if (storedKpis) {
      // 古いデータ形式を新しい形式に変換
      const parsedKpis = JSON.parse(storedKpis);
      const updatedKpis = parsedKpis.map((kpi: any) => {
        // 古いデータ形式の場合、新しいフィールドを追加
        if (kpi.target !== undefined && kpi.minimumTarget === undefined) {
          const typeOption = KPI_TYPE_OPTIONS.find(option => option.value === kpi.type);
          return {
            ...kpi,
            minimumTarget: Math.round(kpi.target * 0.7), // 最低ラインは目標の70%
            standardTarget: kpi.target, // 普通ラインは元の目標
            stretchTarget: Math.round(kpi.target * 1.3), // いいラインは目標の130%
            category: typeOption?.category || 'other',
          };
        }
        return kpi;
      });
      setKpis(updatedKpis);
    } else {
      // サンプルデータをセット
      setKpis(SAMPLE_KPI_DATA);
      localStorage.setItem('erp_kpis', JSON.stringify(SAMPLE_KPI_DATA));
    }
    setLoading(false);
  }, []);

  // KPIデータ変更時にローカルストレージに保存
  useEffect(() => {
    if (kpis.length > 0) {
      localStorage.setItem('erp_kpis', JSON.stringify(kpis));
    }
  }, [kpis]);

  // ログインユーザーに関連するKPIを抽出
  const userKpis = user ? kpis.filter(kpi => kpi.userId === user.id) : [];

  // 特定ユーザーのKPIを取得する関数
  const getKpisByUser = (userId: string) => {
    return kpis.filter(kpi => kpi.userId === userId);
  };

  // 特定ユーザーの特定カテゴリのKPIを取得する関数
  const getKpisByUserAndCategory = (userId: string, category?: string) => {
    if (!category) {
      return getKpisByUser(userId);
    }
    return kpis.filter(kpi => kpi.userId === userId && kpi.category === category);
  };

  // ユーザーに設定されているKPIタイプのリストを取得
  const getUserKpiTypes = (userId: string): KpiType[] => {
    const userKpis = getKpisByUser(userId);
    // 一意のKPIタイプを取得
    return [...new Set(userKpis.map(kpi => kpi.type))];
  };

  // ユーザーに設定されているKPIカテゴリのリストを取得
  const getUserKpiCategories = (userId: string): string[] => {
    const userKpis = getKpisByUser(userId);
    // 一意のKPIカテゴリを取得
    return [...new Set(userKpis.map(kpi => kpi.category || 'other'))];
  };

  // KPI追加
  const addKpi = (kpi: Omit<KpiMetric, 'id'>) => {
    const newKpi: KpiMetric = {
      ...kpi,
      id: Date.now().toString(),
    };
    setKpis(prev => [...prev, newKpi]);
    toast({
      title: "KPI追加完了",
      description: `${kpi.name}を追加しました`,
    });
  };

  // KPI更新
  const updateKpi = (id: string, updatedKpi: Partial<KpiMetric>) => {
    setKpis(prev =>
      prev.map(kpi =>
        kpi.id === id ? { ...kpi, ...updatedKpi } : kpi
      )
    );
    toast({
      title: "KPI更新完了",
      description: "KPIデータを更新しました",
    });
  };

  // KPI削除
  const deleteKpi = (id: string) => {
    setKpis(prev => prev.filter(kpi => kpi.id !== id));
    toast({
      title: "KPI削除完了",
      description: "KPIを削除しました",
    });
  };

  // ユーザーにKPIテンプレートを割り当てる
  const assignKpiTemplate = (userId: string, kpiTypes: KpiType[]) => {
    // 今日の日付を取得
    const today = new Date().toISOString().split('T')[0];
    
    // 指定されたKPIタイプに基づいてKPIを作成
    const newKpis = kpiTypes.map(type => {
      const typeOption = KPI_TYPE_OPTIONS.find(option => option.value === type);
      const defaultTarget = 10; // デフォルト目標値
      
      return {
        id: `${Date.now()}-${type}-${userId}`,
        userId,
        type,
        name: typeOption?.label || '',
        value: 0,
        minimumTarget: Math.round(defaultTarget * 0.7), // 最低ライン
        standardTarget: defaultTarget, // 普通ライン
        stretchTarget: Math.round(defaultTarget * 1.3), // いいライン
        unit: typeOption?.unit || '',
        date: today,
        category: typeOption?.category || 'other',
      };
    });
    
    // 既存のKPIと新しいKPIを結合
    setKpis(prev => {
      // 指定されたユーザーの同じタイプのKPIを除外（上書き）
      const filteredKpis = prev.filter(kpi =>
        !(kpi.userId === userId && kpiTypes.includes(kpi.type))
      );
      return [...filteredKpis, ...newKpis];
    });
    
    toast({
      title: "KPI割り当て完了",
      description: `${newKpis.length}個のKPIが割り当てられました`,
    });
  };

  return (
    <KpiContext.Provider value={{
      kpis,
      userKpis,
      addKpi,
      updateKpi,
      deleteKpi,
      getKpisByUser,
      getKpisByUserAndCategory,
      assignKpiTemplate,
      getUserKpiTypes,
      getUserKpiCategories,
      loading
    }}>
      {children}
    </KpiContext.Provider>
  );
};

// カスタムフック
export const useKpi = () => useContext(KpiContext);
