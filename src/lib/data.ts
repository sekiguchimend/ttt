
// Sales Module Data
export const salesData = {
  kpis: [
    { 
      id: 'sales-kpi-1',
      title: '今月の売上',
      value: 12850000,
      previousValue: 11200000,
      format: 'currency',
      targetValue: 15000000,
      description: '先月比 +14.7%',
    },
    { 
      id: 'sales-kpi-2',
      title: '商談数',
      value: 28,
      previousValue: 24,
      targetValue: 35,
      description: '先月比 +16.7%',
    },
    { 
      id: 'sales-kpi-3',
      title: '成約率',
      value: 42.5,
      previousValue: 38.9,
      format: 'percentage',
      description: '先月比 +3.6%',
    },
    { 
      id: 'sales-kpi-4',
      title: '顧客訪問回数',
      value: 56,
      previousValue: 51,
      targetValue: 60,
      description: '目標達成率 93.3%',
    }
  ],
  recentDeals: [
    { 
      id: 'd1', 
      company: '株式会社テクノロジーパートナーズ', 
      amount: 3500000, 
      status: 'closed', 
      date: '2023-06-01',
      probability: 100,
      representative: '田中 健太',
    },
    { 
      id: 'd2', 
      company: 'グローバルソリューションズ株式会社', 
      amount: 2800000, 
      status: 'negotiation', 
      date: '2023-06-05',
      probability: 75,
      representative: '鈴木 一郎',
    },
    { 
      id: 'd3', 
      company: '株式会社イノベーションラボ', 
      amount: 4200000, 
      status: 'proposal', 
      date: '2023-06-10',
      probability: 50,
      representative: '佐藤 優子',
    },
    { 
      id: 'd4', 
      company: 'デジタルフューチャー株式会社', 
      amount: 1800000, 
      status: 'initial', 
      date: '2023-06-15',
      probability: 25,
      representative: '高橋 直樹',
    },
  ],
  salesForecast: [
    { month: '1月', target: 10000000, actual: 11200000 },
    { month: '2月', target: 12000000, actual: 10500000 },
    { month: '3月', target: 11000000, actual: 12700000 },
    { month: '4月', target: 13000000, actual: 12800000 },
    { month: '5月', target: 12500000, actual: 11200000 },
    { month: '6月', target: 15000000, actual: 12850000 },
    { month: '7月', target: 14000000, actual: 0 },
    { month: '8月', target: 13500000, actual: 0 },
    { month: '9月', target: 15500000, actual: 0 },
    { month: '10月', target: 16000000, actual: 0 },
    { month: '11月', target: 14500000, actual: 0 },
    { month: '12月', target: 18000000, actual: 0 },
  ]
};

// Recruitment Module Data
export const recruitmentData = {
  kpis: [
    { 
      id: 'recruitment-kpi-1',
      title: '今月の応募者数',
      value: 42,
      previousValue: 35,
      targetValue: 50,
      description: '先月比 +20%',
    },
    { 
      id: 'recruitment-kpi-2',
      title: '面接実施数',
      value: 28,
      previousValue: 22,
      targetValue: 35,
      description: '先月比 +27.3%',
    },
    { 
      id: 'recruitment-kpi-3',
      title: '内定承諾率',
      value: 68.2,
      previousValue: 72.7,
      format: 'percentage',
      description: '先月比 -4.5%',
      trend: 'down',
    },
    { 
      id: 'recruitment-kpi-4',
      title: '平均採用コスト',
      value: 350000,
      previousValue: 380000,
      format: 'currency',
      description: '先月比 -7.9%',
      trend: 'up',
    }
  ],
  recruitmentStages: [
    { stage: '応募', count: 42 },
    { stage: '書類選考', count: 35 },
    { stage: '一次面接', count: 28 },
    { stage: '二次面接', count: 15 },
    { stage: '最終面接', count: 8 },
    { stage: '内定', count: 5 },
    { stage: '入社', count: 3 },
  ],
  candidatesByDepartment: [
    { department: '営業', count: 15 },
    { department: 'エンジニア', count: 18 },
    { department: 'マーケティング', count: 6 },
    { department: '人事', count: 3 },
  ]
};

// HR/Payroll Module Data
export const hrData = {
  kpis: [
    { 
      id: 'hr-kpi-1',
      title: '従業員数',
      value: 128,
      previousValue: 123,
      description: '先月比 +4.1%',
    },
    { 
      id: 'hr-kpi-2',
      title: '離職率',
      value: 2.3,
      previousValue: 3.1,
      format: 'percentage',
      description: '先月比 -0.8%',
      trend: 'up',
    },
    { 
      id: 'hr-kpi-3',
      title: '平均勤続年数',
      value: 3.7,
      previousValue: 3.5,
      suffix: '年',
      description: '先月比 +5.7%',
    },
    { 
      id: 'hr-kpi-4',
      title: '研修参加率',
      value: 85.2,
      previousValue: 82.8,
      format: 'percentage',
      description: '先月比 +2.4%',
    }
  ],
  departmentDistribution: [
    { department: '営業', count: 42 },
    { department: 'エンジニア', count: 35 },
    { department: 'マーケティング', count: 15 },
    { department: '人事', count: 8 },
    { department: '管理', count: 12 },
    { department: '財務', count: 10 },
    { department: 'その他', count: 6 },
  ],
  ageDistribution: [
    { range: '20-25', count: 25 },
    { range: '26-30', count: 38 },
    { range: '31-35', count: 32 },
    { range: '36-40', count: 18 },
    { range: '41-45', count: 9 },
    { range: '46-50', count: 4 },
    { range: '51+', count: 2 },
  ]
};

