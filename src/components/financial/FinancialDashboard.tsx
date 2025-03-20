import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancial } from '@/context/FinancialContext';

const FinancialDashboard = () => {
  const { transactions } = useFinancial();

  // 集計データの計算
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCost = transactions.reduce((sum, t) => sum + t.cost, 0);
  const totalExpenses = transactions.reduce((sum, t) => sum + t.expenses, 0);
  const grossProfit = totalRevenue - totalCost;
  const operatingProfit = grossProfit - totalExpenses;

  // 利益率の計算
  const grossProfitMargin = totalRevenue > 0 
    ? (grossProfit / totalRevenue * 100).toFixed(1) 
    : '0.0';
  const operatingProfitMargin = totalRevenue > 0 
    ? (operatingProfit / totalRevenue * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">売上高</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()}円</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">粗利</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grossProfit.toLocaleString()}円</div>
            <p className="text-xs text-muted-foreground">
              粗利益率: {grossProfitMargin}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">営業利益</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operatingProfit.toLocaleString()}円</div>
            <p className="text-xs text-muted-foreground">
              営業利益率: {operatingProfitMargin}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">経費</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses.toLocaleString()}円</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;