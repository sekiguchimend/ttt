import React, { useState } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { useEmployee } from '@/context/EmployeeContext';
import { MonthlySummary } from '@/types/financial';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MonthlyFinancialReportProps {
  year: number;
  onYearChange?: (year: number) => void;
}

const MonthlyFinancialReport: React.FC<MonthlyFinancialReportProps> = ({ 
  year,
  onYearChange
}) => {
  const { getMonthlySummaries } = useFinancial();
  const { employees } = useEmployee();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  
  // Get monthly data
  const monthlySummaries = getMonthlySummaries(year, {
    employeeId: selectedEmployeeId
  });
  
  // Format data for chart
  const chartData = monthlySummaries.map(summary => ({
    name: `${summary.month}月`,
    売上: summary.sales,
    粗利: summary.grossProfit,
    営業利益: summary.operatingProfit
  }));
  
  // Calculate yearly totals
  const yearlyTotals = {
    sales: monthlySummaries.reduce((sum, m) => sum + m.sales, 0),
    costs: monthlySummaries.reduce((sum, m) => sum + m.costs, 0),
    expenses: monthlySummaries.reduce((sum, m) => sum + m.expenses, 0),
    grossProfit: monthlySummaries.reduce((sum, m) => sum + m.grossProfit, 0),
    operatingProfit: monthlySummaries.reduce((sum, m) => sum + m.operatingProfit, 0)
  };
  
  // Calculate percentages
  const grossProfitMargin = yearlyTotals.sales > 0 
    ? (yearlyTotals.grossProfit / yearlyTotals.sales * 100).toFixed(1) 
    : '0.0';
    
  const operatingProfitMargin = yearlyTotals.sales > 0 
    ? (yearlyTotals.operatingProfit / yearlyTotals.sales * 100).toFixed(1) 
    : '0.0';
  
  // Available years for selection (current year and 4 previous years)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  // Month names in Japanese
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月', 
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium">年度:</label>
            <Select
              value={year.toString()}
              onValueChange={(value) => onYearChange?.(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="年度を選択" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}年</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">担当者:</label>
            <Select
              value={selectedEmployeeId || ''}
              onValueChange={(value) => setSelectedEmployeeId(value || undefined)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="全担当者" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全担当者</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Card className="p-4 min-w-[150px]">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted-foreground">年間売上</h3>
              <div className="text-2xl font-semibold">{yearlyTotals.sales.toLocaleString()}円</div>
            </div>
          </Card>
          
          <Card className="p-4 min-w-[150px]">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted-foreground">年間粗利</h3>
              <div className="text-2xl font-semibold">{yearlyTotals.grossProfit.toLocaleString()}円</div>
              <div className="text-sm text-muted-foreground">利益率: {grossProfitMargin}%</div>
            </div>
          </Card>
          
          <Card className="p-4 min-w-[150px]">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted-foreground">年間営業利益</h3>
              <div className="text-2xl font-semibold">{yearlyTotals.operatingProfit.toLocaleString()}円</div>
              <div className="text-sm text-muted-foreground">利益率: {operatingProfitMargin}%</div>
            </div>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{year}年 月次財務レポート</CardTitle>
          <CardDescription>
            月ごとの売上、粗利、営業利益の推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()}円`} />
                <Legend />
                <Bar dataKey="売上" fill="#4f46e5" />
                <Bar dataKey="粗利" fill="#10b981" />
                <Bar dataKey="営業利益" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>月</TableHead>
                  <TableHead>売上</TableHead>
                  <TableHead>原価</TableHead>
                  <TableHead>粗利</TableHead>
                  <TableHead>粗利率</TableHead>
                  <TableHead>経費</TableHead>
                  <TableHead>営業利益</TableHead>
                  <TableHead>営業利益率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlySummaries.map((summary, index) => {
                  const grossProfitMargin = summary.sales > 0 
                    ? (summary.grossProfit / summary.sales * 100).toFixed(1) 
                    : '0.0';
                    
                  const operatingProfitMargin = summary.sales > 0 
                    ? (summary.operatingProfit / summary.sales * 100).toFixed(1) 
                    : '0.0';
                    
                  return (
                    <TableRow key={index}>
                      <TableCell>{monthNames[index]}</TableCell>
                      <TableCell>{summary.sales.toLocaleString()}円</TableCell>
                      <TableCell>{summary.costs.toLocaleString()}円</TableCell>
                      <TableCell>{summary.grossProfit.toLocaleString()}円</TableCell>
                      <TableCell>{grossProfitMargin}%</TableCell>
                      <TableCell>{summary.expenses.toLocaleString()}円</TableCell>
                      <TableCell>{summary.operatingProfit.toLocaleString()}円</TableCell>
                      <TableCell>{operatingProfitMargin}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyFinancialReport;