import React, { useState } from 'react';
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

interface TransactionFormProps {
  onSubmit: (data: {
    userId: string;
    name: string;
    amount: number;
    date: string;
    category: 'sales' | 'development';
    description?: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    id: string;
    userId: string;
    name: string;
    amount: number;
    date: string;
    category: 'sales' | 'development';
    description?: string;
  } | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null
}) => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    userId: initialData?.userId || (user?.id || ''),
    name: initialData?.name || '',
    amount: initialData?.amount || 0,
    date: initialData?.date || today,
    category: initialData?.category || 'sales' as 'sales' | 'development',
    description: initialData?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    try {
      onSubmit(formData);
    } catch (error) {
      console.error('Error in TransactionForm handleSubmit:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">取引名</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="取引名を入力"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">金額</Label>
        <div className="flex">
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
          <span className="flex items-center ml-2">円</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">取引日</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">カテゴリ</Label>
        <Select
          value={formData.category}
          onValueChange={(value: 'sales' | 'development') => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">営業</SelectItem>
            <SelectItem value="development">開発</SelectItem>
          </SelectContent>
        </Select>
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