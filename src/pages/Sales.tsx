import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEmployee } from '@/context/EmployeeContext';
import { useFinancial } from '@/context/FinancialContext';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/layout/Dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SalesAchievementForm } from '@/components/sales/SalesAchievementForm';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialDashboard from '@/components/financial/FinancialDashboard';
import FinancialTransactionForm from '@/components/financial/FinancialTransactionForm';
import { format } from 'date-fns';
import { SalesAchievementList } from '@/components/sales/SalesAchievementList';

// 取引情報の型定義を修正
interface SalesTransaction {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  status: '商談中' | '提案済み' | '契約締結' | '失注';
  date: string;
  category: string;
  description?: string;
  user_name?: string; // Modified from nested user object
}

// 営業管理画面
const Sales = () => {
  const { isAuthenticated, loading: authLoading, user, isAdmin } = useAuth();
  const { employees, loading: employeeLoading } = useEmployee();
  const { loading: financialLoading } = useFinancial();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SalesTransaction | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [mainTab, setMainTab] = useState<string>("sales");
  const [achievementDate, setAchievementDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // 取引データ
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // 認証チェックとリダイレクト
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // ユーザーがログインしたら取引データを読み込む
  useEffect(() => {
    if (user) {
      loadTransactions();
      loadAchievements();
    }
  }, [user]);
  
  // 取引データを読み込む
  const loadTransactions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fix: Directly query transactions without trying to join with user
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      // 管理者でない場合は自分の取引のみ取得
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading transactions:', error);
        throw error;
      }
      
      // Add user names to the transactions
      const enhancedTransactions = await Promise.all(
        (data || []).map(async (transaction) => {
          // Get user information separately
          if (transaction.user_id) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('name')
              .eq('id', transaction.user_id)
              .single();
            
            if (!userError && userData) {
              return {
                ...transaction,
                user_name: userData.name
              };
            }
          }
          
          return {
            ...transaction,
            user_name: '不明'
          };
        })
      );
      
      console.log('Loaded transactions:', enhancedTransactions);
      setTransactions(enhancedTransactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: "エラー",
        description: "取引データの読み込みに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAchievements = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('sales_achievements')
        .select('*')
        .order('date', { ascending: false });

      // 管理者の場合は全ての取引を表示、従業員の場合は自分の取引のみ表示
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast({
        title: 'エラー',
        description: '取引データの読み込みに失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // ローディング表示
  if (authLoading || employeeLoading || financialLoading || isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // 表示する取引データをフィルタリング
  const getFilteredTransactions = () => {
    if (!isAdmin) {
      // 一般ユーザーは自分の取引のみ表示
      return transactions.filter(t => t.user_id === user?.id);
    }
    
    if (activeTab === 'all') {
      // 全ての取引を表示
      return transactions;
    } else if (activeTab === 'employee' && selectedEmployeeId) {
      // 選択した従業員の取引を表示
      return transactions.filter(t => t.user_id === selectedEmployeeId);
    }
    
    return transactions;
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  // 取引追加
  const handleAddTransaction = async (transactionData: any) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // フォームデータをSupabaseのテーブル形式に変換
      const newTransaction = {
        user_id: user.id,
        name: transactionData.clientName,
        amount: Math.round(Number(transactionData.amount || 0)),
        date: transactionData.date,
        status: transactionData.status,
        category: transactionData.status, // ステータスをカテゴリーとして使用
        description: transactionData.notes
      };
      
      console.log('Saving transaction to Supabase:', newTransaction);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select();
      
      if (error) {
        console.error('Error saving transaction:', error);
        throw error;
      }
      
      console.log('Transaction saved:', data);
      
      toast({
        title: "成功",
        description: "取引を追加しました。",
      });
      
      // 取引データを再読み込み
      loadTransactions();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast({
        title: "エラー",
        description: "取引の追加に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 取引編集
  const handleEditTransaction = async (transactionData: any) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // フォームデータをSupabaseのテーブル形式に変換
      const updatedTransaction = {
        name: transactionData.clientName,
        amount: Math.round(Number(transactionData.amount || 0)),
        date: transactionData.date,
        status: transactionData.status,
        category: transactionData.status, // ステータスをカテゴリーとして使用
        description: transactionData.notes
      };
      
      console.log('Updating transaction in Supabase:', updatedTransaction);
      
      const { data, error } = await supabase
        .from('transactions')
        .update(updatedTransaction)
        .eq('id', transactionData.id)
        .select();
      
      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }
      
      console.log('Transaction updated:', data);
      
      toast({
        title: "成功",
        description: "取引を更新しました。",
      });
      
      // 取引データを再読み込み
      loadTransactions();
      setIsEditDialogOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
      toast({
        title: "エラー",
        description: "取引の更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 取引削除
  const handleDeleteTransaction = async (id: string) => {
    if (!user || !confirm('この取引を削除してもよろしいですか？')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting transaction:', error);
        throw error;
      }
      
      toast({
        title: "成功",
        description: "取引を削除しました。",
      });
      
      // 取引データを再読み込み
      loadTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast({
        title: "エラー",
        description: "取引の削除に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 営業実績ダイアログを開く
  const openAchievementDialog = (date: Date = new Date()) => {
    setAchievementDate(date);
    setIsAchievementDialogOpen(true);
  };

  // 営業実績の保存成功時の処理
  const handleAchievementSuccess = () => {
    toast({
      title: "成功",
      description: "営業実績を保存しました。",
    });
    setIsAchievementDialogOpen(false);
    loadAchievements(); // Reload achievements after successful save
  };
  
  // 取引フォームコンポーネント
  const TransactionForm = ({ 
    initialData, 
    onSubmit, 
    onCancel 
  }: { 
    initialData?: any, 
    onSubmit: (data: any) => void, 
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      id: initialData?.id || '',
      employeeId: initialData?.user_id || user?.id || '',
      clientName: initialData?.name || '',
      amount: initialData?.amount || 0,
      status: initialData?.status || '商談中' as '商談中' | '提案済み' | '契約締結' | '失注',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      notes: initialData?.description || ''
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === 'amount' ? Number(value) : value
      }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {isAdmin && (
          <div className="space-y-2">
            <Label htmlFor="employeeId">担当者</Label>
            <select
              id="employeeId"
              name="employeeId"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.employeeId}
              onChange={handleChange}
              disabled={isLoading}
            >
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.department})
                </option>
              ))}
            </select>
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
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">金額</Label>
          <div className="flex">
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="1" // 整数のみ
              required
              disabled={isLoading}
            />
            <span className="flex items-center ml-2">円</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">ステータス</Label>
          <select
            id="status"
            name="status"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="商談中">商談中</option>
            <option value="提案済み">提案済み</option>
            <option value="契約締結">契約締結</option>
            <option value="失注">失注</option>
          </select>
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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "保存中..." : initialData ? '更新' : '追加'}
          </Button>
        </DialogFooter>
      </form>
    );
  };
  
  // 取引状況の集計
  const transactionStats = {
    total: filteredTransactions.length,
    inProgress: filteredTransactions.filter(t => t.status === '商談中').length,
    proposed: filteredTransactions.filter(t => t.status === '提案済み').length,
    closed: filteredTransactions.filter(t => t.status === '契約締結').length,
    lost: filteredTransactions.filter(t => t.status === '失注').length,
    totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    closedAmount: filteredTransactions.filter(t => t.status === '契約締結').reduce((sum, t) => sum + t.amount, 0)
  };
  
  // 従業員ごとの取引集計（管理者用）
  const employeeTransactionStats = employees.map(employee => {
    const employeeTransactions = transactions.filter(t => t.user_id === employee.id);
    return {
      employee,
      total: employeeTransactions.length,
      closed: employeeTransactions.filter(t => t.status === '契約締結').length,
      totalAmount: employeeTransactions.reduce((sum, t) => sum + t.amount, 0),
      closedAmount: employeeTransactions.filter(t => t.status === '契約締結').reduce((sum, t) => sum + t.amount, 0)
    };
  });
  
  return (
    <Dashboard>
      <Header
        title="営業・財務管理"
        subtitle="取引情報と財務状況の管理"
      />
      
      <div className="px-6 pb-8">
        <Tabs value={mainTab} onValueChange={setMainTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sales">営業管理</TabsTrigger>
            <TabsTrigger value="financial">財務レポート</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">営業データ</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={format(achievementDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value) : new Date();
                      setAchievementDate(newDate);
                    }}
                    className="w-40"
                  />
                  <Button 
                    onClick={() => openAchievementDialog(achievementDate)} 
                    variant="outline"
                  >
                    営業実績を記録
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-muted-foreground">総取引件数</h3>
                  <div className="text-2xl font-semibold">{transactionStats.total}件</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-muted-foreground">成約件数</h3>
                  <div className="text-2xl font-semibold">{transactionStats.closed}件</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-muted-foreground">総取引金額</h3>
                  <div className="text-2xl font-semibold">{transactionStats.totalAmount.toLocaleString()}円</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-muted-foreground">成約金額</h3>
                  <div className="text-2xl font-semibold">{transactionStats.closedAmount.toLocaleString()}円</div>
                </div>
              </Card>
            </div>
            
            {isAdmin && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>従業員別取引状況</CardTitle>
                    <CardDescription>
                      従業員ごとの取引件数と金額
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>従業員名</TableHead>
                          <TableHead>部署</TableHead>
                          <TableHead>総取引件数</TableHead>
                          <TableHead>成約件数</TableHead>
                          <TableHead>総取引金額</TableHead>
                          <TableHead>成約金額</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employeeTransactionStats.map(stat => (
                          <TableRow key={stat.employee.id}>
                            <TableCell className="font-medium">{stat.employee.name}</TableCell>
                            <TableCell>{stat.employee.department}</TableCell>
                            <TableCell>{stat.total}件</TableCell>
                            <TableCell>{stat.closed}件</TableCell>
                            <TableCell>{stat.totalAmount.toLocaleString()}円</TableCell>
                            <TableCell>{stat.closedAmount.toLocaleString()}円</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployeeId(stat.employee.id);
                                  setActiveTab("employee");
                                }}
                              >
                                詳細
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>取引一覧</CardTitle>
                    <CardDescription>
                      {isAdmin ? '全従業員の取引情報' : 'あなたの取引情報'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all">全従業員</TabsTrigger>
                            <TabsTrigger value="employee">従業員別</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="employee" className="pt-2">
                            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                              <SelectTrigger>
                                <SelectValue placeholder="従業員を選択" />
                              </SelectTrigger>
                              <SelectContent>
                                {employees.map(employee => (
                                  <SelectItem key={employee.id} value={employee.id}>
                                    {employee.name} ({employee.department})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      取引追加
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && <TableHead>担当者</TableHead>}
                      <TableHead>取引先</TableHead>
                      <TableHead>金額</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>日付</TableHead>
                      <TableHead>メモ</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          {isAdmin && (
                            <TableCell>
                              {transaction.user_name || '不明'}
                            </TableCell>
                          )}
                          <TableCell className="font-medium">{transaction.name}</TableCell>
                          <TableCell>{transaction.amount.toLocaleString()}円</TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.status === '契約締結' ? 'default' :
                              transaction.status === '提案済み' ? 'secondary' :
                              transaction.status === '商談中' ? 'outline' : 'destructive'
                            }>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setIsEditDialogOpen(true);
                                }}
                                disabled={isLoading}
                              >
                                編集
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                disabled={isLoading}
                              >
                                削除
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 7 : 6} className="text-center h-24">
                          取引情報がありません。「取引追加」ボタンから追加してください。
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>取引状況</CardTitle>
                  <CardDescription>
                    ステータス別の取引件数
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>契約締結</span>
                        <span>{transactionStats.closed}件</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full">
                        <div 
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${transactionStats.total > 0 ? (transactionStats.closed / transactionStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>失注</span>
                        <span>{transactionStats.lost}件</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full">
                        <div 
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${transactionStats.total > 0 ? (transactionStats.lost / transactionStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>商談中</span>
                        <span>{transactionStats.inProgress}件</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${transactionStats.total > 0 ? (transactionStats.inProgress / transactionStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>提案済み</span>
                        <span>{transactionStats.proposed}件</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full">
                        <div 
                          className="h-2 rounded-full bg-yellow-500"
                          style={{ width: `${transactionStats.total > 0 ? (transactionStats.proposed / transactionStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="financial">
            <FinancialDashboard />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 取引追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>取引情報追加</DialogTitle>
            <DialogDescription>
              新しい取引情報を追加します。各フィールドに値を入力してください。
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            onSubmit={handleAddTransaction}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* 取引編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>取引情報編集</DialogTitle>
            <DialogDescription>
              取引情報を編集します。
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionForm 
              initialData={selectedTransaction}
              onSubmit={handleEditTransaction}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTransaction(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 営業実績記録ダイアログ */}
      <Dialog open={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>営業実績の記録</DialogTitle>
            <DialogDescription>
              {format(achievementDate, 'yyyy年MM月dd日')}の営業実績を記録します。
            </DialogDescription>
          </DialogHeader>
          <SalesAchievementForm 
            date={achievementDate}
            onSuccess={handleAchievementSuccess}
          />
        </DialogContent>
      </Dialog>

    </Dashboard>
  );
};

export default Sales;