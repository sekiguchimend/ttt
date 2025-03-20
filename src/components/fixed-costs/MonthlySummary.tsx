
import React, { useState } from 'react';
import { useFixedCosts } from '@/context/FixedCostsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiCard } from '@/components/ui/KpiCard';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const MonthlySummary: React.FC = () => {
  const { monthlySummaries } = useFixedCosts();
  
  // Get current month in YYYY-MM format for default selection
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Get summary for selected month
  const summary = monthlySummaries.find(s => s.month === selectedMonth);
  
  // Get previous month's summary for comparison
  const [year, month] = selectedMonth.split('-').map(Number);
  const prevMonth = month === 1 
    ? `${year - 1}-12` 
    : `${year}-${String(month - 1).padStart(2, '0')}`;
  
  const prevSummary = monthlySummaries.find(s => s.month === prevMonth);
  
  // Format month for display
  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return format(new Date(year, month - 1), 'yyyy年MM月', { locale: ja });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-semibold">月次サマリー</h2>
        <div className="w-full max-w-xs">
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger>
              <SelectValue placeholder="月を選択" />
            </SelectTrigger>
            <SelectContent>
              {monthlySummaries.map((summary) => (
                <SelectItem key={summary.month} value={summary.month}>
                  {formatMonthDisplay(summary.month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              title="今月の固定費総額"
              value={summary.totalAmount}
              previousValue={prevSummary?.totalAmount}
              format="currency"
              description={formatMonthDisplay(summary.month)}
              trend={prevSummary && summary.totalAmount > prevSummary.totalAmount ? 'down' : 'up'}
              color={prevSummary && summary.totalAmount > prevSummary.totalAmount ? 'danger' : 'success'}
            />
            
            <KpiCard
              title="カテゴリー数"
              value={Object.keys(summary.categorySummary).length}
              format="number"
              description="固定費のカテゴリー数"
            />
            
            <KpiCard
              title="最大カテゴリ支出"
              value={Math.max(...Object.values(summary.categorySummary))}
              format="currency"
              description={`最も支出が多いカテゴリ: ${
                Object.entries(summary.categorySummary).reduce(
                  (max, [cat, val]) => val > max[1] ? [cat, val] : max, 
                  ['', 0]
                )[0]
              }`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>カテゴリー別内訳</CardTitle>
              <CardDescription>
                {formatMonthDisplay(summary.month)}の固定費をカテゴリー別に表示
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.categorySummary)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = ((amount / summary.totalAmount) * 100).toFixed(1);
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span>{amount.toLocaleString()}円 ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-4">
            <p className="text-center text-muted-foreground">
              選択した月のデータがありません
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
