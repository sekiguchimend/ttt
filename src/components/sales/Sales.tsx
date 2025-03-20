import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { SalesAchievementForm } from './SalesAchievementForm';

interface SalesAchievement {
  id: string;
  user_id: string;
  date: string;
  sales_amount: number;
  new_customers: number;
  existing_customers: number;
  description?: string;
}

interface Transaction {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const Sales: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [achievements, setAchievements] = useState<SalesAchievement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    name: '',
    amount: 0,
    category: '売上',
    status: '商談中',
    description: ''
  });

  useEffect(() => {
    if (user) {
      loadAchievements();
      loadTransactions();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast({
        title: "エラー",
        description: "営業実績の読み込みに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "エラー",
        description: "取引データの読み込みに失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const handleSuccess = () => {
    loadAchievements();
    loadTransactions();
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsTransactionLoading(true);

    try {
      const transactionData = {
        ...newTransaction,
        user_id: user.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        amount: Math.round(Number(newTransaction.amount || 0)),
        status: newTransaction.status || '商談中'
      };

      console.log('Saving transaction:', transactionData);

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Saved transaction:', data);

      toast({
        title: "成功",
        description: "取引を追加しました。",
      });

      // フォームをリセット
      setNewTransaction({
        name: '',
        amount: 0,
        category: '売上',
        status: '商談中',
        description: ''
      });

      // 取引一覧を更新
      loadTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "エラー",
        description: "取引の追加に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsTransactionLoading(false);
    }
  };

  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="space-y-2">
          <Label htmlFor="date">日付</Label>
          <Input
            id="date"
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
          />
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">営業実績入力</h2>
          <SalesAchievementForm
            date={selectedDate}
            onSuccess={handleSuccess}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">取引追加</h2>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">取引名</Label>
              <Input
                id="name"
                name="name"
                value={newTransaction.name}
                onChange={handleTransactionChange}
                required
                disabled={isTransactionLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">金額</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={newTransaction.amount}
                onChange={handleTransactionChange}
                min={0}
                step="1" // 整数のみ入力
                required
                disabled={isTransactionLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">カテゴリー</Label>
              <Input
                id="category"
                name="category"
                value={newTransaction.category}
                onChange={handleTransactionChange}
                required
                disabled={isTransactionLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Input
                id="status"
                name="status"
                value={newTransaction.status}
                onChange={handleTransactionChange}
                required
                disabled={isTransactionLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">備考</Label>
              <Textarea
                id="description"
                name="description"
                value={newTransaction.description}
                onChange={handleTransactionChange}
                disabled={isTransactionLoading}
              />
            </div>

            <Button type="submit" disabled={isTransactionLoading}>
              {isTransactionLoading ? "保存中..." : "取引を追加"}
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">取引一覧</h2>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{transaction.name}</span>
                    <span className="text-lg font-bold">
                      ¥{transaction.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">カテゴリー:</span>{' '}
                      {transaction.category}
                    </div>
                    <div>
                      <span className="font-medium">日付:</span>{' '}
                      {format(new Date(transaction.date), 'yyyy年MM月dd日')}
                    </div>
                  </div>
                  {transaction.description && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">備考:</span>{' '}
                      {transaction.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">取引データがありません。</div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">実績一覧</h2>
          {isLoading ? (
            <div>読み込み中...</div>
          ) : achievements.length > 0 ? (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {format(new Date(achievement.date), 'yyyy年MM月dd日')}
                    </span>
                    <span className="text-lg font-bold">
                      ¥{achievement.sales_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">新規顧客:</span>{' '}
                      {achievement.new_customers}名
                    </div>
                    <div>
                      <span className="font-medium">既存顧客:</span>{' '}
                      {achievement.existing_customers}名
                    </div>
                  </div>
                  {achievement.description && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">備考:</span>{' '}
                      {achievement.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">実績データがありません。</div>
          )}
        </div>
      </div>
    </div>
  );
};