import React, { useState } from 'react';
import { useKpi } from '@/context/KpiContext';
import { useAuth } from '@/context/AuthContext';
import { KpiMetric, KPI_CATEGORIES } from '@/types/kpi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCalendarView } from './KpiCalendarView';
import { KpiTableView } from './KpiTableView';
import { KpiOverview } from './KpiOverview';
import { Badge } from '@/components/ui/badge';

interface KpiEmployeeDashboardProps {
  openAddDialog?: () => void;
}

export const KpiEmployeeDashboard: React.FC<KpiEmployeeDashboardProps> = ({
  openAddDialog = () => {}
}) => {
  const { user } = useAuth();
  const { userKpis } = useKpi();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // KPIの達成状況を計算
  const calculateKpiProgress = () => {
    if (!userKpis.length) return { total: 0, completed: 0, percentage: 0 };
    
    const completed = userKpis.filter(kpi => kpi.value >= kpi.standardTarget).length;
    return {
      total: userKpis.length,
      completed,
      percentage: Math.round((completed / userKpis.length) * 100)
    };
  };

  // カテゴリごとのKPI達成状況を計算
  const calculateCategoryProgress = () => {
    const categoryStats: Record<string, { total: number, completed: number, percentage: number }> = {};
    
    KPI_CATEGORIES.forEach(category => {
      const categoryKpis = userKpis.filter(kpi => kpi.category === category.value);
      if (categoryKpis.length) {
        const completed = categoryKpis.filter(kpi => kpi.value >= kpi.standardTarget).length;
        categoryStats[category.value] = {
          total: categoryKpis.length,
          completed,
          percentage: Math.round((completed / categoryKpis.length) * 100)
        };
      }
    });
    
    return categoryStats;
  };

  const progress = calculateKpiProgress();
  const categoryProgress = calculateCategoryProgress();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KPI管理</CardTitle>
          <CardDescription>
            あなたのKPI達成状況と目標管理
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">総合達成率</h3>
                <div className="text-2xl font-semibold">{progress.percentage}%</div>
                <div className="text-sm text-muted-foreground">
                  {progress.completed}/{progress.total} KPI達成
                </div>
                <div className="mt-2">
                  <div className="h-2 w-full bg-muted rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        progress.percentage >= 80 ? "bg-green-500" : 
                        progress.percentage >= 50 ? "bg-yellow-500" : 
                        "bg-red-500"
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            {Object.entries(categoryProgress).map(([category, stats]) => (
              <Card key={category} className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {KPI_CATEGORIES.find(c => c.value === category)?.label}
                    </h3>
                    <Badge variant="outline">
                      {stats.total}個
                    </Badge>
                  </div>
                  <div className="text-2xl font-semibold">{stats.percentage}%</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.completed}/{stats.total} KPI達成
                  </div>
                  <div className="mt-2">
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          stats.percentage >= 80 ? "bg-green-500" : 
                          stats.percentage >= 50 ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="table">テーブル</TabsTrigger>
              <TabsTrigger value="calendar">カレンダー</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-6">
              <KpiOverview 
                openAddDialog={openAddDialog}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                setActiveTab={setActiveTab}
              />
            </TabsContent>
            
            <TabsContent value="table" className="pt-6">
              <KpiTableView 
                startDate={new Date(2025, 2, 1)} // 2025年3月1日
                endDate={new Date(2030, 11, 31)} // 2030年12月31日
              />
            </TabsContent>
            
            <TabsContent value="calendar" className="pt-6">
              <KpiCalendarView 
                startDate={new Date(2025, 2, 1)} // 2025年3月1日
                endDate={new Date(2030, 11, 31)} // 2030年12月31日
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};