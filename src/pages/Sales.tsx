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

// 取引情報の型定義
interface SalesTransaction {
  id: string;
  employeeId: string;
  clientName: string;
  amount: number;
  status: '商談中' | '提案済み' | '契約締結' | '失注';
  date: string;
  notes?: string;
}

// 営業管理画面
const Sales = () => {
  const { isAuthenticated, loading: authLoading, user, isAdmin } = useAuth();
  const { employees, loading: employeeLoading } = useEmployee();
  const { loading: financialLoading } = useFinancial();
  const navigate = useNavigate();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SalesTransaction | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [mainTab, setMainTab] = useState<string>("sales");
  
  // サンプル取引データ
  const [transactions, setTransactions] = useState<SalesTransaction[]>([
    {
      id: '1',
      employeeId: '1', // 管理者
      clientName: '株式会社ABC',
      amount: 500000,
      status: '契約締結',
      date: '2023-06-01',
      notes: 'ウェブサイトリニューアル案件'
    },
    {
      id: '2',
      employeeId: '2', // 山田太郎
      clientName: '株式会社DEF',
      amount: 300000,
      status: '商談中',
      date: '2023-06-05',
      notes: 'ECサイト構築案件'
    },
    {
      id: '3',
      employeeId: '2', // 山田太郎
      clientName: '株式会社GHI',
      amount: 1200000,
      status: '提案済み',
      date: '2023-06-10',
      notes: 'モバイルアプリ開発案件'
    },
    {
      id: '4',
      employeeId: '1', // 管理者
      clientName: '株式会社JKL',
      amount: 800000,
      status: '失注',
      date: '2023-05-20',
      notes: 'コーポレートサイト制作案件'
    }
  ]);
  
  // 認証チェックとリダイレクト
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // ローディング表示
  if (authLoading || employeeLoading || financialLoading) {
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
      return transactions.filter(t => t.employeeId === user?.id);
    }
    
    if (activeTab === 'all') {
      // 全ての取引を表示
      return transactions;
    } else if (activeTab === 'employee' && selectedEmployeeId) {
      // 選択した従業員の取引を表示
      return transactions.filter(t => t.employeeId === selectedEmployeeId);
    }
    
    return transactions;
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  // 取引追加
  const handleAddTransaction = (transaction: Omit<SalesTransaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    setTransactions([...transactions, newTransaction]);
    setIsAddDialogOpen(false);
  };
  
  // 取引編集
  const handleEditTransaction = (transaction: SalesTransaction) => {
    const updatedTransactions = transactions.map(t => 
      t.id === transaction.id ? transaction : t
    );
    
    setTransactions(updatedTransactions);
    setIsEditDialogOpen(false);
    setSelectedTransaction(null);
  };
  
  // 取引削除
  const handleDeleteTransaction = (id: string) => {
    if (confirm('この取引を削除してもよろしいですか？')) {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
    }
  };
  
  // 取引フォームコンポーネント
  const TransactionForm = ({ 
    initialData, 
    onSubmit, 
    onCancel 
  }: { 
    initialData?: SalesTransaction, 
    onSubmit: (data: any) => void, 
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      employeeId: initialData?.employeeId || user?.id || '',
      clientName: initialData?.clientName || '',
      amount: initialData?.amount || 0,
      status: initialData?.status || '商談中' as '商談中' | '提案済み' | '契約締結' | '失注',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      notes: initialData?.notes || ''
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
      
      if (initialData) {
        onSubmit({ ...formData, id: initialData.id });
      } else {
        onSubmit(formData);
      }
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
              required
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
    const employeeTransactions = transactions.filter(t => t.employeeId === employee.id);
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
        </Tabs>
        
        <TabsContent value="sales" className={mainTab === "sales" ? "block" : "hidden"}>
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
                  {isAdmin && activeTab === 'all' && <TableHead>担当者</TableHead>}
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
                      {isAdmin && activeTab === 'all' && (
                        <TableCell>
                          {employees.find(e => e.id === transaction.employeeId)?.name || '不明'}
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{transaction.clientName}</TableCell>
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
                      <TableCell className="max-w-[200px] truncate">{transaction.notes}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            編集
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            削除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin && activeTab === 'all' ? 7 : 6} className="text-center h-24">
                      取引情報がありません。「取引追加」ボタンから追加してください。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="mt-8">
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
              </div>
            </CardContent>
          </Card>
        </div>
        </TabsContent>
        
        <TabsContent value="financial" className={mainTab === "financial" ? "block" : "hidden"}>
          <FinancialDashboard />
        </TabsContent>
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
    </Dashboard>
  );
};

export default Sales;
