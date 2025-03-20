import React, { useState, useMemo, useEffect } from 'react';
import { useKpi } from '@/context/KpiContext';
import { useAuth } from '@/context/AuthContext';
import { KpiMetric, KpiCategory, KPI_CATEGORIES } from '@/types/kpi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiTableView } from './KpiTableView';
import { KpiOverview } from './KpiOverview';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORY_LABELS: Record<KpiCategory, string> = {
  sales: '営業',
  development: '開発'
};

interface KpiEmployeeDashboardProps {
  openAddDialog?: () => void;
}

export const KpiEmployeeDashboard: React.FC<KpiEmployeeDashboardProps> = ({
  openAddDialog = () => {}
}) => {
  const { user } = useAuth();
  const { metrics, fetchMetrics } = useKpi();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyAchievements, setMonthlyAchievements] = useState<Record<string, { total: number, achievedDays: number, daysRecorded: number }>>({});

  // 月初と月末の日付を取得
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  // 表示するユーザーID
  const targetUserId = selectedUserId || user?.id || '';

  // ユーザーのKPIを取得
  const userKpis = useMemo(() => {
    if (!targetUserId || !metrics) return [];
    return metrics.filter(kpi => kpi.userId === targetUserId);
  }, [targetUserId, metrics]);

  // 月間の実績データをロード
  const loadMonthlyAchievements = async () => {
    if (!user || userKpis.length === 0) return;
    
    setIsLoading(true);
    try {
      const startDateStr = format(monthStart, 'yyyy-MM-dd');
      const endDateStr = format(monthEnd, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('daily_kpi_achievements')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .in('kpi_id', userKpis.map(kpi => kpi.id));
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const achievements = {};
        
        data.forEach(item => {
          if (!achievements[item.kpi_id]) {
            achievements[item.kpi_id] = {
              total: 0,
              achievedDays: 0,
              daysRecorded: 0
            };
          }
          
          achievements[item.kpi_id].total += parseFloat(item.actual_value);
          achievements[item.kpi_id].daysRecorded++;
          if (item.is_achieved) {
            achievements[item.kpi_id].achievedDays++;
          }
        });
        
        setMonthlyAchievements(achievements);
      } else {
        setMonthlyAchievements({});
      }
    } catch (error) {
      console.error('Error loading monthly achievements:', error);
      toast({
        title: "エラー",
        description: "月間実績データの読み込みに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 月間集計を更新する関数
  const updateMonthlyAchievements = async () => {
    if (!user || userKpis.length === 0) return;
    
    setIsLoading(true);
    try {
      // 月間集計の更新
      const summaryUpdates = Object.entries(monthlyAchievements).map(([kpiId, summary]) => {
        const kpi = userKpis.find(k => k.id === kpiId);
        return {
          id: kpiId,
          value: summary.total,
          updated_at: new Date().toISOString()
        };
      });
      
      if (summaryUpdates.length > 0) {
        const { error } = await supabase
          .from('kpi_metrics')
          .upsert(summaryUpdates, { 
            onConflict: 'id'
          });
          
        if (error) throw error;
        
        // メトリクスを再取得
        await fetchMetrics();
        
        toast({
          title: "成功",
          description: "KPI実績を更新しました。",
        });
      }
    } catch (error) {
      console.error('Error updating monthly achievements:', error);
      toast({
        title: "エラー",
        description: "KPI実績の更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザーIDやカレンダー月が変わったときにデータをロード
  useEffect(() => {
    loadMonthlyAchievements();
  }, [targetUserId, monthStart, monthEnd, userKpis]);

  // KPIの達成状況を計算
  const calculateKpiProgress = () => {
    if (!userKpis.length) return { total: 0, completed: 0, percentage: 0 };
    
    let completed = 0;
    userKpis.forEach(kpi => {
      // 月間実績データがあれば使用
      const monthlyData = monthlyAchievements[kpi.id];
      const actualValue = monthlyData ? monthlyData.total : kpi.value || 0;
      
      if (actualValue >= kpi.standardTarget) {
        completed++;
      }
    });
    
    return {
      total: userKpis.length,
      completed,
      percentage: Math.round((completed / userKpis.length) * 100)
    };
  };

  // カテゴリごとのKPI達成状況を計算
  const calculateCategoryProgress = () => {
    const categoryStats: Record<KpiCategory, { total: number, completed: number, percentage: number }> = {
      sales: { total: 0, completed: 0, percentage: 0 },
      development: { total: 0, completed: 0, percentage: 0 }
    };
    
    userKpis.forEach(kpi => {
      const stats = categoryStats[kpi.category];
      stats.total++;
      
      // 月間実績データがあれば使用
      const monthlyData = monthlyAchievements[kpi.id];
      const actualValue = monthlyData ? monthlyData.total : kpi.value || 0;
      
      if (actualValue >= kpi.standardTarget) {
        stats.completed++;
      }
    });
    
    // パーセンテージを計算
    Object.keys(categoryStats).forEach(key => {
      const stats = categoryStats[key as KpiCategory];
      if (stats.total > 0) {
        stats.percentage = Math.round((stats.completed / stats.total) * 100);
      }
    });
    
    return categoryStats;
  };

  // タブが変更されたときの処理
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // カレンダータブに切り替わったときに最新データを読み込む
    if (value === "calendar") {
      loadMonthlyAchievements();
    }
  };

  const progress = calculateKpiProgress();
  const categoryProgress = calculateCategoryProgress();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>KPI管理</CardTitle>
              <CardDescription>
                {format(currentDate, 'yyyy年M月')}のKPI達成状況と目標管理
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={updateMonthlyAchievements}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              実績を更新
            </Button>
          </div>
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
              stats.total > 0 && (
                <Card key={category} className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {CATEGORY_LABELS[category as KpiCategory]}
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
              )
            ))}
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="calendar">カレンダー</TabsTrigger>
              <TabsTrigger value="manage">KPI管理</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-6">
              <KpiOverview 
                openAddDialog={openAddDialog}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                setActiveTab={setActiveTab}
              />
            </TabsContent>
            
            <TabsContent value="calendar" className="pt-6">
              <KpiTableView />
            </TabsContent>
            
            <TabsContent value="manage" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>KPI管理</CardTitle>
                  <CardDescription>目標の設定と管理</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-start mb-4">
                    <Button onClick={openAddDialog}>新しいKPIを追加</Button>
                  </div>
                  
                  {/* ここにKPI管理用のテーブルを表示するコンポーネントを追加できます */}
                  {userKpis.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      KPIデータがありません。「新しいKPIを追加」ボタンからKPIを追加してください。
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userKpis.map(kpi => (
                        <div key={kpi.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{kpi.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {CATEGORY_LABELS[kpi.category]} | 単位: {kpi.unit}
                              </p>
                            </div>
                            <Badge>
                              {kpi.type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">最低目標</p>
                              <p className="font-medium">{kpi.minimumTarget}{kpi.unit}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">標準目標</p>
                              <p className="font-medium">{kpi.standardTarget}{kpi.unit}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">ストレッチ目標</p>
                              <p className="font-medium">{kpi.stretchTarget}{kpi.unit}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-muted-foreground text-sm">現在の実績</p>
                            <div className="flex items-center">
                              <p className="text-xl font-medium">
                                {monthlyAchievements[kpi.id]?.total || kpi.value || 0}{kpi.unit}
                              </p>
                              {monthlyAchievements[kpi.id] && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {monthlyAchievements[kpi.id].daysRecorded}日分の記録
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};