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
  updateTransaction: (transaction: FinancialTransaction) => void;
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
    operatingProfit: 0,
    monthlySummaries: []
  }),
  loading: true
});

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    // In a real app, this would be an API call
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setTransactions(SAMPLE_FINANCIAL_DATA);
      setLoading(false);
    };

    loadData();
  }, []);

  // Add a new transaction
  const addTransaction = (transaction: Omit<FinancialTransaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 9)
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  // Update an existing transaction
  const updateTransaction = (transaction: FinancialTransaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === transaction.id ? transaction : t)
    );
  };

  // Delete a transaction
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Helper function to filter transactions based on filters
  const filterTransactions = (transactions: FinancialTransaction[], filters?: FinancialReportFilters) => {
    if (!filters) return transactions;

    return transactions.filter(t => {
      // Filter by date range
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      
      // Filter by employee
      if (filters.employeeId && t.employeeId !== filters.employeeId) return false;
      
      // Filter by category
      if (filters.category && t.category !== filters.category) return false;
      
      return true;
    });
  };

  // Get monthly summaries for a specific year
  const getMonthlySummaries = (year: number, filters?: FinancialReportFilters): MonthlySummary[] => {
    const filteredTransactions = filterTransactions(transactions, filters);
    
    // Initialize monthly summaries
    const monthlySummaries: MonthlySummary[] = Array.from({ length: 12 }, (_, i) => ({
      year,
      month: i + 1,
      sales: 0,
      costs: 0,
      expenses: 0,
      grossProfit: 0,
      operatingProfit: 0
    }));
    
    // Calculate monthly totals
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const transactionYear = date.getFullYear();
      const month = date.getMonth(); // 0-11
      
      if (transactionYear === year) {
        monthlySummaries[month].sales += t.amount;
        monthlySummaries[month].costs += t.cost;
        monthlySummaries[month].expenses += t.expenses;
      }
    });
    
    // Calculate profits
    monthlySummaries.forEach(summary => {
      summary.grossProfit = summary.sales - summary.costs;
      summary.operatingProfit = summary.grossProfit - summary.expenses;
    });
    
    return monthlySummaries;
  };

  // Get yearly summaries for a range of years
  const getYearlySummaries = (startYear: number, endYear: number, filters?: FinancialReportFilters): YearlySummary[] => {
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    
    return years.map(year => {
      const monthlySummaries = getMonthlySummaries(year, filters);
      
      // Calculate yearly totals
      const yearlySummary: YearlySummary = {
        year,
        sales: monthlySummaries.reduce((sum, m) => sum + m.sales, 0),
        costs: monthlySummaries.reduce((sum, m) => sum + m.costs, 0),
        expenses: monthlySummaries.reduce((sum, m) => sum + m.expenses, 0),
        grossProfit: monthlySummaries.reduce((sum, m) => sum + m.grossProfit, 0),
        operatingProfit: monthlySummaries.reduce((sum, m) => sum + m.operatingProfit, 0),
        monthlySummaries
      };
      
      return yearlySummary;
    });
  };

  // Get current year summary
  const getCurrentYearSummary = (filters?: FinancialReportFilters): YearlySummary => {
    const currentYear = new Date().getFullYear();
    const yearlySummaries = getYearlySummaries(currentYear, currentYear, filters);
    return yearlySummaries[0];
  };

  return (
    <FinancialContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getMonthlySummaries,
      getYearlySummaries,
      getCurrentYearSummary,
      loading
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

// Custom hook for using financial context
export const useFinancial = () => useContext(FinancialContext);