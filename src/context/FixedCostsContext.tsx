
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FixedCost, MonthlyCostSummary, FixedCostsContextType } from '@/types/fixed-costs';
import { SAMPLE_FIXED_COSTS } from '@/data/sample-fixed-costs';
import { useFixedCostsUtils } from '@/hooks/use-fixed-costs-utils';

const FixedCostsContext = createContext<FixedCostsContextType>({
  costs: [],
  monthlySummaries: [],
  addCost: () => {},
  updateCost: () => {},
  deleteCost: () => {},
  getCostById: () => undefined,
  getCostsByMonth: () => [],
  getMonthlySummary: () => undefined,
  loading: false,
});

export const FixedCostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [costs, setCosts] = useState<FixedCost[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlyCostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getCostById, getCostsByMonth, calculateMonthlySummaries, getMonthlySummary } = useFixedCostsUtils();
  
  // Load sample data
  useEffect(() => {
    const storedCosts = localStorage.getItem('erp_fixed_costs');
    
    if (storedCosts) {
      setCosts(JSON.parse(storedCosts));
    } else {
      setCosts(SAMPLE_FIXED_COSTS);
      localStorage.setItem('erp_fixed_costs', JSON.stringify(SAMPLE_FIXED_COSTS));
    }
    
    setLoading(false);
  }, []);
  
  // Save data when it changes
  useEffect(() => {
    if (costs.length > 0) {
      localStorage.setItem('erp_fixed_costs', JSON.stringify(costs));
    }
  }, [costs]);
  
  // Calculate monthly summaries
  useEffect(() => {
    if (costs.length === 0) return;
    const summaries = calculateMonthlySummaries(costs);
    setMonthlySummaries(summaries);
  }, [costs, calculateMonthlySummaries]);
  
  // CRUD functions
  const addCost = (cost: Omit<FixedCost, 'id'>) => {
    const newCost: FixedCost = {
      ...cost,
      id: Date.now().toString(),
    };
    setCosts(prev => [...prev, newCost]);
    toast({
      title: "固定費追加完了",
      description: `${cost.name}を追加しました`,
    });
  };
  
  const updateCost = (id: string, data: Partial<FixedCost>) => {
    setCosts(prev => 
      prev.map(cost => 
        cost.id === id ? { ...cost, ...data } : cost
      )
    );
    toast({
      title: "固定費更新完了",
      description: "固定費情報を更新しました",
    });
  };
  
  const deleteCost = (id: string) => {
    setCosts(prev => prev.filter(cost => cost.id !== id));
    toast({
      title: "固定費削除完了",
      description: "固定費を削除しました",
    });
  };
  
  return (
    <FixedCostsContext.Provider value={{
      costs,
      monthlySummaries,
      addCost,
      updateCost,
      deleteCost,
      getCostById: (id) => getCostById(costs, id),
      getCostsByMonth: (month) => getCostsByMonth(costs, month),
      getMonthlySummary: (month) => getMonthlySummary(monthlySummaries, month),
      loading
    }}>
      {children}
    </FixedCostsContext.Provider>
  );
};

export const useFixedCosts = () => useContext(FixedCostsContext);
