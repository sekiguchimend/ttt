
export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  category: string;
  startDate: string;
  endDate?: string; // Optional end date if the cost is no longer applicable
  description?: string;
  isRecurring: boolean;
}

export interface MonthlyCostSummary {
  month: string; // YYYY-MM format
  totalAmount: number;
  categorySummary: {
    [category: string]: number;
  };
  costs: FixedCost[];
}

export interface FixedCostsContextType {
  costs: FixedCost[];
  monthlySummaries: MonthlyCostSummary[];
  addCost: (cost: Omit<FixedCost, 'id'>) => void;
  updateCost: (id: string, data: Partial<FixedCost>) => void;
  deleteCost: (id: string) => void;
  getCostById: (id: string) => FixedCost | undefined;
  getCostsByMonth: (month: string) => FixedCost[];
  getMonthlySummary: (month: string) => MonthlyCostSummary | undefined;
  loading: boolean;
}
