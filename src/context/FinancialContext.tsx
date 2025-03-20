import React, { createContext, useContext, useState, useEffect } from 'react';
import { FinancialTransaction, MonthlySummary, YearlySummary, FinancialReportFilters } from '@/types/financial';

// Sample financial data for demonstration
const SAMPLE_FINANCIAL_DATA: FinancialTransaction[] = [
  {
    id: '1',
    date: '2023-01-15',
    clientName: '株式会社ABC',
    amount: 500000,
    cost: 300000,
    expenses: 50000,
    employeeId: '1',
    category: 'ウェブ開発',
    notes: 'ウェブサイトリニューアル案件'
  },
  {
    id: '2',
    date: '2023-02-10',
    clientName: '株式会社DEF',
    amount: 300000,
    cost: 150000,
    expenses: 30000,
    employeeId: '2',
    category: 'コンサルティング',
    notes: 'マーケティング戦略コンサルティング'
  },
  {
    id: '3',
    date: '2023-02-25',
    clientName: '株式会社GHI',
    amount: 1200000,
    cost: 700000,
    expenses: 100000,
    employeeId: '2',
    category: 'アプリ開発',
    notes: 'モバイルアプリ開発案件'
  },
  {
    id: '4',
    date: '2023-03-05',
    clientName: '株式会社JKL',
    amount: 800000,
    cost: 450000,
    expenses: 80000,
    employeeId: '1',
    category: 'ウェブ開発',
    notes: 'ECサイト構築案件'
  },
  {
    id: '5',
    date: '2023-03-20',
    clientName: '株式会社MNO',
    amount: 600000,
    cost: 350000,
    expenses: 60000,
    employeeId: '1',
    category: 'デザイン',
    notes: 'ブランディングデザイン案件'
  },
  {
    id: '6',
    date: '2023-04-10',
    clientName: '株式会社PQR',
    amount: 400000,
    cost: 200000,
    expenses: 40000,
    employeeId: '2',
    category: 'コンサルティング',
    notes: 'ビジネス戦略コンサルティング'
  },
  {
    id: '7',
    date: '2023-05-15',
    clientName: '株式会社STU',
    amount: 900000,
    cost: 500000,
    expenses: 90000,
    employeeId: '1',
    category: 'アプリ開発',
    notes: 'ウェブアプリケーション開発'
  },
  {
    id: '8',
    date: '2023-06-20',
    clientName: '株式会社VWX',
    amount: 700000,
    cost: 400000,
    expenses: 70000,
    employeeId: '2',
    category: 'ウェブ開発',
    notes: 'コーポレートサイト制作'
  }
];

// Context interface
interface FinancialContextType {
  transactions: FinancialTransaction[];
  addTransaction: (transaction: Omit<FinancialTransaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  getMonthlySummaries: (year: number, filters?: FinancialReportFilters) => MonthlySummary[];
  getYearlySummaries: (startYear: number, endYear: number, filters?: FinancialReportFilters) => YearlySummary[];
  getCurrentYearSummary: (filters?: FinancialReportFilters) => YearlySummary;
  loading: boolean;
}

// Create context with default values
const FinancialContext = createContext<FinancialContextType>({
  transactions: [],
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  getMonthlySummaries: () => [],
  getYearlySummaries: () => [],
  getCurrentYearSummary: () => ({
    year: new Date().getFullYear(),
    sales: 0,
    costs: 0,
    expenses: 0,
    grossProfit: 0,
    operatingProfit: 0
  }),
  loading: false
});

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(SAMPLE_FINANCIAL_DATA);
  const [loading, setLoading] = useState(false);

  // 取引の追加
  const addTransaction = (transaction: Omit<FinancialTransaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 9)
    };
    setTransactions([...transactions, newTransaction]);
  };

  // 取引の更新
  const updateTransaction = (id: string, transaction: Partial<FinancialTransaction>) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, ...transaction } : t
    ));
  };

  // 取引の削除
  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // 月次サマリーの取得
  const getMonthlySummaries = (year: number, filters?: FinancialReportFilters): MonthlySummary[] => {
    const filteredTransactions = filters?.employeeId
      ? transactions.filter(t => t.employeeId === filters.employeeId)
      : transactions;

    return Array.from({ length: 12 }, (_, month) => {
      const monthTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
      });

      const sales = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const costs = monthTransactions.reduce((sum, t) => sum + t.cost, 0);
      const expenses = monthTransactions.reduce((sum, t) => sum + t.expenses, 0);
      const grossProfit = sales - costs;
      const operatingProfit = grossProfit - expenses;

      return {
        year,
        month: month + 1, // 1-12の範囲に変換
        sales,
        costs,
        expenses,
        grossProfit,
        operatingProfit
      };
    });
  };

  // 年次サマリーの取得
  const getYearlySummaries = (startYear: number, endYear: number, filters?: FinancialReportFilters): YearlySummary[] => {
    const filteredTransactions = filters?.employeeId
      ? transactions.filter(t => t.employeeId === filters.employeeId)
      : transactions;

    return Array.from({ length: endYear - startYear + 1 }, (_, index) => {
      const year = startYear + index;
      const yearTransactions = filteredTransactions.filter(t => 
        new Date(t.date).getFullYear() === year
      );

      const sales = yearTransactions.reduce((sum, t) => sum + t.amount, 0);
      const costs = yearTransactions.reduce((sum, t) => sum + t.cost, 0);
      const expenses = yearTransactions.reduce((sum, t) => sum + t.expenses, 0);
      const grossProfit = sales - costs;
      const operatingProfit = grossProfit - expenses;

      return {
        year,
        sales,
        costs,
        expenses,
        grossProfit,
        operatingProfit,
        monthlySummaries: getMonthlySummaries(year, filters)
      };
    });
  };

  // 現在の年のサマリーを取得
  const getCurrentYearSummary = (filters?: FinancialReportFilters): YearlySummary => {
    const currentYear = new Date().getFullYear();
    const summaries = getYearlySummaries(currentYear, currentYear, filters);
    return {
      ...summaries[0],
      monthlySummaries: getMonthlySummaries(currentYear, filters)
    };
  };

  const value = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlySummaries,
    getYearlySummaries,
    getCurrentYearSummary,
    loading
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

// Custom hook for using financial context
export const useFinancial = () => useContext(FinancialContext);