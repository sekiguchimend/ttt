import React, { useState } from 'react';
import { useKpi } from '@/context/KpiContext';
import { useAuth } from '@/context/AuthContext';
import { KPI_CATEGORIES, KpiType } from '@/types/kpi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export const KpiAdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const { kpis } = useKpi();
  const [selectedCategory, setSelectedCategory] = useState<string>('sales');
  
  // サンプルユーザーリスト (実際のアプリでは動的に取得)
  const users = [
    { id: '1', name: '管理者', department: '経営' },
    { id: '2', name: '山田太郎', department: '営業' }
  ];
  
  // 選択されたカテゴリのKPIタイプを取得
  const getCategoryKpiTypes = (): KpiType[] => {
    switch (selectedCategory) {
      case 'sales':
        return ['appointments', 'closings', 'meetings', 'calls', 'emails', 'sales'];
      case 'development':
        return ['contract_negotiations', 'contract_closings'];
      default:
        return ['custom'];
    }
  };
  
  // 各ユーザーのKPI達成状況を計算
  const getUserKpiProgress = (userId: string, kpiType: KpiType) => {
    const userKpi = kpis.find(kpi => kpi.userId === userId && kpi.type === kpiType);
    
    if (!userKpi) {
      return { value: 0, minimumTarget: 0, standardTarget: 0, stretchTarget: 0, progress: 0, status: 'none' };
    }
    
    const value = userKpi.value;
    const minimumTarget = userKpi.minimumTarget;
    const standardTarget = userKpi.standardTarget;
    const stretchTarget = userKpi.stretchTarget;
    
    // 進捗率（標準目標に対する割合）
    const progress = Math.round((value / standardTarget) * 100);
    
    // 達成状況
    let status = 'below';
    if (value >= stretchTarget) {
      status = 'stretch';
    } else if (value >= standardTarget) {
      status = 'standard';
    } else if (value >= minimumTarget) {
      status = 'minimum';
    }
    
    return { value, minimumTarget, standardTarget, stretchTarget, progress, status };
  };
  
  // 進捗状況に応じた色を取得
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'stretch':
        return 'bg-green-600';
      case 'standard':
        return 'bg-green-500';
      case 'minimum':
        return 'bg-yellow-500';
      case 'below':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  // 進捗状況に応じたバッジを取得
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stretch':
        return <Badge className="bg-green-600">いいライン達成</Badge>;
      case 'standard':
        return <Badge className="bg-green-500">普通ライン達成</Badge>;
      case 'minimum':
        return <Badge className="bg-yellow-500">最低ライン達成</Badge>;
      case 'below':
        return <Badge variant="destructive">未達成</Badge>;
      default:
        return <Badge variant="outline">未設定</Badge>;
    }
  };
  
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI管理ダッシュボード</CardTitle>
          <CardDescription>
            このページは管理者のみがアクセスできます。
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI管理ダッシュボード</CardTitle>
        <CardDescription>
          従業員のKPI達成状況を一覧で確認できます
        </CardDescription>
        
        <div className="mt-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {KPI_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">従業員</TableHead>
              {getCategoryKpiTypes().map(kpiType => (
                <TableHead key={kpiType}>
                  {kpiType === 'appointments' ? 'アポイント' :
                   kpiType === 'closings' ? 'クロージング' :
                   kpiType === 'meetings' ? '面談' :
                   kpiType === 'calls' ? '電話' :
                   kpiType === 'emails' ? 'メール' :
                   kpiType === 'sales' ? '売上' :
                   kpiType === 'contract_negotiations' ? '受託商談' :
                   kpiType === 'contract_closings' ? '受託成約' :
                   'カスタム'}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name}
                  <div className="text-xs text-muted-foreground">{user.department}</div>
                </TableCell>
                
                {getCategoryKpiTypes().map(kpiType => {
                  const { value, standardTarget, progress, status } = getUserKpiProgress(user.id, kpiType);
                  const progressColor = getProgressColor(status);
                  
                  return (
                    <TableCell key={`${user.id}-${kpiType}`}>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{value}</span>
                          <span className="text-muted-foreground">/ {standardTarget}</span>
                        </div>
                        
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full ${progressColor} transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                          {getStatusBadge(status)}
                        </div>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};