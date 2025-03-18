
import React, { useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { KpiType, KPI_TYPE_OPTIONS } from '@/types/kpi';
import { useKpi } from '@/context/KpiContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EmployeeSelect } from './EmployeeSelect';

export const KpiAssignment: React.FC = () => {
  const { toast } = useToast();
  const { assignKpiTemplate, getUserKpiTypes } = useKpi();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedKpiTypes, setSelectedKpiTypes] = useState<KpiType[]>([]);
  
  // サンプルユーザーリスト (実際のアプリでは動的に取得)
  const users = [
    { id: '1', name: '管理者', department: '経営' },
    { id: '2', name: '山田太郎', department: '営業' }
  ];
  
  // 従業員選択時の処理
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    if (employeeId) {
      // 選択された従業員の既存KPIタイプを取得して設定
      const existingTypes = getUserKpiTypes(employeeId);
      setSelectedKpiTypes(existingTypes);
    } else {
      setSelectedKpiTypes([]);
    }
  };
  
  // チェックボックス変更時の処理
  const handleCheckboxChange = (kpiType: KpiType, checked: boolean) => {
    if (checked) {
      setSelectedKpiTypes(prev => [...prev, kpiType]);
    } else {
      setSelectedKpiTypes(prev => prev.filter(type => type !== kpiType));
    }
  };
  
  // KPI割り当て処理
  const handleAssign = () => {
    if (!selectedEmployeeId) {
      toast({
        title: "エラー",
        description: "従業員を選択してください",
        variant: "destructive"
      });
      return;
    }
    
    assignKpiTemplate(selectedEmployeeId, selectedKpiTypes);
    toast({
      title: "KPI割り当て完了",
      description: `${selectedKpiTypes.length}個のKPIが割り当てられました`
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI割り当て</CardTitle>
        <CardDescription>
          従業員に対してKPI項目を割り当てます
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>従業員を選択</Label>
          <EmployeeSelect 
            value={selectedEmployeeId}
            onChange={handleEmployeeChange}
          />
        </div>
        
        {selectedEmployeeId && (
          <div className="space-y-4">
            <Label>KPI項目</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {KPI_TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`kpi-${option.value}`}
                    checked={selectedKpiTypes.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(option.value, checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={`kpi-${option.value}`} className="text-sm font-medium">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      単位: {option.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAssign}
          disabled={!selectedEmployeeId}
        >
          <CheckIcon className="mr-2 h-4 w-4" />
          KPI割り当て
        </Button>
      </CardFooter>
    </Card>
  );
};
