import React, { useState } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { useEmployee } from '@/context/EmployeeContext';
import { YearlySummary } from '@/types/financial';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface YearlyFinancialReportProps {
  startYear: number;
  endYear: number;
  onYearRangeChange?: (startYear: number, endYear: number) => void;
}

const YearlyFinancialReport: React.FC<YearlyFinancialReportProps> = ({ 
  startYear,
  endYear,
  onYearRangeChange
}) => {
  const { getYearlySummaries } = useFinancial();
  const { employees } = useEmployee();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  
  // Get yearly data
  const yearlySummaries = getYearlySummaries(startYear, endYear, {
    employeeId: selectedEmployeeId
  });
  
  // Format data for chart
  const chartData = yearlySummaries.map(summary => ({
    name: `${summary.year}年`,
    売上: summary.sales,
    粗利: summary.grossProfit,
    営業利益: summary.operatingProfit
  }));
  
  // Calculate total across all years
  const totalSales = yearlySummaries.reduce((sum, y) => sum + y.sales, 0);
  const totalCosts = yearlySummaries.reduce((sum, y) => sum + y.costs, 0);
  const totalExpenses = yearlySummaries.reduce((sum, y) => sum + y.expenses, 0);
  const totalGrossProfit = yearlySummaries.reduce((sum, y) => sum + y.grossProfit, 0);
  const totalOperatingProfit = yearlySummaries.reduce((sum, y) => sum + y.operatingProfit, 0);
  
  // Calculate percentages
  const avgGrossProfitMargin = totalSales > 0 
    ? (totalGrossProfit / totalSales * 100).toFixed(1) 
    : '0.0';
    
  const avgOperatingProfitMargin = totalSales > 0 
    ? (totalOperatingProfit / totalSales * 100).toFixed(1) 
    : '0.0';
  
  // Available years for selection
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium">期間:</label>
            <div className="flex items-center gap-2">
              <Select
                value={startYear.toString()}
                onValueChange={(value) => {
                  const newStartYear = parseInt(value);
                  onYearRangeChange?.(newStartYear, Math.max(newStartYear, endYear));
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="開始年" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => (
                    <SelectItem key={`start-${y}`} value={y.toString()}>{y}年</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span>～</span>
              
              <Select
                value={endYear.toString()}
                onValueChange={(value) => {
                  const newEndYear = parseInt(value);
                  onYearRangeChange?.(Math.min(startYear, newEndYear), newEndYear);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="終了年" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears
                    .filter(y => y >= startYear)
                    .map(y => (
                      <SelectItem key={`end-${y}`} value={y.toString()}>{y}年</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
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
              <h3 className="text-sm font-medium text-muted-foreground">期間合計売上</h3>
              <div className="text-2xl font-semibold">{totalSales.toLocaleString()}円</div>
            </div>
          </Card>
          
          <Card className="p-4 min-w-[150px]">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted-foreground">期間合計粗利</h3>
              <div className="text-2xl font-semibold">{totalGrossProfit.toLocaleString()}円</div>
              <div className="text-sm text-muted-foreground">平均利益率: {avgGrossProfitMargin}%</div>
            </div>
          </Card>
          
          <Card className="p-4 min-w-[150px]">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted-foreground">期間合計営業利益</h3>
              <div className="text-2xl font-semibold">{totalOperatingProfit.toLocaleString()}円</div>
              <div className="text-sm text-muted-foreground">平均利益率: {avgOperatingProfitMargin}%</div>
            </div>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{startYear}年～{endYear}年 年次財務レポート</CardTitle>
          <CardDescription>
            年ごとの売上、粗利、営業利益の推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()}円`} />
                <Legend />
                <Line type="monotone" dataKey="売上" stroke="#4f46e5" strokeWidth={2} />
                <Line type="monotone" dataKey="粗利" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="営業利益" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>年度</TableHead>
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
                {yearlySummaries.map((summary) => {
                  const grossProfitMargin = summary.sales > 0 
                    ? (summary.grossProfit / summary.sales * 100).toFixed(1) 
                    : '0.0';
                    
                  const operatingProfitMargin = summary.sales > 0 
                    ? (summary.operatingProfit / summary.sales * 100).toFixed(1) 
                    : '0.0';
                    
                  return (
                    <TableRow key={summary.year}>
                      <TableCell>{summary.year}年</TableCell>
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

export default YearlyFinancialReport;