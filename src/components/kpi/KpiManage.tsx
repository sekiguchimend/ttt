
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { KpiMetric } from '@/types/kpi';
import { useAuth } from '@/context/AuthContext';
import { useKpi } from '@/context/KpiContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { KpiManageTable } from './KpiManageTable';

interface KpiManageProps {
  openAddDialog: () => void;
  openEditDialog: (kpi: KpiMetric) => void;
  handleDeleteKpi: (id: string) => void;
  selectedUserId: string;
  setSelectedUserId: (userId: string) => void;
}

export const KpiManage: React.FC<KpiManageProps> = ({
  openAddDialog,
  openEditDialog,
  handleDeleteKpi,
  selectedUserId,
  setSelectedUserId
}) => {
  const { isAdmin } = useAuth();
  const { userKpis, getKpisByUser } = useKpi();
  
  // 表示するKPIデータ
  const displayKpis = isAdmin && selectedUserId 
    ? getKpisByUser(selectedUserId)
    : userKpis;
  
  // サンプルユーザーリスト (実際のアプリでは動的に取得)
  const users = [
    { id: '1', name: '管理者', department: '経営' },
    { id: '2', name: '山田太郎', department: '営業' }
  ];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>KPI管理</CardTitle>
            <CardDescription>
              KPIの追加、編集、削除
            </CardDescription>
          </div>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            KPI追加
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isAdmin && (
          <div className="mb-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="従業員を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">自分のKPI</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <KpiManageTable 
          kpis={displayKpis}
          onEdit={openEditDialog}
          onDelete={handleDeleteKpi}
        />
      </CardContent>
    </Card>
  );
};
