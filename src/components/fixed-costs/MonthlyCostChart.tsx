
import React, { useMemo } from 'react';
import { useFixedCosts } from '@/context/FixedCostsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const MonthlyCostChart: React.FC = () => {
  const { monthlySummaries } = useFixedCosts();
  
  // Create data for the chart
  const chartData = useMemo(() => {
    return [...monthlySummaries]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(summary => {
        const [year, month] = summary.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: format(date, 'yyyy年MM月', { locale: ja }),
          total: summary.totalAmount,
          ...summary.categorySummary
        };
      });
  }, [monthlySummaries]);
  
  // Get all unique categories from all months
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    monthlySummaries.forEach(summary => {
      Object.keys(summary.categorySummary).forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }, [monthlySummaries]);
  
  // Define colors for each category
  const categoryColors = {
    '不動産': '#8884d8',
    'ユーティリティ': '#82ca9d',
    'IT': '#ffc658',
    '保険': '#ff8042',
    '通信': '#0088fe',
    'オフィス用品': '#00c49f',
    'サブスクリプション': '#ffbb28',
    '税金': '#ff8042',
    'その他': '#a4de6c',
  };
  
  // Calculate month-over-month changes
  const monthlyChanges = useMemo(() => {
    if (chartData.length < 2) return [];
    
    const changes = [];
    for (let i = 1; i < chartData.length; i++) {
      const currentMonth = chartData[i];
      const previousMonth = chartData[i - 1];
      const change = currentMonth.total - previousMonth.total;
      const changePercent = ((change / previousMonth.total) * 100).toFixed(1);
      
      changes.push({
        month: currentMonth.month,
        change,
        changePercent,
      });
    }
    
    return changes;
  }, [chartData]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-bold">{label}</p>
          <div className="space-y-1">
            {payload.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3" 
                  style={{ backgroundColor: entry.color as string }}
                />
                <span className="text-sm">{entry.name}: {(entry.value as number).toLocaleString()}円</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>月次固定費の推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 30, bottom: 65 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ bottom: 0 }} />
                {allCategories.map((category) => (
                  <Bar 
                    key={category}
                    dataKey={category}
                    stackId="a"
                    name={category}
                    fill={categoryColors[category as keyof typeof categoryColors] || '#8884d8'}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {monthlyChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>月次変動状況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">月</th>
                    <th className="p-2 text-right">前月比 (円)</th>
                    <th className="p-2 text-right">変動率</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyChanges.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.month}</td>
                      <td className={`p-2 text-right ${item.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.change > 0 ? '+' : ''}{item.change.toLocaleString()}円
                      </td>
                      <td className={`p-2 text-right ${item.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.change > 0 ? '+' : ''}{item.changePercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
