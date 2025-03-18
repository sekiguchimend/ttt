import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Edit, Info } from 'lucide-react';
import { useKpi } from '@/context/KpiContext';
import { useAuth } from '@/context/AuthContext';
import { KpiMetric, KPI_CATEGORIES } from '@/types/kpi';
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

export const KpiCalendarView: React.FC<KpiCalendarViewProps> = ({
  startDate = new Date(2025, 2, 1), // デフォルトは2025年3月1日
  endDate = new Date(2030, 11, 31)  // デフォルトは2030年12月31日
}) => {
  const { user } = useAuth();
  const { userKpis, addKpi, updateKpi, getKpisByUser } = useKpi();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
    
    const kpis = getKpisByUser(user.id);
    return kpis.filter(kpi => kpi.date === dateString);
  };
  
  // 特定の日付と特定のカテゴリのKPIを取得
  const getKpisForDateAndCategory = (dateString: string, category?: string) => {
    const kpis = getKpisForDate(dateString);
    if (!category) return kpis;
    return kpis.filter(kpi => kpi.category === category);
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
                    {dayKpis.slice(0, 2).map(kpi => (
                      <div
                        key={kpi.id}
                        className={`text-xs p-1 rounded truncate ${
                          kpi.category === 'sales' ? 'bg-blue-50 text-blue-700' :
                          kpi.category === 'development' ? 'bg-green-50 text-green-700' :
                          'bg-gray-50 text-gray-700'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailDialog(kpi);
                        }}
                      >
                        {kpi.name}: {kpi.value}{kpi.unit}
                      </div>
                    ))}
                    {dayKpis.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        他 {dayKpis.length - 2} 件
                      </div>
                    )}
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
      <Dialog open={isKpiDetailDialogOpen} onOpenChange={setIsKpiDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>KPI詳細</DialogTitle>
            <DialogDescription>
              {selectedKpi && `${new Date(selectedKpi.date).getFullYear()}年${new Date(selectedKpi.date).getMonth() + 1}月${new Date(selectedKpi.date).getDate()}日`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedKpi && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{selectedKpi.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {KPI_CATEGORIES.find(c => c.value === selectedKpi.category)?.label || 'その他'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsKpiDetailDialogOpen(false);
                    setTimeout(() => openEditDialog(selectedKpi), 100);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">現在の値</p>
                  <p className="text-xl font-semibold">{selectedKpi.value}{selectedKpi.unit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">目標値</p>
                  <p className="text-xl font-semibold">{selectedKpi.standardTarget}{selectedKpi.unit}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>進捗状況</span>
                  <span>{Math.min(Math.round((selectedKpi.value / selectedKpi.standardTarget) * 100), 100)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      selectedKpi.value >= selectedKpi.stretchTarget ? "bg-green-600" :
                      selectedKpi.value >= selectedKpi.standardTarget ? "bg-green-500" :
                      selectedKpi.value >= selectedKpi.minimumTarget ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min((selectedKpi.value / selectedKpi.standardTarget) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">最低ライン</span>
                    <span>{selectedKpi.minimumTarget}{selectedKpi.unit}</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full mt-1">
                    <div
                      className={`h-1 rounded-full ${
                        selectedKpi.value >= selectedKpi.minimumTarget ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min((selectedKpi.value / selectedKpi.minimumTarget) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">普通ライン</span>
                    <span>{selectedKpi.standardTarget}{selectedKpi.unit}</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full mt-1">
                    <div
                      className={`h-1 rounded-full ${
                        selectedKpi.value >= selectedKpi.standardTarget ? "bg-green-500" : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${Math.min((selectedKpi.value / selectedKpi.standardTarget) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">いいライン</span>
                    <span>{selectedKpi.stretchTarget}{selectedKpi.unit}</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full mt-1">
                    <div
                      className={`h-1 rounded-full ${
                        selectedKpi.value >= selectedKpi.stretchTarget ? "bg-green-600" : "bg-blue-500"
                      }`}
                      style={{
                        width: `${Math.min((selectedKpi.value / selectedKpi.stretchTarget) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {selectedKpi.notes && (
                <div className="space-y-1 mt-4">
                  <p className="text-sm text-muted-foreground">メモ</p>
                  <p className="text-sm p-2 bg-muted/20 rounded">{selectedKpi.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};