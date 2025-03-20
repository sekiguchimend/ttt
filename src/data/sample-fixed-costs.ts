
import { FixedCost } from "@/types/fixed-costs";

// サンプルデータ
export const SAMPLE_FIXED_COSTS: FixedCost[] = [
  {
    id: '1',
    name: 'オフィス賃料',
    amount: 350000,
    category: '不動産',
    startDate: '2022-01-01',
    description: '東京オフィスの家賃',
    isRecurring: true,
  },
  {
    id: '2',
    name: 'インターネット',
    amount: 15000,
    category: 'ユーティリティ',
    startDate: '2022-01-01',
    description: 'オフィスの光回線',
    isRecurring: true,
  },
  {
    id: '3',
    name: 'サーバーホスティング',
    amount: 45000,
    category: 'IT',
    startDate: '2022-02-01',
    description: 'AWSサーバー料金',
    isRecurring: true,
  },
  {
    id: '4',
    name: '保険料',
    amount: 25000,
    category: '保険',
    startDate: '2022-01-01',
    description: '会社の損害保険',
    isRecurring: true,
  },
  {
    id: '5',
    name: 'セキュリティシステム導入',
    amount: 120000,
    category: 'IT',
    startDate: '2023-03-15',
    endDate: '2023-03-15', // 一回のみの支払い
    description: 'オフィスセキュリティシステム',
    isRecurring: false,
  },
];
