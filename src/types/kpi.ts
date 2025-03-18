export type KpiType =
  | 'appointments' // アポイント件数
  | 'closings' // クロージング件数
  | 'meetings' // 顧客面談数
  | 'calls' // 電話件数
  | 'emails' // メール送信数
  | 'sales' // 売上
  | 'custom' // カスタム項目
  | 'contract_negotiations' // 受託開発の商談
  | 'contract_closings'; // 受託開発のクロージング

export interface KpiMetric {
  id: string;
  userId: string; // 従業員ID
  type: KpiType;
  name: string; // 表示名
  value: number;
  minimumTarget: number; // 最低ライン
  standardTarget: number; // 普通ライン
  stretchTarget: number; // いいライン
  unit: string;
  date: string; // ISO形式の日付
  notes?: string;
  category?: 'sales' | 'development' | 'other'; // カテゴリ
  target?: number; // 後方互換性のため
}

export interface KpiTypeOption {
  value: KpiType;
  label: string;
  unit: string;
  icon?: string;
  category?: 'sales' | 'development' | 'other';
}

// KPI_TYPE_OPTIONSは共通定義をインポートして使用
export const KPI_TYPE_OPTIONS: KpiTypeOption[] = [
  { value: 'appointments', label: 'アポイント件数', unit: '件', category: 'sales' },
  { value: 'closings', label: 'クロージング件数', unit: '件', category: 'sales' },
  { value: 'meetings', label: '顧客面談数', unit: '回', category: 'sales' },
  { value: 'calls', label: '電話件数', unit: '件', category: 'sales' },
  { value: 'emails', label: 'メール送信数', unit: '件', category: 'sales' },
  { value: 'sales', label: '売上', unit: '円', category: 'sales' },
  { value: 'contract_negotiations', label: '受託開発の商談', unit: '件', category: 'development' },
  { value: 'contract_closings', label: '受託開発のクロージング', unit: '件', category: 'development' },
  { value: 'custom', label: 'カスタム指標', unit: '', category: 'other' },
];

// KPIカテゴリの定義
export const KPI_CATEGORIES = [
  { value: 'sales', label: '営業KPI' },
  { value: 'development', label: '受託開発KPI' },
  { value: 'other', label: 'その他' }
];
