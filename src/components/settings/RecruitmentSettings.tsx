import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { PlusIcon, Pencil, Trash2 } from 'lucide-react';

// 採用KPI目標の型定義
interface RecruitmentKpiTarget {
  id: string;
  position: string;
  applicationsTarget: number;
  screeningsTarget: number;
  firstInterviewsTarget: number;
  secondInterviewsTarget: number;
  finalInterviewsTarget: number;
  offersTarget: number;
  hiresTarget: number;
}

// 採用プロセスステップの型定義
interface RecruitmentProcessStep {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  order: number;
}

// 評価項目の型定義
interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'communication' | 'cultureFit' | 'other';
  isRequired: boolean;
}

const RecruitmentSettings = () => {
  const { isAdmin } = useAuth();
  
  // 採用KPI目標のサンプルデータ
  const [kpiTargets, setKpiTargets] = useState<RecruitmentKpiTarget[]>([
    {
      id: '1',
      position: 'フロントエンドエンジニア',
      applicationsTarget: 20,
      screeningsTarget: 15,
      firstInterviewsTarget: 10,
      secondInterviewsTarget: 5,
      finalInterviewsTarget: 3,
      offersTarget: 2,
      hiresTarget: 2
    },
    {
      id: '2',
      position: 'バックエンドエンジニア',
      applicationsTarget: 15,
      screeningsTarget: 10,
      firstInterviewsTarget: 8,
      secondInterviewsTarget: 4,
      finalInterviewsTarget: 2,
      offersTarget: 2,
      hiresTarget: 1
    },
    {
      id: '3',
      position: '営業担当',
      applicationsTarget: 25,
      screeningsTarget: 20,
      firstInterviewsTarget: 15,
      secondInterviewsTarget: 8,
      finalInterviewsTarget: 5,
      offersTarget: 3,
      hiresTarget: 3
    }
  ]);
  
  // 採用プロセスステップのサンプルデータ
  const [processSteps, setProcessSteps] = useState<RecruitmentProcessStep[]>([
    {
      id: '1',
      name: '書類選考',
      description: '応募者の履歴書と職務経歴書を確認',
      isRequired: true,
      order: 1
    },
    {
      id: '2',
      name: '一次面接',
      description: '基本的なスキルと適性の確認',
      isRequired: true,
      order: 2
    },
    {
      id: '3',
      name: '技術テスト',
      description: '実際の技術力を評価するためのテスト',
      isRequired: false,
      order: 3
    },
    {
      id: '4',
      name: '二次面接',
      description: '部門責任者との面接',
      isRequired: true,
      order: 4
    },
    {
      id: '5',
      name: '最終面接',
      description: '経営陣との面接',
      isRequired: true,
      order: 5
    }
  ]);
  
  // 評価項目のサンプルデータ
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>([
    {
      id: '1',
      name: '技術力',
      description: '必要な技術スキルを持っているか',
      category: 'technical',
      isRequired: true
    },
    {
      id: '2',
      name: '問題解決能力',
      description: '複雑な問題を解決する能力',
      category: 'technical',
      isRequired: true
    },
    {
      id: '3',
      name: 'コミュニケーション能力',
      description: '明確に考えを伝える能力',
      category: 'communication',
      isRequired: true
    },
    {
      id: '4',
      name: 'チームワーク',
      description: 'チームでの協力と貢献',
      category: 'communication',
      isRequired: true
    },
    {
      id: '5',
      name: '文化適合性',
      description: '会社の価値観や文化との適合性',
      category: 'cultureFit',
      isRequired: true
    },
    {
      id: '6',
      name: '成長マインドセット',
      description: '学習と成長への意欲',
      category: 'cultureFit',
      isRequired: false
    }
  ]);
  
  // ダイアログの状態
  const [isAddKpiTargetDialogOpen, setIsAddKpiTargetDialogOpen] = useState(false);
  const [isEditKpiTargetDialogOpen, setIsEditKpiTargetDialogOpen] = useState(false);
  const [selectedKpiTarget, setSelectedKpiTarget] = useState<RecruitmentKpiTarget | null>(null);
  
  const [isAddProcessStepDialogOpen, setIsAddProcessStepDialogOpen] = useState(false);
  const [isEditProcessStepDialogOpen, setIsEditProcessStepDialogOpen] = useState(false);
  const [selectedProcessStep, setSelectedProcessStep] = useState<RecruitmentProcessStep | null>(null);
  
  const [isAddCriterionDialogOpen, setIsAddCriterionDialogOpen] = useState(false);
  const [isEditCriterionDialogOpen, setIsEditCriterionDialogOpen] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<EvaluationCriterion | null>(null);
  
  // KPI目標のフォームデータ
  const [kpiTargetFormData, setKpiTargetFormData] = useState<Omit<RecruitmentKpiTarget, 'id'>>({
    position: '',
    applicationsTarget: 0,
    screeningsTarget: 0,
    firstInterviewsTarget: 0,
    secondInterviewsTarget: 0,
    finalInterviewsTarget: 0,
    offersTarget: 0,
    hiresTarget: 0
  });
  
  // プロセスステップのフォームデータ
  const [processStepFormData, setProcessStepFormData] = useState<Omit<RecruitmentProcessStep, 'id'>>({
    name: '',
    description: '',
    isRequired: true,
    order: 0
  });
  
  // 評価項目のフォームデータ
  const [criterionFormData, setCriterionFormData] = useState<Omit<EvaluationCriterion, 'id'>>({
    name: '',
    description: '',
    category: 'technical',
    isRequired: true
  });
  
  // 入力ハンドラー
  const handleKpiTargetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKpiTargetFormData(prev => ({
      ...prev,
      [name]: name.includes('Target') ? Number(value) : value
    }));
  };
  
  const handleProcessStepInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProcessStepFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? Number(value) : value
    }));
  };
  
  const handleCriterionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCriterionFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // KPI目標の追加
  const handleAddKpiTarget = () => {
    const newKpiTarget: RecruitmentKpiTarget = {
      id: Math.random().toString(36).substring(2, 9),
      ...kpiTargetFormData
    };
    
    setKpiTargets([...kpiTargets, newKpiTarget]);
    setIsAddKpiTargetDialogOpen(false);
    setKpiTargetFormData({
      position: '',
      applicationsTarget: 0,
      screeningsTarget: 0,
      firstInterviewsTarget: 0,
      secondInterviewsTarget: 0,
      finalInterviewsTarget: 0,
      offersTarget: 0,
      hiresTarget: 0
    });
    
    toast({
      title: "KPI目標を追加しました",
      description: `${kpiTargetFormData.position}のKPI目標を追加しました。`,
    });
  };
  
  // KPI目標の編集
  const handleEditKpiTarget = () => {
    if (!selectedKpiTarget) return;
    
    const updatedKpiTargets = kpiTargets.map(target => 
      target.id === selectedKpiTarget.id
        ? { ...target, ...kpiTargetFormData }
        : target
    );
    
    setKpiTargets(updatedKpiTargets);
    setIsEditKpiTargetDialogOpen(false);
    setSelectedKpiTarget(null);
    
    toast({
      title: "KPI目標を更新しました",
      description: `${kpiTargetFormData.position}のKPI目標を更新しました。`,
    });
  };
  
  // KPI目標の削除
  const handleDeleteKpiTarget = (id: string) => {
    if (confirm('このKPI目標を削除してもよろしいですか？')) {
      const filteredKpiTargets = kpiTargets.filter(target => target.id !== id);
      setKpiTargets(filteredKpiTargets);
      
      toast({
        title: "KPI目標を削除しました",
        description: "KPI目標を削除しました。",
      });
    }
  };
  
  // プロセスステップの追加
  const handleAddProcessStep = () => {
    const newProcessStep: RecruitmentProcessStep = {
      id: Math.random().toString(36).substring(2, 9),
      ...processStepFormData,
      order: processSteps.length + 1
    };
    
    setProcessSteps([...processSteps, newProcessStep]);
    setIsAddProcessStepDialogOpen(false);
    setProcessStepFormData({
      name: '',
      description: '',
      isRequired: true,
      order: 0
    });
    
    toast({
      title: "プロセスステップを追加しました",
      description: `${processStepFormData.name}ステップを追加しました。`,
    });
  };
  
  // プロセスステップの編集
  const handleEditProcessStep = () => {
    if (!selectedProcessStep) return;
    
    const updatedProcessSteps = processSteps.map(step => 
      step.id === selectedProcessStep.id
        ? { ...step, ...processStepFormData }
        : step
    );
    
    setProcessSteps(updatedProcessSteps);
    setIsEditProcessStepDialogOpen(false);
    setSelectedProcessStep(null);
    
    toast({
      title: "プロセスステップを更新しました",
      description: `${processStepFormData.name}ステップを更新しました。`,
    });
  };
  
  // プロセスステップの削除
  const handleDeleteProcessStep = (id: string) => {
    if (confirm('このプロセスステップを削除してもよろしいですか？')) {
      const filteredProcessSteps = processSteps.filter(step => step.id !== id);
      // ステップの順序を更新
      const reorderedSteps = filteredProcessSteps.map((step, index) => ({
        ...step,
        order: index + 1
      }));
      
      setProcessSteps(reorderedSteps);
      
      toast({
        title: "プロセスステップを削除しました",
        description: "プロセスステップを削除しました。",
      });
    }
  };
  
  // 評価項目の追加
  const handleAddCriterion = () => {
    const newCriterion: EvaluationCriterion = {
      id: Math.random().toString(36).substring(2, 9),
      ...criterionFormData
    };
    
    setEvaluationCriteria([...evaluationCriteria, newCriterion]);
    setIsAddCriterionDialogOpen(false);
    setCriterionFormData({
      name: '',
      description: '',
      category: 'technical',
      isRequired: true
    });
    
    toast({
      title: "評価項目を追加しました",
      description: `${criterionFormData.name}評価項目を追加しました。`,
    });
  };
  
  // 評価項目の編集
  const handleEditCriterion = () => {
    if (!selectedCriterion) return;
    
    const updatedCriteria = evaluationCriteria.map(criterion => 
      criterion.id === selectedCriterion.id
        ? { ...criterion, ...criterionFormData }
        : criterion
    );
    
    setEvaluationCriteria(updatedCriteria);
    setIsEditCriterionDialogOpen(false);
    setSelectedCriterion(null);
    
    toast({
      title: "評価項目を更新しました",
      description: `${criterionFormData.name}評価項目を更新しました。`,
    });
  };
  
  // 評価項目の削除
  const handleDeleteCriterion = (id: string) => {
    if (confirm('この評価項目を削除してもよろしいですか？')) {
      const filteredCriteria = evaluationCriteria.filter(criterion => criterion.id !== id);
      setEvaluationCriteria(filteredCriteria);
      
      toast({
        title: "評価項目を削除しました",
        description: "評価項目を削除しました。",
      });
    }
  };
  
  // 設定の保存
  const handleSaveSettings = () => {
    toast({
      title: "採用設定を保存しました",
      description: "採用設定が正常に更新されました。",
    });
  };
  
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>採用設定</CardTitle>
          <CardDescription>
            採用プロセスとKPIの設定を管理します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            この設定は管理者のみがアクセスできます。
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>採用設定</CardTitle>
        <CardDescription>
          採用プロセスとKPIの設定を管理します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="kpi-targets">
          <TabsList className="mb-4">
            <TabsTrigger value="kpi-targets">KPI目標</TabsTrigger>
            <TabsTrigger value="process">採用プロセス</TabsTrigger>
            <TabsTrigger value="evaluation">評価項目</TabsTrigger>
          </TabsList>
          
          {/* KPI目標タブ */}
          <TabsContent value="kpi-targets">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">採用KPI目標設定</h3>
              <Button onClick={() => setIsAddKpiTargetDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                KPI目標追加
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ポジション</TableHead>
                  <TableHead>応募数</TableHead>
                  <TableHead>書類選考</TableHead>
                  <TableHead>一次面接</TableHead>
                  <TableHead>二次面接</TableHead>
                  <TableHead>最終面接</TableHead>
                  <TableHead>内定</TableHead>
                  <TableHead>入社</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpiTargets.map(target => (
                  <TableRow key={target.id}>
                    <TableCell className="font-medium">{target.position}</TableCell>
                    <TableCell>{target.applicationsTarget}</TableCell>
                    <TableCell>{target.screeningsTarget}</TableCell>
                    <TableCell>{target.firstInterviewsTarget}</TableCell>
                    <TableCell>{target.secondInterviewsTarget}</TableCell>
                    <TableCell>{target.finalInterviewsTarget}</TableCell>
                    <TableCell>{target.offersTarget}</TableCell>
                    <TableCell>{target.hiresTarget}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedKpiTarget(target);
                          setKpiTargetFormData({
                            position: target.position,
                            applicationsTarget: target.applicationsTarget,
                            screeningsTarget: target.screeningsTarget,
                            firstInterviewsTarget: target.firstInterviewsTarget,
                            secondInterviewsTarget: target.secondInterviewsTarget,
                            finalInterviewsTarget: target.finalInterviewsTarget,
                            offersTarget: target.offersTarget,
                            hiresTarget: target.hiresTarget
                          });
                          setIsEditKpiTargetDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteKpiTarget(target.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          {/* 採用プロセスタブ */}
          <TabsContent value="process">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">採用プロセス設定</h3>
              <Button onClick={() => setIsAddProcessStepDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                ステップ追加
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>順序</TableHead>
                  <TableHead>ステップ名</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>必須</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processSteps.sort((a, b) => a.order - b.order).map(step => (
                  <TableRow key={step.id}>
                    <TableCell>{step.order}</TableCell>
                    <TableCell className="font-medium">{step.name}</TableCell>
                    <TableCell>{step.description}</TableCell>
                    <TableCell>{step.isRequired ? '必須' : '任意'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedProcessStep(step);
                          setProcessStepFormData({
                            name: step.name,
                            description: step.description,
                            isRequired: step.isRequired,
                            order: step.order
                          });
                          setIsEditProcessStepDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteProcessStep(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          {/* 評価項目タブ */}
          <TabsContent value="evaluation">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">評価項目設定</h3>
              <Button onClick={() => setIsAddCriterionDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                評価項目追加
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>評価項目</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>必須</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluationCriteria.map(criterion => (
                  <TableRow key={criterion.id}>
                    <TableCell className="font-medium">{criterion.name}</TableCell>
                    <TableCell>{criterion.description}</TableCell>
                    <TableCell>
                      {criterion.category === 'technical' ? '技術' : 
                       criterion.category === 'communication' ? 'コミュニケーション' : 
                       criterion.category === 'cultureFit' ? 'カルチャーフィット' : 'その他'}
                    </TableCell>
                    <TableCell>{criterion.isRequired ? '必須' : '任意'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedCriterion(criterion);
                          setCriterionFormData({
                            name: criterion.name,
                            description: criterion.description,
                            category: criterion.category,
                            isRequired: criterion.isRequired
                          });
                          setIsEditCriterionDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCriterion(criterion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings}>設定を保存</Button>
      </CardFooter>
      
      {/* KPI目標追加ダイアログ */}
      <Dialog open={isAddKpiTargetDialogOpen} onOpenChange={setIsAddKpiTargetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>KPI目標追加</DialogTitle>
            <DialogDescription>
              新しい採用ポジションのKPI目標を設定します。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="position">ポジション</Label>
              <Input
                id="position"
                name="position"
                value={kpiTargetFormData.position}
                onChange={handleKpiTargetInputChange}
                placeholder="例: フロントエンドエンジニア"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="applicationsTarget">応募数目標</Label>
                <Input
                  id="applicationsTarget"
                  name="applicationsTarget"
                  type="number"
                  value={kpiTargetFormData.applicationsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="screeningsTarget">書類選考目標</Label>
                <Input
                  id="screeningsTarget"
                  name="screeningsTarget"
                  type="number"
                  value={kpiTargetFormData.screeningsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstInterviewsTarget">一次面接目標</Label>
                <Input
                  id="firstInterviewsTarget"
                  name="firstInterviewsTarget"
                  type="number"
                  value={kpiTargetFormData.firstInterviewsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="secondInterviewsTarget">二次面接目標</Label>
                <Input
                  id="secondInterviewsTarget"
                  name="secondInterviewsTarget"
                  type="number"
                  value={kpiTargetFormData.secondInterviewsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="finalInterviewsTarget">最終面接目標</Label>
                <Input
                  id="finalInterviewsTarget"
                  name="finalInterviewsTarget"
                  type="number"
                  value={kpiTargetFormData.finalInterviewsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="offersTarget">内定目標</Label>
                <Input
                  id="offersTarget"
                  name="offersTarget"
                  type="number"
                  value={kpiTargetFormData.offersTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="hiresTarget">入社目標</Label>
                <Input
                  id="hiresTarget"
                  name="hiresTarget"
                  type="number"
                  value={kpiTargetFormData.hiresTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddKpiTargetDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddKpiTarget}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* KPI目標編集ダイアログ */}
      <Dialog open={isEditKpiTargetDialogOpen} onOpenChange={setIsEditKpiTargetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>KPI目標編集</DialogTitle>
            <DialogDescription>
              採用ポジションのKPI目標を編集します。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-position">ポジション</Label>
              <Input
                id="edit-position"
                name="position"
                value={kpiTargetFormData.position}
                onChange={handleKpiTargetInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-applicationsTarget">応募数目標</Label>
                <Input
                  id="edit-applicationsTarget"
                  name="applicationsTarget"
                  type="number"
                  value={kpiTargetFormData.applicationsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-screeningsTarget">書類選考目標</Label>
                <Input
                  id="edit-screeningsTarget"
                  name="screeningsTarget"
                  type="number"
                  value={kpiTargetFormData.screeningsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstInterviewsTarget">一次面接目標</Label>
                <Input
                  id="edit-firstInterviewsTarget"
                  name="firstInterviewsTarget"
                  type="number"
                  value={kpiTargetFormData.firstInterviewsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-secondInterviewsTarget">二次面接目標</Label>
                <Input
                  id="edit-secondInterviewsTarget"
                  name="secondInterviewsTarget"
                  type="number"
                  value={kpiTargetFormData.secondInterviewsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-finalInterviewsTarget">最終面接目標</Label>
                <Input
                  id="edit-finalInterviewsTarget"
                  name="finalInterviewsTarget"
                  type="number"
                  value={kpiTargetFormData.finalInterviewsTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-offersTarget">内定目標</Label>
                <Input
                  id="edit-offersTarget"
                  name="offersTarget"
                  type="number"
                  value={kpiTargetFormData.offersTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-hiresTarget">入社目標</Label>
                <Input
                  id="edit-hiresTarget"
                  name="hiresTarget"
                  type="number"
                  value={kpiTargetFormData.hiresTarget}
                  onChange={handleKpiTargetInputChange}
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditKpiTargetDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleEditKpiTarget}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* プロセスステップ追加ダイアログ */}
      <Dialog open={isAddProcessStepDialogOpen} onOpenChange={setIsAddProcessStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プロセスステップ追加</DialogTitle>
            <DialogDescription>
              新しい採用プロセスのステップを追加します。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ステップ名</Label>
              <Input
                id="name"
                name="name"
                value={processStepFormData.name}
                onChange={handleProcessStepInputChange}
                placeholder="例: 技術テスト"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                name="description"
                value={processStepFormData.description}
                onChange={handleProcessStepInputChange}
                placeholder="例: 実際の技術力を評価するためのテスト"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isRequired"
                checked={processStepFormData.isRequired}
                onCheckedChange={(checked) => 
                  setProcessStepFormData(prev => ({ ...prev, isRequired: checked }))
                }
              />
              <Label htmlFor="isRequired">必須ステップ</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProcessStepDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddProcessStep}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* プロセスステップ編集ダイアログ */}
      <Dialog open={isEditProcessStepDialogOpen} onOpenChange={setIsEditProcessStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プロセスステップ編集</DialogTitle>
            <DialogDescription>
              採用プロセスのステップを編集します。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">ステップ名</Label>
              <Input
                id="edit-name"
                name="name"
                value={processStepFormData.name}
                onChange={handleProcessStepInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">説明</Label>
              <Input
                id="edit-description"
                name="description"
                value={processStepFormData.description}
                onChange={handleProcessStepInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-order">順序</Label>
              <Input
                id="edit-order"
                name="order"
                type="number"
                value={processStepFormData.order}
                onChange={handleProcessStepInputChange}
                min="1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isRequired"
                checked={processStepFormData.isRequired}
                onCheckedChange={(checked) => 
                  setProcessStepFormData(prev => ({ ...prev, isRequired: checked }))
                }
              />
              <Label htmlFor="edit-isRequired">必須ステップ</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProcessStepDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleEditProcessStep}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 評価項目追加ダイアログ */}
      <Dialog open={isAddCriterionDialogOpen} onOpenChange={setIsAddCriterionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>評価項目追加</DialogTitle>
            <DialogDescription>
              新しい評価項目を追加します。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">評価項目名</Label>
              <Input
                id="name"
                name="name"
                value={criterionFormData.name}
                onChange={handleCriterionInputChange}
                placeholder="例: 問題解決能力"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                name="description"
                value={criterionFormData.description}
                onChange={handleCriterionInputChange}
                placeholder="例: 複雑な問題を解決する能力"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={criterionFormData.category}
                onValueChange={(value) => 
                  setCriterionFormData(prev => ({ 
                    ...prev, 
                    category: value as 'technical' | 'communication' | 'cultureFit' | 'other' 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">技術</SelectItem>
                  <SelectItem value="communication">コミュニケーション</SelectItem>
                  <SelectItem value="cultureFit">カルチャーフィット</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isRequired"
                checked={criterionFormData.isRequired}
                onCheckedChange={(checked) => 
                  setCriterionFormData(prev => ({ ...prev, isRequired: checked }))
                }
              />
              <Label htmlFor="isRequired">必須評価項目</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCriterionDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddCriterion}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 評価項目編集ダイアログ */}
      <Dialog open={isEditCriterionDialogOpen} onOpenChange={setIsEditCriterionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>評価項目編集</DialogTitle>
            <DialogDescription>
              評価項目を編集します。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">評価項目名</Label>
              <Input
                id="edit-name"
                name="name"
                value={criterionFormData.name}
                onChange={handleCriterionInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">説明</Label>
              <Input
                id="edit-description"
                name="description"
                value={criterionFormData.description}
                onChange={handleCriterionInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-category">カテゴリ</Label>
              <Select
                value={criterionFormData.category}
                onValueChange={(value) => 
                  setCriterionFormData(prev => ({ 
                    ...prev, 
                    category: value as 'technical' | 'communication' | 'cultureFit' | 'other' 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">技術</SelectItem>
                  <SelectItem value="communication">コミュニケーション</SelectItem>
                  <SelectItem value="cultureFit">カルチャーフィット</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isRequired"
                checked={criterionFormData.isRequired}
                onCheckedChange={(checked) => 
                  setCriterionFormData(prev => ({ ...prev, isRequired: checked }))
                }
              />
              <Label htmlFor="edit-isRequired">必須評価項目</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCriterionDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleEditCriterion}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RecruitmentSettings;