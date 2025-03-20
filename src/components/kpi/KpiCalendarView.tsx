import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Edit, Info } from 'lucide-react';
import { useKpi } from '@/context/KpiContext';
import { useAuth } from '@/context/AuthContext';
import { KpiMetric, KpiCategory, KPI_CATEGORIES, KPI_TYPE_OPTIONS } from '@/types/kpi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { KpiForm } from './KpiForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// 月の名前の配列
const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月', 
  '7月', '8月', '9月', '10月', '11月', '12月'
];

// 曜日の名前の配列
const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

interface KpiCalendarViewProps {
  startDate?: Date; // カレンダーの開始日
  endDate?: Date;   // カレンダーの終了日
}

const CATEGORY_LABELS: Record<KpiCategory, string> = {
  sales: '営業',
  development: '開発'
};

export const KpiCalendarView: React.FC<KpiCalendarViewProps> = ({
  startDate = new Date(2025, 2, 1), // デフォルトは2025年3月1日
  endDate = new Date(2030, 11, 31)  // デフォルトは2030年12月31日
}) => {
  const { user } = useAuth();
  const { metrics, addMetric, updateMetric } = useKpi();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<KpiCategory | ''>('');
  const [isKpiDialogOpen, setIsKpiDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KpiMetric | null>(null);
  const [isKpiDetailDialogOpen, setIsKpiDetailDialogOpen] = useState(false);

  // 現在の年月を取得
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // 月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // 月の最初の日の曜日（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // カレンダーに表示する日数
  const daysInMonth = lastDayOfMonth.getDate();
  
  // カレンダーの行数を計算
  const weeksInMonth = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
  
  // カレンダーの日付を生成
  const calendarDays = [];
  let dayCounter = 1;
  
  for (let i = 0; i < weeksInMonth; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < firstDayOfWeek) || dayCounter > daysInMonth) {
        // 月の最初の週で、月の最初の日より前の日付、または月の最後の日より後の日付
        week.push(null);
      } else {
        // 有効な日付
        const date = new Date(currentYear, currentMonth, dayCounter);
        const dateString = date.toISOString().split('T')[0];
        week.push({
          day: dayCounter,
          date: dateString,
          isToday: date.toDateString() === new Date().toDateString(),
          isInRange: date >= startDate && date <= endDate
        });
        dayCounter++;
      }
    }
    calendarDays.push(week);
  }
  
  // 前の月に移動
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    
    // 開始日より前には移動できないようにする
    if (newDate >= startDate) {
      setCurrentDate(newDate);
    }
  };
  
  // 次の月に移動
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    
    // 終了日より後には移動できないようにする
    const lastDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
    if (lastDayOfNewMonth <= endDate) {
      setCurrentDate(newDate);
    }
  };
  
  // 特定の日付のKPIを取得
  const getKpisForDate = (dateString: string) => {
    if (!user) return [];
    
    return metrics.filter(metric => 
      metric.userId === user.id && 
      metric.date === dateString
    );
  };
  
  // 特定の日付と特定のカテゴリのKPIを取得
  const getKpisForDateAndCategory = (dateString: string, category?: string) => {
    const kpis = getKpisForDate(dateString);
    if (!category) return kpis;
    return kpis.filter(kpi => kpi.category === category);
  };
  
  // KPIの追加または更新
  const handleKpiSubmit = async (data: Omit<KpiMetric, 'id'>) => {
    try {
      if (isEditMode && selectedKpi) {
        await updateMetric(selectedKpi.id, data);
      } else {
        await addMetric(data);
      }
      setIsKpiDialogOpen(false);
      setSelectedKpi(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error submitting KPI:', error);
    }
  };
  
  // KPIの編集ダイアログを開く
  const openEditDialog = (kpi: KpiMetric) => {
    setSelectedKpi(kpi);
    setIsEditMode(true);
    setIsKpiDialogOpen(true);
  };
  
  // KPIの詳細ダイアログを開く
  const openDetailDialog = (kpi: KpiMetric) => {
    setSelectedKpi(kpi);
    setIsKpiDetailDialogOpen(true);
  };
  
  // 日付をクリックしたときの処理
  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString);
    setSelectedKpi(null);
    setIsEditMode(false);
    setIsKpiDialogOpen(true);
  };
  
  // 選択された日付のKPI
  const selectedDateKpis = selectedDate ? getKpisForDateAndCategory(selectedDate, selectedCategory) : [];
  
  // KPIの詳細ダイアログ
  const KpiDetailDialog: React.FC<{
    kpi: KpiMetric;
    isOpen: boolean;
    onClose: () => void;
  }> = ({ kpi, isOpen, onClose }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{kpi.name}</DialogTitle>
            <DialogDescription>
              <div className="space-y-2 mt-4">
                <div>
                  <span className="font-medium">カテゴリー：</span>
                  {CATEGORY_LABELS[kpi.category]}
                </div>
                <div>
                  <span className="font-medium">タイプ：</span>
                  {KPI_TYPE_OPTIONS.find(opt => opt.value === kpi.type)?.label}
                </div>
                <div>
                  <span className="font-medium">目標値：</span>
                  <ul className="list-disc list-inside ml-4">
                    <li>最低目標：{kpi.minimumTarget}{kpi.unit}</li>
                    <li>標準目標：{kpi.standardTarget}{kpi.unit}</li>
                    <li>ストレッチ目標：{kpi.stretchTarget}{kpi.unit}</li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium">実績値：</span>
                  {kpi.value}{kpi.unit}
                </div>
                {kpi.description && (
                  <div>
                    <span className="font-medium">備考：</span>
                    {kpi.description}
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>KPIカレンダー</CardTitle>
              <CardDescription>
                日付をクリックしてKPIを追加・編集できます
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
                disabled={new Date(currentYear, currentMonth, 1) <= startDate}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium">
                {currentYear}年{MONTH_NAMES[currentMonth]}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                disabled={new Date(currentYear, currentMonth + 1, 0) >= endDate}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
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
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {CATEGORY_LABELS[category]}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map((day, index) => (
              <div
                key={index}
                className={`text-center py-2 font-medium text-sm ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.flat().map((dayInfo, index) => {
              if (!dayInfo) {
                return <div key={`empty-${index}`} className="h-24 bg-muted/20 rounded-md"></div>;
              }
              
              const { day, date, isToday, isInRange } = dayInfo;
              const dayKpis = getKpisForDateAndCategory(date, selectedCategory);
              const hasKpis = dayKpis.length > 0;
              
              return (
                <div
                  key={date}
                  className={`h-24 p-1 border rounded-md overflow-hidden ${
                    isToday ? 'border-primary bg-primary/5' : 'border-border'
                  } ${isInRange ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 bg-muted/20'}`}
                  onClick={() => isInRange && handleDateClick(date)}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${
                      new Date(date).getDay() === 0 ? 'text-red-500' : 
                      new Date(date).getDay() === 6 ? 'text-blue-500' : ''
                    }`}>
                      {day}
                    </span>
                    {hasKpis && (
                      <Badge variant="outline" className="text-xs">
                        {dayKpis.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayKpis.map((kpi, kpiIndex) => (
                      <div
                        key={`${kpi.id}-${kpiIndex}`}
                        className="flex items-center gap-1 text-xs truncate"
                      >
                        <div className="flex-1 truncate">
                          {kpi.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(kpi);
                            }}
                            className="p-1 hover:bg-muted rounded-sm"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailDialog(kpi);
                            }}
                            className="p-1 hover:bg-muted rounded-sm"
                          >
                            <Info className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
              {selectedDate && `${new Date(selectedDate).getFullYear()}年${new Date(selectedDate).getMonth() + 1}月${new Date(selectedDate).getDate()}日`}のKPI情報を{isEditMode ? '編集' : '追加'}します
            </DialogDescription>
          </DialogHeader>
          <KpiForm
            onSubmit={handleKpiSubmit}
            onCancel={() => setIsKpiDialogOpen(false)}
            initialData={isEditMode ? selectedKpi : { date: selectedDate }}
          />
        </DialogContent>
      </Dialog>
      
      {/* KPI詳細ダイアログ */}
      {selectedKpi && (
        <KpiDetailDialog
          kpi={selectedKpi}
          isOpen={isKpiDetailDialogOpen}
          onClose={() => {
            setIsKpiDetailDialogOpen(false);
            setSelectedKpi(null);
          }}
        />
      )}
    </div>
  );
};