import React, { useState } from 'react';
import { KPI_TYPE_OPTIONS, KPI_CATEGORIES, KpiMetric, KpiType, KpiCategory } from '@/types/kpi';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeSelect } from './EmployeeSelect';

const CATEGORY_LABELS: Record<KpiCategory, string> = {
  sales: '営業',
  development: '開発'
};

interface KpiFormProps {
  onSubmit: (data: Omit<KpiMetric, 'id'>) => void;
  onCancel: () => void;
  initialData?: Partial<KpiMetric> | null;
}

export const KpiForm: React.FC<KpiFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    userId: initialData?.userId || (user?.id || ''),
    type: initialData?.type || 'appointments' as KpiType,
    name: initialData?.name || '',
    value: initialData?.value || 0,
    minimumTarget: initialData?.minimumTarget || 0,
    standardTarget: initialData?.standardTarget || 0,
    stretchTarget: initialData?.stretchTarget || 0,
    unit: initialData?.unit || '件',
    date: initialData?.date || today,
    category: initialData?.category || 'sales' as KpiCategory,
    description: initialData?.description || ''
  });

  // KPIタイプが変更されたとき、名前を自動設定
  const handleTypeChange = (type: KpiType) => {
    const selectedType = KPI_TYPE_OPTIONS.find(option => option.value === type);
    setFormData(prev => ({
      ...prev,
      type,
      name: selectedType?.label || prev.name
    }));
  };

  // 目標値の自動計算
  const handleTargetChange = (field: 'minimumTarget' | 'standardTarget' | 'stretchTarget', value: number) => {
    const newFormData = { ...formData, [field]: value };
    
    // 標準目標が変更された場合、最低と最高を自動調整
    if (field === 'standardTarget' && !initialData) {
      newFormData.minimumTarget = Math.round(value * 0.7);
      newFormData.stretchTarget = Math.round(value * 1.3);
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isAdmin && (
        <EmployeeSelect
          value={formData.userId}
          onChange={(userId) => setFormData(prev => ({ ...prev, userId }))}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">KPIタイプ</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleTypeChange(value as KpiType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="KPIタイプを選択" />
            </SelectTrigger>
            <SelectContent>
              {KPI_TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ</Label>
          <Select
            value={formData.category}
            onValueChange={(value: KpiCategory) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {KPI_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">KPI名</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="KPI名を入力"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="value">現在の達成値</Label>
        <div className="flex">
          <Input
            id="value"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
          <span className="flex items-center ml-2">{formData.unit}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>目標設定</Label>
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="minimum">最低ライン</TabsTrigger>
            <TabsTrigger value="standard">普通ライン</TabsTrigger>
            <TabsTrigger value="stretch">いいライン</TabsTrigger>
          </TabsList>
          
          <TabsContent value="minimum" className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="minimumTarget">最低目標値</Label>
              <div className="flex">
                <Input
                  id="minimumTarget"
                  type="number"
                  value={formData.minimumTarget}
                  onChange={(e) => handleTargetChange('minimumTarget', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  required
                />
                <span className="flex items-center ml-2">{formData.unit}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                最低限達成すべき目標値を設定します。
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="standard" className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="standardTarget">標準目標値</Label>
              <div className="flex">
                <Input
                  id="standardTarget"
                  type="number"
                  value={formData.standardTarget}
                  onChange={(e) => handleTargetChange('standardTarget', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  required
                />
                <span className="flex items-center ml-2">{formData.unit}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                通常期待される目標値を設定します。
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="stretch" className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="stretchTarget">高い目標値</Label>
              <div className="flex">
                <Input
                  id="stretchTarget"
                  type="number"
                  value={formData.stretchTarget}
                  onChange={(e) => handleTargetChange('stretchTarget', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  required
                />
                <span className="flex items-center ml-2">{formData.unit}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                高い目標を達成した場合の値を設定します。
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">備考</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="備考を入力"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          {initialData ? '更新' : '追加'}
        </Button>
      </DialogFooter>
    </form>
  );
};
