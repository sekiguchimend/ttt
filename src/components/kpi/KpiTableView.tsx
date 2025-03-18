import React, { useState, useEffect } from 'react';
import { useKpi } from '@/context/KpiContext';
import { useAuth } from '@/context/AuthContext';
import { KpiMetric, KPI_CATEGORIES } from '@/types/kpi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { KpiForm } from './KpiForm';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, startOfMonth, endOfMonth, eachWeekOfInterval, getWeek, getMonth, getYear, isSameDay, isSameWeek, isSameMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Edit, Plus, Save, X, Check, AlertCircle } from 'lucide-react';

interface KpiTableViewProps {
  startDate?: Date;
  endDate?: Date;
}

export const KpiTableView: React.FC<KpiTableViewProps> = ({
  startDate = new Date(2025, 2, 1), // デフォルトは2025年3月1日
  endDate = new Date(2030, 11, 31)  // デフォルトは2030年12月31日
}) => {
  const { user } = useAuth();
  const { userKpis, addKpi, updateKpi, getKpisByUser } = useKpi();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isKpiDialogOpen, setIsKpiDialogOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KpiMetric | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  
  // 現在の日付範囲を取得
  const getDateRange = () => {
    if (selectedPeriod === 'daily') {
      return {
        start: currentDate,
        end: currentDate,
        title: format(currentDate, 'yyyy年M月d日', { locale: ja })
      };
    } else if (selectedPeriod === 'weekly') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // 月曜始まり
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return {
        start,
        end,
        title: `${format(start, 'yyyy年M月d日', { locale: ja })} 〜 ${format(end, 'M月d日', { locale: ja })}`
      };
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return {
        start,
        end,
        title: format(currentDate, 'yyyy年M月', { locale: ja })
      };
    }
  };
  
  const dateRange = getDateRange();
  
  // 前の期間に移動
  const goToPreviousPeriod = () => {
    if (selectedPeriod === 'daily') {
      setCurrentDate(prev => addDays(prev, -1));
    } else if (selectedPeriod === 'weekly') {
      setCurrentDate(prev => addDays(startOfWeek(prev, { weekStartsOn: 1 }), -7));
    } else {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() - 1);
        return newDate;
      });
    }
  };
  
  // 次の期間に移動
  const goToNextPeriod = () => {
    if (selectedPeriod === 'daily') {
      setCurrentDate(prev => addDays(prev, 1));
    } else if (selectedPeriod === 'weekly') {
      setCurrentDate(prev => addDays(startOfWeek(prev, { weekStartsOn: 1 }), 7));
    } else {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + 1);
        return newDate;
      });
    }
  };
  
  // 特定の期間のKPIを取得
  const getKpisForPeriod = () => {
    if (!user) return [];
    
    const kpis = getKpisByUser(user.id);
    
    return kpis.filter(kpi => {
      const kpiDate = new Date(kpi.date);
      
      if (selectedPeriod === 'daily') {
        return isSameDay(kpiDate, dateRange.start);
      } else if (selectedPeriod === 'weekly') {
        return isSameWeek(kpiDate, dateRange.start, { weekStartsOn: 1 });
      } else {
        return isSameMonth(kpiDate, dateRange.start);
      }
    });
  };
  
  // 特定の期間と特定のカテゴリのKPIを取得
  const getKpisForPeriodAndCategory = () => {
    const kpis = getKpisForPeriod();
    if (!selectedCategory) return kpis;
    return kpis.filter(kpi => kpi.category === selectedCategory);
  };
  
  // 編集モードの開始
  const startEditing = (kpiId: string, currentValue: number, currentNotes: string = '') => {
    setEditingKpiId(kpiId);
    setEditValues({ ...editValues, [kpiId]: currentValue });
    setEditNotes({ ...editNotes, [kpiId]: currentNotes || '' });
  };
  
  // 編集の保存
  const saveEdit = (kpi: KpiMetric) => {
    if (editingKpiId === kpi.id) {
      const newValue = editValues[kpi.id];
      const newNotes = editNotes[kpi.id];
      
      updateKpi(kpi.id, { 
        value: newValue,
        notes: newNotes
      });
      
      setEditingKpiId(null);
    }
  };
  
  // 編集のキャンセル
  const cancelEdit = () => {
    setEditingKpiId(null);
  };
  
  // KPIの追加または更新
  const handleKpiSubmit = (data: any) => {
    if (isEditMode && selectedKpi) {
      updateKpi(selectedKpi.id, data);
    } else {
      addKpi(data);
    }
    setIsKpiDialogOpen(false);
    setSelectedKpi(null);
    setIsEditMode(false);
  };
  
  // KPIの編集ダイアログを開く
  const openEditDialog = (kpi: KpiMetric) => {
    setSelectedKpi(kpi);
    setIsEditMode(true);
    setIsKpiDialogOpen(true);
  };
  
  // 新規KPI追加ダイアログを開く
  const openAddDialog = () => {
    setSelectedKpi(null);
    setIsEditMode(false);
    setIsKpiDialogOpen(true);
  };
  
  // 表示するKPI
  const displayKpis = getKpisForPeriodAndCategory();
  
  // 日別テーブル
  const DailyTable = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">日別KPI</h3>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            KPI追加
          </Button>
        </div>
        
        {displayKpis.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI名</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>現在値</TableHead>
                <TableHead>最低ライン</TableHead>
                <TableHead>普通ライン</TableHead>
                <TableHead>いいライン</TableHead>
                <TableHead>メモ</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayKpis.map(kpi => (
                <TableRow key={kpi.id}>
                  <TableCell className="font-medium">{kpi.name}</TableCell>
                  <TableCell>
                    <Badge variant={kpi.category === 'sales' ? 'default' : kpi.category === 'development' ? 'secondary' : 'outline'}>
                      {KPI_CATEGORIES.find(c => c.value === kpi.category)?.label || 'その他'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingKpiId === kpi.id ? (
                      <Input
                        type="number"
                        value={editValues[kpi.id]}
                        onChange={(e) => setEditValues({ ...editValues, [kpi.id]: Number(e.target.value) })}
                        className="w-20"
                      />
                    ) : (
                      <span className={`font-semibold ${
                        kpi.value >= kpi.stretchTarget ? "text-green-600" :
                        kpi.value >= kpi.standardTarget ? "text-green-500" :
                        kpi.value >= kpi.minimumTarget ? "text-yellow-500" :
                        "text-red-500"
                      }`}>
                        {kpi.value}{kpi.unit}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{kpi.minimumTarget}{kpi.unit}</TableCell>
                  <TableCell>{kpi.standardTarget}{kpi.unit}</TableCell>
                  <TableCell>{kpi.stretchTarget}{kpi.unit}</TableCell>
                  <TableCell>
                    {editingKpiId === kpi.id ? (
                      <Input
                        value={editNotes[kpi.id]}
                        onChange={(e) => setEditNotes({ ...editNotes, [kpi.id]: e.target.value })}
                        placeholder="メモを入力"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">{kpi.notes || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingKpiId === kpi.id ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => saveEdit(kpi)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => startEditing(kpi.id, kpi.value, kpi.notes)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(kpi)}>
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">この日のKPIデータがありません。「KPI追加」ボタンから追加してください。</p>
          </div>
        )}
      </div>
    );
  };
  
  // 週別テーブル
  const WeeklyTable = () => {
    // 週の日付を取得
    const weekDays = eachDayOfInterval({
      start: dateRange.start,
      end: dateRange.end
    });
    
    // 週のKPIをグループ化
    const groupedKpis = displayKpis.reduce((acc, kpi) => {
      const kpiType = kpi.type;
      if (!acc[kpiType]) {
        acc[kpiType] = {
          name: kpi.name,
          type: kpi.type,
          category: kpi.category,
          unit: kpi.unit,
          minimumTarget: kpi.minimumTarget,
          standardTarget: kpi.standardTarget,
          stretchTarget: kpi.stretchTarget,
          days: {}
        };
      }
      
      const kpiDate = new Date(kpi.date);
      const dateKey = format(kpiDate, 'yyyy-MM-dd');
      acc[kpiType].days[dateKey] = {
        id: kpi.id,
        value: kpi.value,
        notes: kpi.notes
      };
      
      return acc;
    }, {} as Record<string, {
      name: string;
      type: string;
      category: string;
      unit: string;
      minimumTarget: number;
      standardTarget: number;
      stretchTarget: number;
      days: Record<string, { id: string; value: number; notes?: string; }>
    }>);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">週別KPI</h3>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            KPI追加
          </Button>
        </div>
        
        {Object.keys(groupedKpis).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI名</TableHead>
                <TableHead>カテゴリ</TableHead>
                {weekDays.map(day => (
                  <TableHead key={day.toISOString()}>
                    {format(day, 'M/d (E)', { locale: ja })}
                  </TableHead>
                ))}
                <TableHead>週合計</TableHead>
                <TableHead>目標</TableHead>
                <TableHead>達成率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(groupedKpis).map(kpi => {
                // 週の合計を計算
                let weekTotal = 0;
                weekDays.forEach(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  if (kpi.days[dateKey]) {
                    weekTotal += kpi.days[dateKey].value;
                  }
                });
                
                // 達成率を計算
                const achievementRate = Math.round((weekTotal / kpi.standardTarget) * 100);
                
                return (
                  <TableRow key={kpi.type}>
                    <TableCell className="font-medium">{kpi.name}</TableCell>
                    <TableCell>
                      <Badge variant={kpi.category === 'sales' ? 'default' : kpi.category === 'development' ? 'secondary' : 'outline'}>
                        {KPI_CATEGORIES.find(c => c.value === kpi.category)?.label || 'その他'}
                      </Badge>
                    </TableCell>
                    {weekDays.map(day => {
                      const dateKey = format(day, 'yyyy-MM-dd');
                      const dayData = kpi.days[dateKey];
                      
                      return (
                        <TableCell key={dateKey}>
                          {dayData ? (
                            <div className="text-center">
                              <div className={`font-semibold ${
                                dayData.value >= kpi.stretchTarget / 5 ? "text-green-600" :
                                dayData.value >= kpi.standardTarget / 5 ? "text-green-500" :
                                dayData.value >= kpi.minimumTarget / 5 ? "text-yellow-500" :
                                "text-red-500"
                              }`}>
                                {dayData.value}{kpi.unit}
                              </div>
                              {editingKpiId === dayData.id ? (
                                <div className="flex flex-col gap-1 mt-1">
                                  <Input
                                    type="number"
                                    value={editValues[dayData.id]}
                                    onChange={(e) => setEditValues({ ...editValues, [dayData.id]: Number(e.target.value) })}
                                    className="w-16 h-7 text-xs"
                                  />
                                  <div className="flex justify-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveEdit({ ...dayData, type: kpi.type as any, name: kpi.name, category: kpi.category as any, unit: kpi.unit, minimumTarget: kpi.minimumTarget, standardTarget: kpi.standardTarget, stretchTarget: kpi.stretchTarget, date: dateKey, userId: user?.id || '' })}>
                                      <Check className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 text-xs mt-1"
                                  onClick={() => startEditing(dayData.id, dayData.value, dayData.notes)}
                                >
                                  編集
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-muted-foreground">-</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs mt-1"
                                onClick={() => {
                                  setSelectedKpi({
                                    id: '',
                                    userId: user?.id || '',
                                    type: kpi.type as any,
                                    name: kpi.name,
                                    value: 0,
                                    minimumTarget: kpi.minimumTarget,
                                    standardTarget: kpi.standardTarget,
                                    stretchTarget: kpi.stretchTarget,
                                    unit: kpi.unit,
                                    date: dateKey,
                                    category: kpi.category as any
                                  });
                                  setIsEditMode(false);
                                  setIsKpiDialogOpen(true);
                                }}
                              >
                                追加
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="font-semibold">
                      {weekTotal}{kpi.unit}
                    </TableCell>
                    <TableCell>
                      {kpi.standardTarget}{kpi.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              achievementRate >= 100 ? "bg-green-500" : 
                              achievementRate >= 70 ? "bg-yellow-500" : 
                              "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(achievementRate, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs ${
                          achievementRate >= 100 ? "text-green-600" : 
                          achievementRate >= 70 ? "text-yellow-600" : 
                          "text-red-600"
                        }`}>
                          {achievementRate}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">この週のKPIデータがありません。「KPI追加」ボタンから追加してください。</p>
          </div>
        )}
      </div>
    );
  };
  
  // 月別テーブル
  const MonthlyTable = () => {
    // 月の週を取得
    const monthWeeks = eachWeekOfInterval({
      start: dateRange.start,
      end: dateRange.end
    }, { weekStartsOn: 1 }); // 月曜始まり
    
    // 月のKPIをグループ化
    const groupedKpis = displayKpis.reduce((acc, kpi) => {
      const kpiType = kpi.type;
      if (!acc[kpiType]) {
        acc[kpiType] = {
          name: kpi.name,
          type: kpi.type,
          category: kpi.category,
          unit: kpi.unit,
          minimumTarget: kpi.minimumTarget,
          standardTarget: kpi.standardTarget,
          stretchTarget: kpi.stretchTarget,
          days: {}
        };
      }
      
      const kpiDate = new Date(kpi.date);
      const dateKey = format(kpiDate, 'yyyy-MM-dd');
      acc[kpiType].days[dateKey] = {
        id: kpi.id,
        value: kpi.value,
        notes: kpi.notes
      };
      
      return acc;
    }, {} as Record<string, {
      name: string;
      type: string;
      category: string;
      unit: string;
      minimumTarget: number;
      standardTarget: number;
      stretchTarget: number;
      days: Record<string, { id: string; value: number; notes?: string; }>
    }>);
    
    // 週ごとの合計を計算
    const calculateWeekTotal = (kpi: any, weekStart: Date) => {
      let total = 0;
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      weekDays.forEach(day => {
        if (getMonth(day) === getMonth(dateRange.start)) { // 同じ月の日だけ
          const dateKey = format(day, 'yyyy-MM-dd');
          if (kpi.days[dateKey]) {
            total += kpi.days[dateKey].value;
          }
        }
      });
      
      return total;
    };
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">月別KPI</h3>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            KPI追加
          </Button>
        </div>
        
        {Object.keys(groupedKpis).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI名</TableHead>
                <TableHead>カテゴリ</TableHead>
                {monthWeeks.map((week, index) => {
                  const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
                  return (
                    <TableHead key={week.toISOString()}>
                      第{index + 1}週<br/>
                      <span className="text-xs text-muted-foreground">
                        {format(week, 'M/d', { locale: ja })}〜{format(weekEnd, 'M/d', { locale: ja })}
                      </span>
                    </TableHead>
                  );
                })}
                <TableHead>月合計</TableHead>
                <TableHead>目標</TableHead>
                <TableHead>達成率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(groupedKpis).map(kpi => {
                // 月の合計を計算
                let monthTotal = 0;
                Object.values(kpi.days).forEach(day => {
                  monthTotal += day.value;
                });
                
                // 達成率を計算
                const achievementRate = Math.round((monthTotal / (kpi.standardTarget * 4)) * 100); // 4週間分として計算
                
                return (
                  <TableRow key={kpi.type}>
                    <TableCell className="font-medium">{kpi.name}</TableCell>
                    <TableCell>
                      <Badge variant={kpi.category === 'sales' ? 'default' : kpi.category === 'development' ? 'secondary' : 'outline'}>
                        {KPI_CATEGORIES.find(c => c.value === kpi.category)?.label || 'その他'}
                      </Badge>
                    </TableCell>
                    {monthWeeks.map((week, index) => {
                      const weekTotal = calculateWeekTotal(kpi, week);
                      
                      return (
                        <TableCell key={week.toISOString()} className="text-center">
                          <div className={`font-semibold ${
                            weekTotal >= kpi.stretchTarget / 4 ? "text-green-600" :
                            weekTotal >= kpi.standardTarget / 4 ? "text-green-500" :
                            weekTotal >= kpi.minimumTarget / 4 ? "text-yellow-500" :
                            "text-red-500"
                          }`}>
                            {weekTotal}{kpi.unit}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs mt-1"
                            onClick={() => {
                              setCurrentDate(week);
                              setSelectedPeriod('weekly');
                            }}
                          >
                            詳細
                          </Button>
                        </TableCell>
                      );
                    })}
                    <TableCell className="font-semibold">
                      {monthTotal}{kpi.unit}
                    </TableCell>
                    <TableCell>
                      {kpi.standardTarget * 4}{kpi.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              achievementRate >= 100 ? "bg-green-500" : 
                              achievementRate >= 70 ? "bg-yellow-500" : 
                              "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(achievementRate, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs ${
                          achievementRate >= 100 ? "text-green-600" : 
                          achievementRate >= 70 ? "text-yellow-600" : 
                          "text-red-600"
                        }`}>
                          {achievementRate}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">この月のKPIデータがありません。「KPI追加」ボタンから追加してください。</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>KPIテーブル</CardTitle>
              <CardDescription>
                期間ごとのKPI達成状況を表形式で確認・編集できます
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousPeriod}
                  disabled={new Date(dateRange.start) <= startDate}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
                </Button>
                <span className="text-lg font-medium min-w-40 text-center">
                  {dateRange.title}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPeriod}
                  disabled={new Date(dateRange.end) >= endDate}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
                </Button>
              </div>
            </div>
          </div>
          
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
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">日別</TabsTrigger>
              <TabsTrigger value="weekly">週別</TabsTrigger>
              <TabsTrigger value="monthly">月別</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="pt-6">
              <DailyTable />
            </TabsContent>
            
            <TabsContent value="weekly" className="pt-6">
              <WeeklyTable />
            </TabsContent>
            
            <TabsContent value="monthly" className="pt-6">
              <MonthlyTable />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* KPI追加・編集ダイアログ */}
      <Dialog open={isKpiDialogOpen} onOpenChange={setIsKpiDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'KPI編集' : 'KPI追加'}
            </DialogTitle>
            <DialogDescription>
              {selectedKpi?.date && `${new Date(selectedKpi.date).getFullYear()}年${new Date(selectedKpi.date).getMonth() + 1}月${new Date(selectedKpi.date).getDate()}日`}のKPI情報を{isEditMode ? '編集' : '追加'}します
            </DialogDescription>
          </DialogHeader>
          <KpiForm
            onSubmit={handleKpiSubmit}
            onCancel={() => setIsKpiDialogOpen(false)}
            initialData={isEditMode ? selectedKpi : { date: format(dateRange.start, 'yyyy-MM-dd') }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};