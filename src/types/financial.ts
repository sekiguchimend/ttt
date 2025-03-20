// Financial data types for sales, gross profit, and operating profit reporting

export interface FinancialTransaction {
  id: string;
  date: string; // YYYY-MM-DD format
  clientName: string;
  amount: number;
  cost: number; // Cost of goods/services
  expenses: number; // Operating expenses
  employeeId: string;
  category: string;
  notes?: string;
}

export interface MonthlySummary {
  year: number;
  month: number; // 1-12
  sales: number;
  costs: number;
  expenses: number;
  grossProfit: number; // sales - costs
  operatingProfit: number; // grossProfit - expenses
}

export interface YearlySummary {
  year: number;
  sales: number;
  costs: number;
  expenses: number;
  grossProfit: number;
  operatingProfit: number;
  monthlySummaries: MonthlySummary[];
}

export interface FinancialReportFilters {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  category?: string;
}