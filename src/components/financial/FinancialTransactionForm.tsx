import React, { useState } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import { FinancialTransaction } from '@/types/financial';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinancialTransactionFormProps {
  initialData?: FinancialTransaction;
  onSubmit: (data: Omit<FinancialTransaction, 'id'> | FinancialTransaction) => void;
  onCancel: () => void;
}

const FinancialTransactionForm: React.FC<FinancialTransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const { employees } = useEmployee();
  const { isAdmin, user } = useAuth();
  
  // Categories for financial transactions
  const categories = [
    'ウェブ開発',
    'アプリ開発',
    'コンサルティング',
    'デザイン',
    'マーケティング',
    'トレーニング',
    'サポート',
    'その他'
  ];
  
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || user?.id || '',
    clientName: initialData?.clientName || '',
    amount: initialData?.amount || 0,
    cost: initialData?.cost || 0,
    expenses: initialData?.expenses || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    category: initialData?.category || categories[0],
    notes: initialData?.notes || ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['amount', 'cost', 'expenses'].includes(name) ? Number(value) : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
  };
  
  // Calculate gross profit and operating profit
  const grossProfit = formData.amount - formData.cost;
  const operatingProfit = grossProfit - formData.expenses;
  
  // Calculate profit margins
  const grossProfitMargin = formData.amount > 0 
    ? (grossProfit / formData.amount * 100).toFixed(1) 
    : '0.0';
    
  const operatingProfitMargin = formData.amount > 0 
    ? (operatingProfit / formData.amount * 100).toFixed(1) 
    : '0.0';
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isAdmin && (
        <div className="space-y-2">
          <Label htmlFor="employeeId">担当者</Label>
          <Select
            value={formData.employeeId}
            onValueChange={(value) => handleSelectChange('employeeId', value)}
          >
            <SelectTrigger id="employeeId">
              <SelectValue placeholder="担当者を選択" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} ({employee.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="clientName">取引先名</Label>
        <Input
          id="clientName"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          placeholder="取引先名を入力"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">カテゴリ</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleSelectChange('category', value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">売上金額</Label>
        <div className="flex">
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            required
          />
          <span className="flex items-center ml-2">円</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cost">原価</Label>
        <div className="flex">
          <Input
            id="cost"
            name="cost"
            type="number"
            value={formData.cost}
            onChange={handleChange}
            placeholder="0"
            min="0"
            required
          />
          <span className="flex items-center ml-2">円</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="expenses">経費</Label>
        <div className="flex">
          <Input
            id="expenses"
            name="expenses"
            type="number"
            value={formData.expenses}
            onChange={handleChange}
            placeholder="0"
            min="0"
            required
          />
          <span className="flex items-center ml-2">円</span>
        </div>
      </div>
      
      <div className="p-4 bg-muted rounded-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">粗利</div>
            <div className="text-lg font-semibold">{grossProfit.toLocaleString()}円</div>
            <div className="text-sm text-muted-foreground">利益率: {grossProfitMargin}%</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">営業利益</div>
            <div className="text-lg font-semibold">{operatingProfit.toLocaleString()}円</div>
            <div className="text-sm text-muted-foreground">利益率: {operatingProfitMargin}%</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">日付</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">メモ</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="メモや詳細情報を入力（任意）"
          rows={3}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button type="submit">{initialData ? '更新' : '追加'}</Button>
      </DialogFooter>
    </form>
  );
};

export default FinancialTransactionForm;