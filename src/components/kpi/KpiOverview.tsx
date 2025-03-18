import React, { useState } from 'react';
import { PlusCircle, Filter } from 'lucide-react';
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
import { KPI_CATEGORIES } from '@/types/kpi';

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
  const { userKpis, getKpisByUser, getKpisByUserAndCategory, getUserKpiCategories } = useKpi();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDetailedProgress, setShowDetailedProgress] = useState(false);
  
  // サンプルユーザーリスト (実際のアプリでは動的に取得)
  const users = [
    { id: '1', name: '管理者', department: '経営' },
    { id: '2', name: '山田太郎', department: '営業' }
  ];
  
  // 表示するユーザーID
  const targetUserId = isAdmin && selectedUserId ? selectedUserId : user?.id || '';
  
  // ユーザーのKPIカテゴリを取得
  const userCategories = getUserKpiCategories(targetUserId);
  
  // 表示するKPIデータ
  const displayKpis = selectedCategory
    ? getKpisByUserAndCategory(targetUserId, selectedCategory)
    : getKpisByUser(targetUserId);
    
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
              現在の進捗状況と目標達成度
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
                {KPI_CATEGORIES.find(c => c.value === category)?.label || category}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayKpis.length > 0 ? (
            displayKpis.map(kpi => (
              <KpiCard
                key={kpi.id}
                title={kpi.name}
                value={kpi.value}
                format={kpi.type === 'sales' ? 'currency' : 'number'}
                minimumTarget={kpi.minimumTarget}
                standardTarget={kpi.standardTarget}
                stretchTarget={kpi.stretchTarget}
                targetValue={kpi.target} // 後方互換性のため
                suffix={kpi.unit}
                description={`目標: ${kpi.standardTarget || kpi.target}${kpi.unit}`}
                trend={
                  kpi.value >= (kpi.stretchTarget || (kpi.standardTarget ? kpi.standardTarget * 1.3 : kpi.target ? kpi.target * 1.3 : 0))
                    ? 'up'
                    : kpi.value >= (kpi.standardTarget || kpi.target || 0)
                      ? 'up'
                      : kpi.value >= (kpi.minimumTarget || (kpi.standardTarget ? kpi.standardTarget * 0.7 : kpi.target ? kpi.target * 0.7 : 0))
                        ? 'neutral'
                        : 'down'
                }
                showDetailedProgress={showDetailedProgress}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              KPIデータがありません。「KPI管理」タブでKPIを追加してください。
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={() => {
          setActiveTab("manage");
          setTimeout(openAddDialog, 100);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新しいKPIを追加
        </Button>
      </CardFooter>
    </Card>
  );
};