// Fixed Costs Module Data
export const fixedCostsData = {
  kpis: [
    { 
      id: 'fixed-costs-kpi-1',
      title: '今月の固定費',
      value: 7850000,
      previousValue: 7680000,
      format: 'currency',
      description: '先月比 +2.2%',
      trend: 'down',
    },
    { 
      id: 'fixed-costs-kpi-2',
      title: '固定費率',
      value: 58.4,
      previousValue: 62.1,
      format: 'percentage',
      description: '先月比 -3.7%',
      trend: 'up',
    },
    { 
      id: 'fixed-costs-kpi-3',
      title: '売上に対する固定費比率',
      value: 61.1,
      previousValue: 68.6,
      format: 'percentage',
      description: '先月比 -7.5%',
      trend: 'up',
    },
    { 
      id: 'fixed-costs-kpi-4',
      title: '年間予測固定費',
      value: 96400000,
      previousValue: 94800000,
      format: 'currency',
      description: '前年比 +1.7%',
      trend: 'neutral',
    }
  ],
  costBreakdown: [
    { category: '人件費', amount: 4850000 },
    { category: 'オフィス賃料', amount: 1250000 },
    { category: 'SaaSツール', amount: 750000 },
    { category: '水道光熱費', amount: 320000 },
    { category: '保険', amount: 280000 },
    { category: 'その他', amount: 400000 },
  ],
  historicalCosts: [
    { month: '1月', amount: 7450000 },
    { month: '2月', amount: 7520000 },
    { month: '3月', amount: 7610000 },
    { month: '4月', amount: 7580000 },
    { month: '5月', amount: 7680000 },
    { month: '6月', amount: 7850000 },
  ]
};

// KPI Management Module Data
export const kpiManagementData = {
  kpis: [
    { 
      id: 'kpi-management-kpi-1',
      title: 'マイルストーン達成率',
      value: 87.5,
      previousValue: 82.3,
      format: 'percentage',
      targetValue: 90,
      description: '先月比 +5.2%',
    },
    { 
      id: 'kpi-management-kpi-2',
      title: 'リスク対策完了率',
      value: 92.3,
      previousValue: 88.7,
      format: 'percentage',
      targetValue: 95,
      description: '先月比 +3.6%',
    },
    { 
      id: 'kpi-management-kpi-3',
      title: '改善策実施率',
      value: 76.8,
      previousValue: 71.2,
      format: 'percentage',
      targetValue: 80,
      description: '先月比 +5.6%',
    },
    { 
      id: 'kpi-management-kpi-4',
      title: 'プロジェクト完了率',
      value: 94.2,
      previousValue: 90.8,
      format: 'percentage',
      targetValue: 95,
      description: '先月比 +3.4%',
    }
  ],
  projectStatuses: [
    { status: '順調', count: 12 },
    { status: '要注意', count: 5 },
    { status: '危険', count: 2 },
  ],
  riskManagement: [
    { risk: '納期遅延', probability: 'medium', impact: 'high', status: 'monitoring' },
    { risk: '品質問題', probability: 'low', impact: 'high', status: 'resolved' },
    { risk: 'コスト超過', probability: 'high', impact: 'medium', status: 'action_required' },
    { risk: 'リソース不足', probability: 'medium', impact: 'medium', status: 'monitoring' },
  ]
};

// Dashboard Data
export const dashboardData = {
  overview: [
    { 
      id: 'dashboard-kpi-1',
      title: '月間売上',
      value: 12850000,
      previousValue: 11200000,
      format: 'currency',
      targetValue: 15000000,
      description: '目標まで ¥2,150,000',
    },
    { 
      id: 'dashboard-kpi-2',
      title: '固定費率',
      value: 61.1,
      previousValue: 68.6,
      format: 'percentage',
      description: '先月比 -7.5%',
      trend: 'up',
    },
    { 
      id: 'dashboard-kpi-3',
      title: '採用進捗',
      value: 68,
      previousValue: 55,
      format: 'percentage',
      targetValue: 100,
      description: '目標まで 32%',
    },
    { 
      id: 'dashboard-kpi-4',
      title: 'プロジェクト完了率',
      value: 94.2,
      previousValue: 90.8,
      format: 'percentage',
      targetValue: 95,
      description: '目標まで 0.8%',
    }
  ],
  modules: [
    {
      title: '営業',
      description: '営業活動の進捗管理と分析',
      metrics: [
        { label: '今月の売上', value: '¥12.85M' },
        { label: '成約率', value: '42.5%' }
      ]
    },
    {
      title: '採用',
      description: '採用活動の追跡と候補者管理',
      metrics: [
        { label: '応募者数', value: '42' },
        { label: '内定承諾率', value: '68.2%' }
      ]
    },
    {
      title: '人事・給与',
      description: '従業員情報と給与管理',
      metrics: [
        { label: '従業員数', value: '128' },
        { label: '離職率', value: '2.3%' }
      ]
    },
    {
      title: '固定費管理',
      description: '固定費の分析と最適化',
      metrics: [
        { label: '今月の固定費', value: '¥7.85M' },
        { label: '固定費率', value: '58.4%' }
      ]
    },
    {
      title: 'KPI管理',
      description: 'ビジネス指標とパフォーマンス追跡',
      metrics: [
        { label: 'マイルストーン達成率', value: '87.5%' },
        { label: 'リスク対策完了率', value: '92.3%' }
      ]
    }
  ]
};
