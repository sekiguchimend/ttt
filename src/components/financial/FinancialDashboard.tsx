import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthlyFinancialReport from './MonthlyFinancialReport';
import YearlyFinancialReport from './YearlyFinancialReport';

const FinancialDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("monthly");
  
  // State for year selection in monthly report
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // State for year range selection in yearly report
  const [yearRange, setYearRange] = useState<{start: number, end: number}>({
    start: currentYear - 4,
    end: currentYear
  });
  
  // If not admin, show access denied message
  if (!isAdmin) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>アクセス制限</CardTitle>
          <CardDescription>
            財務レポートは管理者のみがアクセスできます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-medium mb-2">アクセス権限がありません</h3>
              <p className="text-muted-foreground">
                この機能を利用するには管理者権限が必要です。
                <br />
                詳細は管理者にお問い合わせください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>財務レポート</CardTitle>
          <CardDescription>
            売上、粗利、営業利益の詳細分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly">月次レポート</TabsTrigger>
              <TabsTrigger value="yearly">年次レポート</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly" className="pt-6">
              <MonthlyFinancialReport 
                year={selectedYear}
                onYearChange={setSelectedYear}
              />
            </TabsContent>
            
            <TabsContent value="yearly" className="pt-6">
              <YearlyFinancialReport 
                startYear={yearRange.start}
                endYear={yearRange.end}
                onYearRangeChange={(start, end) => setYearRange({ start, end })}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;