
import { FixedCost, MonthlyCostSummary } from "@/types/fixed-costs";

export const useFixedCostsUtils = () => {
  // Helper function to get a cost by ID
  const getCostById = (costs: FixedCost[], id: string) => {
    return costs.find(cost => cost.id === id);
  };
  
  // Helper function to get costs for a specific month
  const getCostsByMonth = (costs: FixedCost[], month: string) => {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of the month
    
    return costs.filter(cost => {
      const costStartDate = new Date(cost.startDate);
      const costEndDate = cost.endDate ? new Date(cost.endDate) : new Date(2100, 0, 1); // Far future if no end date
      
      // One-time cost in this month
      if (!cost.isRecurring) {
        return costStartDate >= startDate && costStartDate <= endDate;
      }
      
      // Recurring cost that started before or during this month and ended after or during this month
      return costStartDate <= endDate && costEndDate >= startDate;
    });
  };

  // Helper function to calculate monthly summaries
  const calculateMonthlySummaries = (costs: FixedCost[]): MonthlyCostSummary[] => {
    if (costs.length === 0) return [];
    
    // Get a range of 12 months from the current month backwards
    const now = new Date();
    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(month);
    }
    
    // Calculate summary for each month
    return months.map(month => {
      const monthlyCosts = getCostsByMonth(costs, month);
      
      // Calculate total amount
      const totalAmount = monthlyCosts.reduce((acc, cost) => acc + cost.amount, 0);
      
      // Calculate category summary
      const categorySummary: {[category: string]: number} = {};
      monthlyCosts.forEach(cost => {
        if (!categorySummary[cost.category]) {
          categorySummary[cost.category] = 0;
        }
        categorySummary[cost.category] += cost.amount;
      });
      
      return {
        month,
        totalAmount,
        categorySummary,
        costs: monthlyCosts,
      };
    });
  };
  
  // Helper function to get a monthly summary
  const getMonthlySummary = (monthlySummaries: MonthlyCostSummary[], month: string) => {
    return monthlySummaries.find(summary => summary.month === month);
  };

  return {
    getCostById,
    getCostsByMonth,
    calculateMonthlySummaries,
    getMonthlySummary
  };
};
