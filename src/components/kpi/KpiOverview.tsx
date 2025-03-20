import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Filter, RefreshCw } from 'lucide-react';
import { useKpi } from '@/context/KpiContext';
import { useAuth } from '@/context/AuthContext';
import { KpiCard } from '@/components/ui/KpiCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { KPI_CATEGORIES, KpiCategory } from '@/types/kpi';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const CATEGORY_LABELS: Record<KpiCategory, string> = {
  sales: '営業',
  development: '開発'
};

interface KpiOverviewProps {
  openAddDialog: () => void;
  selectedUserId: string;
  setSelectedUserId: (userId: string) => void;
  setActiveTab: (tab: string) => void;
}

export const KpiOverview: React.FC<KpiOverviewProps> = ({
  openAddDialog,
  selectedUserId,
  setSelectedUserId,
  setActiveTab
}) => {
  const { isAdmin, user } = useAuth();
  const { metrics, fetchMetrics } = useKpi();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDetailedProgress, setShowDetailedProgress] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyAchievements, setMonthlyAchievements] = useState<Record<string, { total: number, achievedDays: number, daysRecorded: number }>>({});
  
  // サンプルユーザーリスト (実際のアプリでは動的に取得)
  const users = [
    { id: '1', name: '管理者', department: '経営' },
    { id: '2', name: '山田太郎', department: '営業' }
  ];
  
  // 表示するユーザーID
  const targetUserId = isAdmin && selectedUserId ? selectedUserId : user?.id || '';

  // 月初と月末の日付を取得
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  
  // ユーザーのKPIを取得
  const userKpis = useMemo(() => {
    if (!targetUserId || !metrics) return [];
    return metrics.filter(kpi => kpi.userId === targetUserId);
  }, [targetUserId, metrics]);

  // ユーザーのKPIカテゴリを取得
  const userCategories = useMemo(() => {
    const categories = new Set<KpiCategory>();
    userKpis.forEach(kpi => {
      categories.add(kpi.category);
    });
    return Array.from(categories);
  }, [userKpis]);
  
  // 表示するKPIデータ
  const displayKpis = useMemo(() => {
    if (!selectedCategory) return userKpis;
    return userKpis.filter(kpi => kpi.category === selectedCategory);
  }, [userKpis, selectedCategory]);

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

  // 月間集計を更新
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
    
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <CardTitle>
              {isAdmin
                ? (selectedUserId
                  ? `${users.find(u => u.id === selectedUserId)?.name}のKPI`
                  : 'あなたのKPI')
                : 'あなたのKPI'}
            </CardTitle>
            <CardDescription>
              {format(currentDate, 'yyyy年M月')}の進捗状況と目標達成度
            </CardDescription>
          </div>
          
          <div className="flex gap-2 items-center">
            {isAdmin && (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="従業員を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">自分のKPI</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowDetailedProgress(!showDetailedProgress)}
              title={showDetailedProgress ? "詳細表示を隠す" : "詳細表示"}
            >
              <Filter className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={updateMonthlyAchievements}
              disabled={isLoading}
              title="実績を更新"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {userCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge
              variant={selectedCategory === '' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('')}
            >
              すべて
            </Badge>
            {userCategories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {CATEGORY_LABELS[category]}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayKpis.length > 0 ? (
            displayKpis.map(kpi => {
              // 月間実績データがあれば使用する
              const monthlyData = monthlyAchievements[kpi.id];
              const actualValue = monthlyData ? monthlyData.total : kpi.value || 0;
              
              // 達成率の計算
              const achievementRate = Math.round((actualValue / kpi.minimumTarget) * 100);
              
              // 達成日数と記録日数
              const achievedDays = monthlyData?.achievedDays || 0;
              const daysRecorded = monthlyData?.daysRecorded || 0;
              const dailyAchievementRate = daysRecorded > 0 
                ? Math.round((achievedDays / daysRecorded) * 100) 
                : 0;

              return (
                <KpiCard
                  key={kpi.id}
                  title={kpi.name}
                  value={actualValue}
                  format={kpi.type === 'sales' ? 'currency' : 'number'}
                  minimumTarget={kpi.minimumTarget}
                  standardTarget={kpi.standardTarget}
                  stretchTarget={kpi.stretchTarget}
                  targetValue={kpi.standardTarget} // 後方互換性のため
                  suffix={kpi.unit}
                  description={
                    monthlyData 
                      ? `目標: ${kpi.standardTarget}${kpi.unit} | 達成日: ${achievedDays}/${daysRecorded}日 (${dailyAchievementRate}%)`
                      : `目標: ${kpi.standardTarget}${kpi.unit}`
                  }
                  trend={
                    actualValue >= kpi.stretchTarget
                      ? 'up'
                      : actualValue >= kpi.standardTarget
                        ? 'up'
                        : actualValue >= kpi.minimumTarget
                          ? 'neutral'
                          : 'down'
                  }
                  showDetailedProgress={showDetailedProgress}
                  achievementPercentage={achievementRate}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              KPIデータがありません。「KPI管理」タブでKPIを追加してください。
            </div>
          )}
        </div>
      </CardContent>
      
     
    </Card>
  );
};