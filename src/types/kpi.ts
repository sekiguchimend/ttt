// KPI関連の型定義

export type KpiType = 'appointments' | 'closings' | 'contract_negotiations' | 'contract_closings';

export const KPI_CATEGORIES = ['sales', 'development'] as const;
export type KpiCategory = typeof KPI_CATEGORIES[number];

// KPI表示オプション - この型を拡張して必要なプロパティを追加
export interface KpiTypeOption {
  value: KpiType;
  label: string;
  category: KpiCategory;
  unit: string;
}

// KPIタイプの選択肢
export const KPI_TYPE_OPTIONS: KpiTypeOption[] = [
  { value: 'appointments', label: 'アポイント件数', category: 'sales', unit: '件' },
  { value: 'closings', label: 'クロージング件数', category: 'sales', unit: '件' },
  { value: 'contract_negotiations', label: '受託開発の商談', category: 'development', unit: '件' },
  { value: 'contract_closings', label: '受託開発のクロージング', category: 'development', unit: '件' }
];

// カテゴリ選択用のオプション
export interface CategoryOption {
  value: KpiCategory;
  label: string;
}

// カテゴリの選択肢
export const KPI_CATEGORIES_OPTIONS: CategoryOption[] = [
  { value: 'sales', label: '営業' },
  { value: 'development', label: '開発' }
];

// KPIメトリクスの型定義
export interface KpiMetric {
  id: string;
  userId: string;
  type: KpiType;
  name: string;
  category: KpiCategory;
  value: number;
  minimumTarget: number;
  standardTarget: number;
  stretchTarget: number;
  unit: string;
  date: string;
  description?: string;
}

// KPI目標の型定義
export interface KpiTarget {
  id: string;
  metricId: string;
  year: number;
  value: number;
  description?: string;
}

// KPI達成度の型定義
export interface KpiAchievement {
  id: string;
  targetId: string;
  month: string;
  value: number;
  notes?: string;
}