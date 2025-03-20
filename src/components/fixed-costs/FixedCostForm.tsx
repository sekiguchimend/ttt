
import React, { useState } from 'react';
import { useFixedCosts } from '@/context/FixedCostsContext';
import { FixedCost } from '@/types/fixed-costs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface FixedCostFormProps {
  editingCost?: FixedCost;
  onComplete?: () => void;
}

const categories = [
  '不動産', 
  'ユーティリティ',
  'IT',
  '保険', 
  '通信', 
  'オフィス用品', 
  'サブスクリプション', 
  '税金', 
  'その他'
];

export const FixedCostForm: React.FC<FixedCostFormProps> = ({ 
  editingCost,
  onComplete
}) => {
  const { addCost, updateCost } = useFixedCosts();
  const [name, setName] = useState(editingCost?.name || '');
  const [amount, setAmount] = useState(editingCost?.amount?.toString() || '');
  const [category, setCategory] = useState(editingCost?.category || '');
  const [startDate, setStartDate] = useState(editingCost?.startDate || '');
  const [endDate, setEndDate] = useState(editingCost?.endDate || '');
  const [description, setDescription] = useState(editingCost?.description || '');
  const [isRecurring, setIsRecurring] = useState(editingCost?.isRecurring ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const costData = {
      name,
      amount: Number(amount),
      category,
      startDate,
      endDate: endDate || undefined,
      description,
      isRecurring,
    };

    if (editingCost) {
      updateCost(editingCost.id, costData);
    } else {
      addCost(costData);
    }

    // Reset form
    if (!editingCost) {
      setName('');
      setAmount('');
      setCategory('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setIsRecurring(true);
    }

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCost ? '固定費を編集' : '新規固定費の追加'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="オフィス賃料など"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">金額 (円)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="金額"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">カテゴリー</Label>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">開始日</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">終了日 (任意)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2 flex items-center">
              <div className="flex flex-row items-center space-x-2">
                <Switch
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="isRecurring">毎月の定期支払い</Label>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">詳細説明 (任意)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="詳細な説明を入力"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            {editingCost && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onComplete}
              >
                キャンセル
              </Button>
            )}
            <Button type="submit">
              {editingCost ? '更新' : '追加'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
