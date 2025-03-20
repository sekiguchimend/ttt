import React, { useState, useMemo, useEffect } from 'react';
import { useKpi } from '@/context/KpiContext';
import { useAuth } from '@/context/AuthContext';
import { KpiMetric, KPI_CATEGORIES, KpiCategory } from '@/types/kpi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiForm } from './KpiForm';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, getDay, isSameMonth, getDaysInMonth, 
  isToday 
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

// 型定義
type DailyKpiAchievement = {
  id?: string;
  kpi_id: string;
  user_id: string;
  date: string;
  actual_value: number;
  is_achieved: boolean;
  notes?: string;
};

interface DailyPerformance {
  date: string;
  actualValue: number;
  isAchieved: boolean;
  notes?: string;
}

interface KpiTableViewProps {
  startDate?: Date;
  endDate?: Date;
}

const CATEGORY_LABELS: Record<KpiCategory, string> = {
  sales: '営業',
  development: '開発'
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export const KpiTableView: React.FC<KpiTableViewProps> = ({
  startDate = new Date(2025, 2, 1), // デフォルトは2025年3月1日
  endDate = new Date(2030, 11, 31)  // デフォルトは2030年12月31日
}) => {
  // Context
  const { user } = useAuth();
  const { metrics, updateMetric, deleteMetric, addMetric } = useKpi();
  const { toast } = useToast();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isKpiDialogOpen, setIsKpiDialogOpen] = useState(false);
  const [isDailyDialogOpen, setIsDailyDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<KpiMetric | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dailyPerformances, setDailyPerformances] = useState<Record<string, DailyPerformance>>({});
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [editDescriptions, setEditDescriptions] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // 月初と月末の日付を取得
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // 月間の日付を配列として取得
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);
  
  // 月の最初の日の曜日（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
  const startDay = getDay(monthStart);
  
  // 月ごとのKPIを取得
  const monthlyKpis = useMemo(() => {
    if (!user || !metrics) return [];
    
    return metrics.filter(kpi => {
      const kpiDate = new Date(kpi.date);
      return isSameMonth(kpiDate, currentDate);
    });
  }, [user, metrics, currentDate]);
  
  // カテゴリでフィルタリングしたKPI
  const filteredKpis = useMemo(() => {
    if (!selectedCategory) return monthlyKpis;
    return monthlyKpis.filter(kpi => kpi.category === selectedCategory);
  }, [monthlyKpis, selectedCategory]);
  
  // 日単位の目標値を計算（月間目標を日数で割る）
  const calculateDailyTargets = useMemo(() => {
    const result = {};
    
    filteredKpis.forEach(kpi => {
      const daysInCurrentMonth = getDaysInMonth(currentDate);
      
      // 日ごとの目標値の計算（月間目標を日数で単純に割る）
      const dailyMinimum = kpi.minimumTarget / daysInCurrentMonth;
      const dailyStandard = kpi.standardTarget / daysInCurrentMonth;
      const dailyStretch = kpi.stretchTarget / daysInCurrentMonth;
      
      result[kpi.id] = {
        name: kpi.name,
        category: kpi.category,
        dailyMinimum,
        dailyStandard,
        dailyStretch,
        unit: kpi.unit
      };
    });
    
    return result;
  }, [filteredKpis, currentDate]);
  
  // 日別実績データの読み込み
  const loadDailyPerformances = async () => {
    if (!user || filteredKpis.length === 0) return;
    
    try {
      // 月の範囲のデータを取得
      const startDateStr = format(monthStart, 'yyyy-MM-dd');
      const endDateStr = format(monthEnd, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('daily_kpi_achievements')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .in('kpi_id', filteredKpis.map(kpi => kpi.id));
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const performances = {};
        
        data.forEach(item => {
          performances[`${item.date}-${item.kpi_id}`] = {
            date: item.date,
            actualValue: item.actual_value,
            isAchieved: item.is_achieved,
            notes: item.notes
          };
        });
        
        setDailyPerformances(performances);
      }
      } catch (error) {
      console.error('Error loading daily performances:', error);
        toast({
          title: "エラー",
        description: "日別実績データの読み込みに失敗しました。",
          variant: "destructive",
        });
      }
  };
  
  // Event Handlers
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  const openAddDialog = () => {
    setSelectedKpi(null);
    setIsKpiDialogOpen(true);
  };
  
  const openEditDialog = (kpi: KpiMetric, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedKpi(kpi);
    setIsKpiDialogOpen(true);
  };
  
  const openDailyPerformanceDialog = (day: Date) => {
    setSelectedDay(day);
    setIsDailyDialogOpen(true);
  };
  
  const handleDelete = async (kpi: KpiMetric, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('このKPIを削除してもよろしいですか？')) {
      try {
        await deleteMetric(kpi.id);
        toast({
          title: "成功",
          description: "KPIを削除しました。",
        });
      } catch (error) {
        toast({
          title: "エラー",
          description: "KPIの削除に失敗しました。",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleKpiSubmit = async (data: Omit<KpiMetric, 'id'>) => {
    try {
      // 月の1日を設定日として使用
      const firstDayOfMonth = startOfMonth(currentDate);
      const formattedDate = format(firstDayOfMonth, 'yyyy-MM-dd');
      
      if (selectedKpi) {
        await updateMetric(selectedKpi.id, data);
        toast({
          title: "成功",
          description: "KPIを更新しました。",
        });
    } else {
        await addMetric({
          ...data,
          userId: user?.id || '',
          date: formattedDate
        });
        toast({
          title: "成功",
          description: "KPIを追加しました。",
        });
    }
    setIsKpiDialogOpen(false);
    setSelectedKpi(null);
    } catch (error) {
      toast({
        title: "エラー",
        description: selectedKpi ? "KPIの更新に失敗しました。" : "KPIの追加に失敗しました。",
        variant: "destructive",
      });
    }
  };
  
  const handleDailyPerformanceSubmit = async (performanceData: Record<string, number>) => {
    if (!selectedDay || !user) return;
    
    const dateKey = format(selectedDay, 'yyyy-MM-dd');
    const newPerformances = { ...dailyPerformances };
    
    setIsSaving(true);
    
    try {
      // 保存するデータを準備
      const performanceRecords: DailyKpiAchievement[] = [];
      
      for (const kpiId of Object.keys(performanceData)) {
        const actualValue = performanceData[kpiId];
        const dailyTarget = calculateDailyTargets[kpiId];
        const kpi = filteredKpis.find(k => k.id === kpiId);
        
        if (dailyTarget && kpi) {
          // 目標達成の判定
          const isAchieved = actualValue >= dailyTarget.dailyMinimum;
          
          // 日別実績を保存
          const key = `${dateKey}-${kpiId}`;
          newPerformances[key] = {
            date: dateKey,
            actualValue,
            isAchieved
          };
          
          // Supabaseに保存するレコードを準備
          performanceRecords.push({
            kpi_id: kpiId,
            user_id: user.id,
            date: dateKey,
            actual_value: actualValue,
            is_achieved: isAchieved
          });
        }
      }
      
      // Supabaseに保存する
      const { error } = await supabase
        .from('daily_kpi_achievements')
        .upsert(performanceRecords, { 
          onConflict: 'kpi_id,date',  // kpi_idとdateの組み合わせで一意に特定
          returning: 'minimal' 
        });
      
      if (error) throw error;
      
      // ローカルの状態を更新
      setDailyPerformances(newPerformances);
      setIsDailyDialogOpen(false);
      
      toast({
        title: "成功",
        description: "日別実績を保存しました。",
      });
    } catch (error) {
      console.error('Error saving daily performances:', error);
      toast({
        title: "エラー",
        description: "日別実績の保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // KPIの保存
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const updates = Object.entries(editValues).map(([kpiId, value]) => ({
        user_id: user.id,
        kpi_id: kpiId,
        date: format(currentDate, 'yyyy-MM-dd'),
        value: value,
        description: editDescriptions[kpiId] || ''
      }));

      const { error } = await supabase
        .from('daily_kpi_achievements')
        .upsert(updates, {
          onConflict: 'user_id,kpi_id,date'
        });

      if (error) throw error;

      // ローカルの状態も更新
      updates.forEach(update => {
        const kpi = metrics.find(m => m.id === update.kpi_id);
        if (kpi) {
          updateMetric(update.kpi_id, {
            ...kpi,
            value: update.value,
            description: update.description
          });
        }
      });

      setEditingKpiId(null);
      setEditValues({});
      setEditDescriptions({});
      
      toast({
        title: "成功",
        description: "KPIを保存しました。",
      });
    } catch (error) {
      console.error('Error saving KPIs:', error);
      toast({
        title: "エラー",
        description: "KPIの保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper functions
  const getCellBackgroundColor = (day: Date) => {
    if (!isSameMonth(day, currentDate)) {
      return "bg-gray-100";
    }
    
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayPerformances = Object.keys(dailyPerformances)
      .filter(key => key.startsWith(dateKey))
      .map(key => dailyPerformances[key]);
    
    if (dayPerformances.length === 0) {
      return isToday(day) ? "bg-blue-50" : "bg-white";
    }
    
    // すべてのKPIが達成されているかチェック
    const allAchieved = dayPerformances.every(perf => perf.isAchieved);
    
    // 一部のKPIが達成されているかチェック
    const someAchieved = dayPerformances.some(perf => perf.isAchieved);
    
    if (allAchieved) {
      return "bg-green-100";
    } else if (someAchieved) {
      return "bg-yellow-100";
    } else {
      return "bg-red-100";
    }
  };
  
  const renderCalendarCells = () => {
    // 前月の日を埋める配列
    const leadingDays = Array.from({ length: startDay }, (_, i) => null);
    
    return (
      <>
        {/* 曜日のヘッダー */}
        {WEEKDAY_LABELS.map((day, index) => (
          <div
            key={`weekday-${index}`}
            className={`text-center p-2 font-medium ${
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : ""
            }`}
          >
            {day}
        </div>
        ))}
        
        {/* 前月の空白セル */}
        {leadingDays.map((_, index) => (
          <div key={`empty-${index}`} className="bg-gray-100 p-2 min-h-[100px]"></div>
        ))}
        
        {/* 当月の日付セル */}
        {daysInMonth.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayNumber = day.getDate();
          const dayOfWeek = getDay(day);
          
          // その日のパフォーマンスデータを取得
          const dayPerformances = Object.keys(dailyPerformances)
            .filter(key => key.startsWith(dateKey))
            .map(key => {
              const [date, kpiId] = key.split('-');
              const kpi = filteredKpis.find(k => k.id === kpiId);
              const dailyTarget = kpi ? calculateDailyTargets[kpi.id] : null;
              return {
                ...dailyPerformances[key],
                kpiName: kpi ? kpi.name : '',
                kpiUnit: kpi ? kpi.unit : '',
                targetValue: dailyTarget ? Math.round(dailyTarget.dailyMinimum * 10) / 10 : 0
              };
            });
            
          return (
            <div
              key={`day-${dateKey}`}
              className={`p-2 border border-gray-200 min-h-[100px] ${getCellBackgroundColor(day)} hover:bg-gray-50 cursor-pointer transition-colors ${isToday(day) ? "border-blue-500" : ""}`}
              onClick={() => openDailyPerformanceDialog(day)}
            >
              <div className={`text-right mb-1 font-medium ${
                dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-blue-500" : ""
              }`}>
                {dayNumber}
              </div>
              
              {/* 実績表示 */}
              <div className="space-y-1 text-xs">
                {dayPerformances.map((perf, idx) => (
                  <div 
                    key={`perf-${idx}`} 
                    className={`p-1 rounded ${
                      perf.isAchieved ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                    }`}
                  >
                    <div className="font-medium">{perf.kpiName}</div>
                    <div className="flex justify-between items-center">
                      <span>実績: {perf.actualValue}{perf.kpiUnit}</span>
                      <span>目標: {perf.targetValue}{perf.kpiUnit}</span>
                      </div>
                      </div>
                ))}
                
                {dayPerformances.length === 0 && filteredKpis.length > 0 && (
                  <div className="text-center p-1 text-muted-foreground">
                    クリックして実績入力
          </div>
        )}
      </div>
            </div>
          );
        })}
      </>
    );
  };
  
  // Effects
  useEffect(() => {
    loadDailyPerformances();
  }, [user, filteredKpis, monthStart, monthEnd]);
  
  return (
    <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
            <CardTitle>KPI カレンダー</CardTitle>
              <CardDescription>
              {format(currentDate, 'yyyy年M月', { locale: ja })}
              </CardDescription>
            </div>
          
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                onClick={goToPreviousMonth}
                className="h-8 w-8"
                >
                <ChevronLeft className="h-4 w-4" />
                </Button>
              
                <Button
                  variant="outline"
                  size="icon"
                onClick={goToNextMonth}
                className="h-8 w-8"
                >
                <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            
            <Button onClick={openAddDialog} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              月間KPI追加
            </Button>
            </div>
          </div>
          
        {/* カテゴリフィルター */}
        {KPI_CATEGORIES.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge
              variant={selectedCategory === '' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('')}
            >
              すべて
            </Badge>
            {KPI_CATEGORIES.map(category => (
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
        
        {/* 月別KPI一覧とその日の目標 */}
        <div className="mt-4 border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium">当月のKPI</h3>
            <div className="text-sm text-muted-foreground">
              月間目標 → 日毎の目標
            </div>
          </div>
          
          {filteredKpis.length > 0 ? (
            <div className="space-y-3">
              {filteredKpis.map(kpi => {
                const dailyTarget = calculateDailyTargets[kpi.id];
                const dailyValue = dailyTarget ? Math.round(dailyTarget.dailyMinimum * 10) / 10 : 0;
                
                return (
                  <div 
                    key={kpi.id}
                    className="flex items-center justify-between p-3 border bg-white rounded-md"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={kpi.category === 'sales' ? 'default' : 'secondary'}>
                          {CATEGORY_LABELS[kpi.category]}
                        </Badge>
                        <span className="font-medium">{kpi.name}</span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">月間目標: </span>
                        <span className="font-medium">{kpi.minimumTarget}{kpi.unit}</span>
                        <span className="text-muted-foreground ml-4">1日あたり: </span>
                        <span className="font-medium">{dailyValue}{kpi.unit}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => openEditDialog(kpi, e)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        編集
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(kpi, e)}
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground bg-white rounded-md border">
              KPIが設定されていません。「月間KPI追加」ボタンから新しいKPIを追加してください。
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* カレンダー表示 */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarCells()}
        </div>
        
        {/* 凡例 */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span>すべて達成</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
            <span>一部達成</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
            <span>未達成</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border rounded mr-2"></div>
            <span>未入力</span>
          </div>
        </div>
        </CardContent>
      
      {/* KPI設定ダイアログ */}
      <Dialog open={isKpiDialogOpen} onOpenChange={setIsKpiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedKpi ? 'KPIの編集' : '新規KPIの追加'}
            </DialogTitle>
            <DialogDescription>
              {selectedKpi ? 'KPIの情報を編集します。' : '新しいKPIを追加します。'}
            </DialogDescription>
          </DialogHeader>
          
          <KpiForm
            onSubmit={handleKpiSubmit}
            onCancel={() => setIsKpiDialogOpen(false)}
            initialData={selectedKpi}
          />
        </DialogContent>
      </Dialog>
      
      {/* 日別実績入力ダイアログ */}
      <Dialog open={isDailyDialogOpen} onOpenChange={setIsDailyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              日別実績入力
            </DialogTitle>
            <DialogDescription>
              {selectedDay && format(selectedDay, 'yyyy年M月d日', { locale: ja })}の実績値を入力してください
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {filteredKpis.length > 0 ? (
              filteredKpis.map(kpi => {
                const dateKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
                const performanceKey = `${dateKey}-${kpi.id}`;
                const existingValue = dailyPerformances[performanceKey]?.actualValue || 0;
                const dailyTarget = calculateDailyTargets[kpi.id];
                
                return (
                  <div key={kpi.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{kpi.name}</div>
                        <div className="text-sm text-muted-foreground">
                          目標: {dailyTarget ? Math.round(dailyTarget.dailyMinimum * 10) / 10 : 0}{kpi.unit}
                        </div>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          id={`actual-${kpi.id}`}
                          defaultValue={existingValue}
                          min={0}
                          step={0.1}
                          placeholder="実績値"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                KPIが設定されていません。先に月間KPIを追加してください。
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDailyDialogOpen(false)}
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button 
                onClick={() => {
                  // フォームから値を取得
                  const performanceData = {};
                  filteredKpis.forEach(kpi => {
                    const input = document.getElementById(`actual-${kpi.id}`) as HTMLInputElement;
                    if (input) {
                      performanceData[kpi.id] = parseFloat(input.value) || 0;
                    }
                  });
                  handleDailyPerformanceSubmit(performanceData);
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="mr-2">保存中...</span>
                    <span className="animate-spin">⟳</span>
                  </>
                ) : (
                  "保存"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};