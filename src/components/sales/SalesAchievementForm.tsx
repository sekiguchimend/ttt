import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface SalesAchievementFormProps {
  date: Date;
  onSuccess?: () => void;
}

interface SalesAchievement {
  id?: string;
  user_id: string;
  date: string;
  sales_amount: number;
  new_customers: number;
  existing_customers: number;
  description?: string;
}

export const SalesAchievementForm: React.FC<SalesAchievementFormProps> = ({
  date,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [achievement, setAchievement] = useState<SalesAchievement>({
    user_id: user?.id || '',
    date: format(date, 'yyyy-MM-dd'),
    sales_amount: 0,
    new_customers: 0,
    existing_customers: 0,
    description: ''
  });

  useEffect(() => {
    if (user) {
      loadAchievement();
    }
  }, [date, user]);

  const loadAchievement = async () => {
    if (!user) return;

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log(`Loading achievement for date: ${formattedDate}`);
      
      const { data, error } = await supabase
        .from('sales_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', formattedDate)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data) {
        console.log('Loaded existing record:', data);
        setAchievement(data);
      } else {
        console.log('No existing record found for this date');
        // 新しい日付の場合は、新しいレコードを初期化
        setAchievement({
          user_id: user.id,
          date: formattedDate,
          sales_amount: 0,
          new_customers: 0,
          existing_customers: 0,
          description: ''
        });
      }
    } catch (error) {
      console.error('Error loading achievement:', error);
      toast({
        title: "エラー",
        description: "実績データの読み込みに失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // 数値データを適切に変換して確認
      const dataToSave = {
        ...achievement,
        user_id: user.id,
        sales_amount: Number(achievement.sales_amount),
        new_customers: Number(achievement.new_customers),
        existing_customers: Number(achievement.existing_customers)
      };
      
      console.log('Saving data:', dataToSave);
      
      const { data, error } = await supabase
        .from('sales_achievements')
        .upsert(dataToSave, {
          onConflict: 'user_id,date'
        });

      if (error) {
        console.error('Supabase error on save:', error);
        throw error;
      }

      console.log('Save successful');
      toast({
        title: "成功",
        description: "営業実績を保存しました。",
      });

      // 再度データをロードして最新の状態を反映
      loadAchievement();
      
      // 成功コールバックがあれば呼び出す
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast({
        title: "エラー",
        description: "営業実績の保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 数値フィールドの場合は数値に変換し、テキストフィールドの場合はそのまま保存
    const newValue = name === 'description' ? value : Number(value);
    
    setAchievement(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sales_amount">売上金額</Label>
        <Input
          id="sales_amount"
          name="sales_amount"
          type="number"
          value={achievement.sales_amount}
          onChange={handleChange}
          min={0}
          step="0.01" // 小数点以下の入力をサポート
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new_customers">新規顧客数</Label>
        <Input
          id="new_customers"
          name="new_customers"
          type="number"
          value={achievement.new_customers}
          onChange={handleChange}
          min={0}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="existing_customers">既存顧客数</Label>
        <Input
          id="existing_customers"
          name="existing_customers"
          type="number"
          value={achievement.existing_customers}
          onChange={handleChange}
          min={0}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">備考</Label>
        <Textarea
          id="description"
          name="description"
          value={achievement.description || ''}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "保存中..." : "保存"}
      </Button>
    </form>
  );
};