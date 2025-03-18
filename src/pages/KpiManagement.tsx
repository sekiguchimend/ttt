import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEmployee } from '@/context/EmployeeContext';
import { KpiMetric, KpiType, KPI_TYPE_OPTIONS, KPI_CATEGORIES } from '@/types/kpi';
import { Employee } from '@/types/employee';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/layout/Dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { KpiEmployeeDashboard } from '@/components/kpi/KpiEmployeeDashboard';

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

// KPI管理画面本体
const KpiManagement = () => {
  const { isAuthenticated, loading: authLoading, isAdmin, user } = useAuth();
  const { employees, loading: employeeLoading } = useEmployee();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>("employees");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedKpiType, setSelectedKpiType] = useState<string>("");
  
  // サンプルKPIデータ
  const kpiData: KpiMetric[] = [
    {
      id: '1',
      userId: '2',
      type: 'appointments',
      name: 'アポイント件数',
      category: 'sales',
      value: 12,
      minimumTarget: 10,
      standardTarget: 15,
      stretchTarget: 20,
      unit: '件',
      date: '2023-06-01'
    },
    {
      id: '2',
      userId: '2',
      type: 'closings',
      name: 'クロージング件数',
      category: 'sales',
      value: 3,
      minimumTarget: 3,
      standardTarget: 5,
      stretchTarget: 8,
      unit: '件',
      date: '2023-06-01'
    },
    {
      id: '3',
      userId: '3',
      type: 'contract_negotiations',
      name: '受託開発の商談',
      category: 'development',
      value: 5,
      minimumTarget: 3,
      standardTarget: 5,
      stretchTarget: 8,
      unit: '件',
      date: '2023-06-01'
    },
    {
      id: '4',
      userId: '3',
      type: 'contract_closings',
      name: '受託開発のクロージング',
      category: 'development',
      value: 2,
      minimumTarget: 1,
      standardTarget: 2,
      stretchTarget: 4,
      unit: '件',
      date: '2023-06-01'
    }
  ];
  
  // サンプル取引データ
  const transactionData: SalesTransaction[] = [
    {
      id: '1',
      employeeId: '2',
      clientName: '株式会社ABC',
      amount: 500000,
      status: '契約締結',
      date: '2023-06-01',
      notes: 'ウェブサイトリニューアル案件'
    },
    {
      id: '2',
      employeeId: '2',
      clientName: '株式会社DEF',
      amount: 300000,
      status: '商談中',
      date: '2023-06-05',
      notes: 'ECサイト構築案件'
    },
    {
      id: '3',
      employeeId: '3',
      clientName: '株式会社GHI',
      amount: 1200000,
      status: '提案済み',
      date: '2023-06-10',
      notes: 'モバイルアプリ開発案件'
    },
    {
      id: '4',
      employeeId: '3',
      clientName: '株式会社JKL',
      amount: 800000,
      status: '失注',
      date: '2023-05-20',
      notes: 'コーポレートサイト制作案件'
    }
  ];
  
  // 認証チェックとリダイレクト
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // ローディング表示
  if (authLoading || employeeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // 従業員向けKPI管理画面
  if (!isAdmin) {
    return (
      <Dashboard>
        <Header
          title="KPI管理"
          subtitle="あなたのKPI設定と進捗管理"
        />
        <div className="px-6 py-8">
          <KpiEmployeeDashboard />
        </div>
      </Dashboard>
    );
  }
  
  // 進捗状況の計算
  const calculateProgress = (value: number, target: number) => {
    return Math.min(Math.round((value / target) * 100), 100);
  };
  
  // 進捗状況に応じた色を取得
  const getProgressColor = (value: number, minimumTarget: number, standardTarget: number, stretchTarget: number) => {
    if (value >= stretchTarget) return "bg-green-600";
    if (value >= standardTarget) return "bg-green-500";
    if (value >= minimumTarget) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // 従業員のKPIを取得
  const getEmployeeKpis = (employeeId: string) => {
    return kpiData.filter(kpi => kpi.userId === employeeId);
  };
  
  // 従業員の取引を取得
  const getEmployeeTransactions = (employeeId: string) => {
    return transactionData.filter(transaction => transaction.employeeId === employeeId);
  };
  
  // 部署に基づいて推奨KPIを取得
  const getRecommendedKpiTypes = (department: string) => {
    if (department.includes('営業')) {
      return KPI_TYPE_OPTIONS.filter(option => option.category === 'sales');
    } else if (department.includes('開発') || department.includes('エンジニア')) {
      return KPI_TYPE_OPTIONS.filter(option => option.category === 'development');
    }
    return KPI_TYPE_OPTIONS;
  };
  
  // 従業員一覧コンポーネント
  const EmployeeList = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>従業員KPI管理</CardTitle>
          <CardDescription>
            従業員ごとのKPI設定と進捗状況
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>設定済みKPI</TableHead>
                <TableHead>進捗状況</TableHead>
                <TableHead>取引件数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const employeeKpis = getEmployeeKpis(employee.id);
                const employeeTransactions = getEmployeeTransactions(employee.id);
                const completedKpis = employeeKpis.filter(kpi => kpi.value >= kpi.standardTarget).length;
                const totalKpis = employeeKpis.length;
                const progressPercentage = totalKpis > 0 ? Math.round((completedKpis / totalKpis) * 100) : 0;
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      {totalKpis > 0 ? (
                        <div className="flex gap-1">
                          {employeeKpis.map(kpi => (
                            <Badge key={kpi.id} variant="outline" className="text-xs">
                              {kpi.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100">未設定</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {totalKpis > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                progressPercentage >= 80 ? "bg-green-500" : 
                                progressPercentage >= 50 ? "bg-yellow-500" : 
                                "bg-red-500"
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs w-12">
                            {progressPercentage}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employeeTransactions.length > 0 ? (
                        <Badge>{employeeTransactions.length}件</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0件</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee.id);
                          setActiveTab("employee-kpi");
                        }}
                      >
                        KPI管理
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };
  
  // 従業員KPI管理コンポーネント
  const EmployeeKpiManagement = () => {
    const employee = employees.find(e => e.id === selectedEmployee);
    const employeeKpis = getEmployeeKpis(selectedEmployee);
    const employeeTransactions = getEmployeeTransactions(selectedEmployee);
    
    if (!employee) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>従業員が見つかりません</CardTitle>
          </CardHeader>
        </Card>
      );
    }
    
    const recommendedKpiTypes = getRecommendedKpiTypes(employee.department);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{employee.name}のKPI管理</CardTitle>
              <CardDescription>
                部署: {employee.department} | 役割: {employee.role === 'admin' ? '管理者' : '従業員'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("employees")}
              >
                従業員一覧に戻る
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                KPI設定
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="kpi">
            <TabsList>
              <TabsTrigger value="kpi">KPI設定</TabsTrigger>
              <TabsTrigger value="transactions">取引情報</TabsTrigger>
            </TabsList>
            
            <TabsContent value="kpi" className="pt-4">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">現在のKPI</h3>
                {employeeKpis.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employeeKpis.map(kpi => (
                      <Card key={kpi.id} className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">{kpi.name}</h3>
                            <Badge variant={kpi.category === 'sales' ? 'default' : 'secondary'}>
                              {kpi.category === 'sales' ? '営業' : '開発'}
                            </Badge>
                          </div>
                          
                          <div className="mt-1">
                            <div className="text-2xl font-semibold">
                              {kpi.value}{kpi.unit}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              目標: {kpi.standardTarget}{kpi.unit}
                            </p>
                          </div>
                          
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                              <span>進捗</span>
                              <span>{calculateProgress(kpi.value, kpi.standardTarget)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded overflow-hidden">
                              <div 
                                className={`h-full rounded ${getProgressColor(kpi.value, kpi.minimumTarget, kpi.standardTarget, kpi.stretchTarget)}`}
                                style={{ width: `${calculateProgress(kpi.value, kpi.standardTarget)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">最低</span>
                                <span>{kpi.minimumTarget}{kpi.unit}</span>
                              </div>
                              <div className="h-1 w-full bg-muted rounded overflow-hidden">
                                <div 
                                  className={`h-full rounded ${kpi.value >= kpi.minimumTarget ? "bg-green-500" : "bg-red-500"}`}
                                  style={{ width: `${calculateProgress(kpi.value, kpi.minimumTarget)}%` }}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">普通</span>
                                <span>{kpi.standardTarget}{kpi.unit}</span>
                              </div>
                              <div className="h-1 w-full bg-muted rounded overflow-hidden">
                                <div 
                                  className={`h-full rounded ${kpi.value >= kpi.standardTarget ? "bg-green-500" : "bg-yellow-500"}`}
                                  style={{ width: `${calculateProgress(kpi.value, kpi.standardTarget)}%` }}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">いい</span>
                                <span>{kpi.stretchTarget}{kpi.unit}</span>
                              </div>
                              <div className="h-1 w-full bg-muted rounded overflow-hidden">
                                <div 
                                  className={`h-full rounded ${kpi.value >= kpi.stretchTarget ? "bg-green-600" : "bg-blue-500"}`}
                                  style={{ width: `${calculateProgress(kpi.value, kpi.stretchTarget)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" size="sm">編集</Button>
                            <Button variant="outline" size="sm" className="text-red-500">削除</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">KPIが設定されていません。「KPI設定」ボタンから設定してください。</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">推奨KPI</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {employee.department}の従業員には以下のKPIが推奨されます。
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedKpiTypes.map(kpiType => {
                    const isConfigured = employeeKpis.some(kpi => kpi.type === kpiType.value);
                    
                    return (
                      <Card key={kpiType.value} className={`p-4 ${isConfigured ? 'bg-muted/20' : ''}`}>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">{kpiType.label}</h3>
                            <Badge variant="outline">
                              {kpiType.category === 'sales' ? '営業' : kpiType.category === 'development' ? '開発' : 'その他'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            単位: {kpiType.unit}
                          </p>
                          
                          <div className="mt-2">
                            {isConfigured ? (
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                設定済み
                              </Badge>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setSelectedKpiType(kpiType.value);
                                  setIsAddDialogOpen(true);
                                }}
                              >
                                KPI設定
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions" className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">取引情報</h3>
                <Button 
                  onClick={() => setIsTransactionDialogOpen(true)}
                >
                  取引追加
                </Button>
              </div>
              
              {employeeTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>取引先</TableHead>
                      <TableHead>金額</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>日付</TableHead>
                      <TableHead>メモ</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeTransactions.map(transaction => (
                      <TableRow key={transaction.id}>
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
                            <Button variant="outline" size="sm">編集</Button>
                            <Button variant="outline" size="sm" className="text-red-500">削除</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">取引情報がありません。「取引追加」ボタンから追加してください。</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };
  
  // KPI追加フォームコンポーネント
  const KpiAddForm = () => {
    const employee = employees.find(e => e.id === selectedEmployee);
    const kpiType = selectedKpiType ? KPI_TYPE_OPTIONS.find(option => option.value === selectedKpiType) : null;
    
    const [formData, setFormData] = useState({
      userId: selectedEmployee,
      type: selectedKpiType || 'appointments',
      name: kpiType?.label || '',
      category: kpiType?.category || 'sales',
      value: 0,
      minimumTarget: 0,
      standardTarget: 0,
      stretchTarget: 0,
      unit: kpiType?.unit || '件',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === 'value' || name.includes('Target') ? Number(value) : value
      }));
    };
    
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      const selectedType = KPI_TYPE_OPTIONS.find(option => option.value === value);
      
      if (selectedType) {
        setFormData(prev => ({
          ...prev,
          type: value as KpiType,
          name: selectedType.label,
          unit: selectedType.unit,
          category: selectedType.category || 'other'
        }));
      }
    };
    
    const handleStandardTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setFormData(prev => ({
        ...prev,
        standardTarget: value,
        minimumTarget: Math.round(value * 0.7),
        stretchTarget: Math.round(value * 1.3)
      }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('KPI追加:', formData);
      setIsAddDialogOpen(false);
      setSelectedKpiType('');
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>従業員</Label>
          <div className="p-3 border rounded-md bg-muted/20">
            <div className="font-medium">{employee?.name}</div>
            <div className="text-sm text-muted-foreground">{employee?.department}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">KPIタイプ</Label>
            <select
              id="type"
              name="type"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.type}
              onChange={handleTypeChange}
            >
              <option value="" disabled>KPIタイプを選択</option>
              <optgroup label="営業KPI">
                {KPI_TYPE_OPTIONS.filter(option => option.category === 'sales').map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="開発KPI">
                {KPI_TYPE_OPTIONS.filter(option => option.category === 'development').map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="その他">
                {KPI_TYPE_OPTIONS.filter(option => option.category === 'other').map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">カテゴリ</Label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'sales' | 'development' | 'other' }))}
            >
              {KPI_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {formData.type === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="name">KPI名</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="KPI名を入力"
              required
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="value">現在の達成値</Label>
          <div className="flex">
            <Input
              id="value"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
            <span className="flex items-center ml-2">{formData.unit}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <Label>目標設定</Label>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="standardTarget">標準目標値（普通ライン）</Label>
              <div className="flex">
                <Input
                  id="standardTarget"
                  name="standardTarget"
                  type="number"
                  value={formData.standardTarget}
                  onChange={handleStandardTargetChange}
                  placeholder="0"
                  min="0"
                  required
                />
                <span className="flex items-center ml-2">{formData.unit}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                通常期待される目標値を設定します。最低ラインと高いラインは自動計算されます。
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumTarget">最低ライン</Label>
                <div className="flex">
                  <Input
                    id="minimumTarget"
                    name="minimumTarget"
                    type="number"
                    value={formData.minimumTarget}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                  <span className="flex items-center ml-2">{formData.unit}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stretchTarget">いいライン</Label>
                <div className="flex">
                  <Input
                    id="stretchTarget"
                    name="stretchTarget"
                    type="number"
                    value={formData.stretchTarget}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                  <span className="flex items-center ml-2">{formData.unit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">メモ</Label>
          <Input
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="メモや詳細情報を入力（任意）"
          />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsAddDialogOpen(false);
            setSelectedKpiType('');
          }}>キャンセル</Button>
          <Button type="submit">追加</Button>
        </DialogFooter>
      </form>
    );
  };
  
  // 取引追加フォームコンポーネント
  const TransactionAddForm = () => {
    const employee = employees.find(e => e.id === selectedEmployee);
    
    const [formData, setFormData] = useState({
      employeeId: selectedEmployee,
      clientName: '',
      amount: 0,
      status: '商談中' as '商談中' | '提案済み' | '契約締結' | '失注',
      date: new Date().toISOString().split('T')[0],
      notes: ''
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
      console.log('取引追加:', formData);
      setIsTransactionDialogOpen(false);
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>従業員</Label>
          <div className="p-3 border rounded-md bg-muted/20">
            <div className="font-medium">{employee?.name}</div>
            <div className="text-sm text-muted-foreground">{employee?.department}</div>
          </div>
        </div>
        
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
          <Input
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="メモや詳細情報を入力（任意）"
          />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>キャンセル</Button>
          <Button type="submit">追加</Button>
        </DialogFooter>
      </form>
    );
  };
  
  // KPI管理ダッシュボードコンポーネント
  const KpiDashboard = () => {
    // 部署ごとのKPI達成状況を集計
    const departmentStats = employees.reduce((acc, employee) => {
      const department = employee.department;
      const employeeKpis = getEmployeeKpis(employee.id);
      
      if (!acc[department]) {
        acc[department] = {
          totalKpis: 0,
          completedKpis: 0,
          employees: 0
        };
      }
      
      acc[department].employees += 1;
      acc[department].totalKpis += employeeKpis.length;
      acc[department].completedKpis += employeeKpis.filter(kpi => kpi.value >= kpi.standardTarget).length;
      
      return acc;
    }, {} as Record<string, { totalKpis: number, completedKpis: number, employees: number }>);
    
    // 取引状況の集計
    const transactionStats = {
      total: transactionData.length,
      inProgress: transactionData.filter(t => t.status === '商談中').length,
      proposed: transactionData.filter(t => t.status === '提案済み').length,
      closed: transactionData.filter(t => t.status === '契約締結').length,
      lost: transactionData.filter(t => t.status === '失注').length,
      totalAmount: transactionData.reduce((sum, t) => sum + t.amount, 0),
      closedAmount: transactionData.filter(t => t.status === '契約締結').reduce((sum, t) => sum + t.amount, 0)
    };
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI管理ダッシュボード</CardTitle>
          <CardDescription>
            部署ごとのKPI達成状況と取引状況
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">部署別KPI達成状況</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(departmentStats).map(([department, stats]) => {
                const progressPercentage = stats.totalKpis > 0 ? Math.round((stats.completedKpis / stats.totalKpis) * 100) : 0;
                
                return (
                  <Card key={department} className="p-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-medium">{department}</h3>
                      <p className="text-sm text-muted-foreground">従業員数: {stats.employees}名</p>
                      
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>KPI達成率</span>
                          <span>{progressPercentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              progressPercentage >= 80 ? "bg-green-500" : 
                              progressPercentage >= 50 ? "bg-yellow-500" : 
                              "bg-red-500"
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span>設定済みKPI</span>
                          <span>{stats.totalKpis}個</span>
                        </div>
                        <div className="flex justify-between">
                          <span>達成済みKPI</span>
                          <span>{stats.completedKpis}個</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">取引状況</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-4">ステータス別取引件数</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>商談中</span>
                      <span>{transactionStats.inProgress}件</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${(transactionStats.inProgress / transactionStats.total) * 100}%` }}
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
                        style={{ width: `${(transactionStats.proposed / transactionStats.total) * 100}%` }}
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
                        style={{ width: `${(transactionStats.closed / transactionStats.total) * 100}%` }}
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
                        style={{ width: `${(transactionStats.lost / transactionStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-4">最近の取引</h4>
                <div className="space-y-2">
                  {transactionData.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <div className="font-medium">{transaction.clientName}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.date} | {employees.find(e => e.id === transaction.employeeId)?.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div>{transaction.amount.toLocaleString()}円</div>
                          <Badge variant={
                            transaction.status === '契約締結' ? 'default' :
                            transaction.status === '提案済み' ? 'secondary' :
                            transaction.status === '商談中' ? 'outline' : 'destructive'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Dashboard>
      <Header
        title="KPI管理"
        subtitle="従業員のKPI設定と進捗管理"
      />
      
      <div className="px-6 pb-8">
        <div className="border-b mb-6">
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 ${activeTab === 'employees' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => {
                setActiveTab('employees');
                setSelectedEmployee('');
              }}
            >
              従業員一覧
            </button>
            {selectedEmployee && (
              <button 
                className={`px-4 py-2 ${activeTab === 'employee-kpi' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('employee-kpi')}
              >
                従業員KPI管理
              </button>
            )}
            <button 
              className={`px-4 py-2 ${activeTab === 'dashboard' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              KPIダッシュボード
            </button>
          </div>
        </div>
        
        {activeTab === 'employees' && <EmployeeList />}
        {activeTab === 'employee-kpi' && selectedEmployee && <EmployeeKpiManagement />}
        {activeTab === 'dashboard' && <KpiDashboard />}
      </div>
      
      {/* KPI追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>KPI設定</DialogTitle>
            <DialogDescription>
              従業員のKPI項目を設定します。各フィールドに値を入力してください。
            </DialogDescription>
          </DialogHeader>
          <KpiAddForm />
        </DialogContent>
      </Dialog>
      
      {/* 取引追加ダイアログ */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>取引情報追加</DialogTitle>
            <DialogDescription>
              従業員の取引情報を追加します。各フィールドに値を入力してください。
            </DialogDescription>
          </DialogHeader>
          <TransactionAddForm />
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default KpiManagement;
