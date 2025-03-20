import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/layout/Dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { InterviewChecklist, InterviewChecklistList } from '@/components/recruitment/InterviewChecklist';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

// 候補者の型定義
interface Candidate {
  id: string;
  name: string;
  position: string;
  status: '応募' | '書類選考' | '一次面接' | '二次面接' | '最終面接' | '内定' | '入社' | '不採用';
  source: string;
  appliedDate: string;
  email: string;
  phone?: string;
  notes?: string;
  evaluations: Evaluation[];
  tasks: Task[];
  checklists: ChecklistResponse[];
  created_at: string;
  updated_at: string;
}

// 評価の型定義
interface Evaluation {
  id: string;
  candidateId: string;
  interviewerId: string;
  interviewerName: string;
  date: string;
  stage: '書類選考' | '一次面接' | '二次面接' | '最終面接';
  technicalScore: number;
  communicationScore: number;
  cultureFitScore: number;
  overallScore: number;
  feedback: string;
}

// チェックリスト回答の型定義
interface ChecklistResponse {
  id: string;
  candidateId: string;
  interviewerId: string;
  interviewerName: string;
  date: string;
  items: {
    itemId: string;
    checked: boolean;
    notes?: string;
  }[];
  overallNotes?: string;
  completed: boolean;
}

// タスクの型定義
interface Task {
  id: string;
  candidateId: string;
  assigneeId: string;
  assigneeName: string;
  title: string;
  date: string;
  amount?: number;
  link?: string;
  completed: boolean;
  notes?: string;
}

// 採用KPIの型定義
interface RecruitmentKpi {
  id: string;
  month: string;
  position: string;
  applications: number;
  screenings: number;
  firstInterviews: number;
  secondInterviews: number;
  finalInterviews: number;
  offers: number;
  hires: number;
  target: number;
}

// 採用管理画面
const Recruitment = () => {
  const { isAuthenticated, loading: authLoading, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>("candidates");
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [isAddCandidateDialogOpen, setIsAddCandidateDialogOpen] = useState(false);
  const [isEditCandidateDialogOpen, setIsEditCandidateDialogOpen] = useState(false);
  const [isAddEvaluationDialogOpen, setIsAddEvaluationDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isAddKpiDialogOpen, setIsAddKpiDialogOpen] = useState(false);
  const [isAddChecklistDialogOpen, setIsAddChecklistDialogOpen] = useState(false);
  const [isViewChecklistDialogOpen, setIsViewChecklistDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistResponse | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    position: '',
    status: '応募'
  });
  
  // サンプル採用KPIデータ
  const [recruitmentKpis, setRecruitmentKpis] = useState<RecruitmentKpi[]>([
    {
      id: '1',
      month: '2023-06',
      position: 'エンジニア',
      applications: 15,
      screenings: 10,
      firstInterviews: 8,
      secondInterviews: 5,
      finalInterviews: 3,
      offers: 2,
      hires: 1,
      target: 3
    },
    {
      id: '2',
      month: '2023-05',
      position: 'エンジニア',
      applications: 12,
      screenings: 8,
      firstInterviews: 6,
      secondInterviews: 4,
      finalInterviews: 2,
      offers: 2,
      hires: 2,
      target: 3
    }
  ]);
  
  // 認証チェックとリダイレクト
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // ローディング表示
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // 候補者一覧を取得
  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast({
        title: "エラー",
        description: "候補者一覧の取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);
  
  // 候補者追加
  const handleAddCandidate = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert([newCandidate])
        .select();

      if (error) throw error;

      toast({
        title: "成功",
        description: "候補者を追加しました。",
      });

      // フォームをリセット
      setNewCandidate({
        name: '',
        email: '',
        position: '',
        status: '応募'
      });

      // ダイアログを閉じる
      setIsAddDialogOpen(false);

      // 候補者一覧を更新
      loadCandidates();
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast({
        title: "エラー",
        description: "候補者の追加に失敗しました。",
        variant: "destructive",
      });
    }
  };
  
  // 候補者編集
  const handleEditCandidate = (candidate: Candidate) => {
    const updatedCandidates = candidates.map(c => 
      c.id === candidate.id ? candidate : c
    );
    
    setCandidates(updatedCandidates);
    setIsEditCandidateDialogOpen(false);
  };
  
  // 候補者削除
  const handleDeleteCandidate = (id: string) => {
    if (confirm('この候補者を削除してもよろしいですか？')) {
      const updatedCandidates = candidates.filter(c => c.id !== id);
      setCandidates(updatedCandidates);
      
      if (selectedCandidate === id) {
        setSelectedCandidate("");
        setActiveTab("candidates");
      }
    }
  };
  
  // 評価追加
  const handleAddEvaluation = (evaluation: Omit<Evaluation, 'id'>) => {
    const newEvaluation = {
      ...evaluation,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    const updatedCandidates = candidates.map(candidate => {
      if (candidate.id === evaluation.candidateId) {
        return {
          ...candidate,
          evaluations: [...candidate.evaluations, newEvaluation]
        };
      }
      return candidate;
    });
    
    setCandidates(updatedCandidates);
    setIsAddEvaluationDialogOpen(false);
  };
  
  // タスク追加
  const handleAddTask = (task: Omit<Task, 'id'>) => {
    const newTask = {
      ...task,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    const updatedCandidates = candidates.map(candidate => {
      if (candidate.id === task.candidateId) {
        return {
          ...candidate,
          tasks: [...candidate.tasks, newTask]
        };
      }
      return candidate;
    });
    
    setCandidates(updatedCandidates);
    setIsAddTaskDialogOpen(false);
  };
  
  // タスク完了状態の切り替え
  const handleToggleTaskCompletion = (candidateId: string, taskId: string) => {
    const updatedCandidates = candidates.map(candidate => {
      if (candidate.id === candidateId) {
        const updatedTasks = candidate.tasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: !task.completed
            };
          }
          return task;
        });
        
        return {
          ...candidate,
          tasks: updatedTasks
        };
      }
      return candidate;
    });
    
    setCandidates(updatedCandidates);
  };
  
  // チェックリスト追加
  const handleAddChecklist = (checklist: ChecklistResponse) => {
    const updatedCandidates = candidates.map(candidate => {
      if (candidate.id === checklist.candidateId) {
        return {
          ...candidate,
          checklists: [...candidate.checklists, checklist]
        };
      }
      return candidate;
    });
    
    setCandidates(updatedCandidates);
    setIsAddChecklistDialogOpen(false);
  };
  
  // チェックリスト更新
  const handleUpdateChecklist = (checklist: ChecklistResponse) => {
    const updatedCandidates = candidates.map(candidate => {
      if (candidate.id === checklist.candidateId) {
        const updatedChecklists = candidate.checklists.map(c =>
          c.id === checklist.id ? checklist : c
        );
        
        return {
          ...candidate,
          checklists: updatedChecklists
        };
      }
      return candidate;
    });
    
    setCandidates(updatedCandidates);
    setIsViewChecklistDialogOpen(false);
    setSelectedChecklist(null);
  };
  
  // チェックリスト完了
  const handleCompleteChecklist = (checklist: ChecklistResponse) => {
    handleUpdateChecklist(checklist);
  };
  
  // KPI追加
  const handleAddKpi = (kpi: Omit<RecruitmentKpi, 'id'>) => {
    const newKpi = {
      ...kpi,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    setRecruitmentKpis([...recruitmentKpis, newKpi]);
    setIsAddKpiDialogOpen(false);
  };
  
  // 候補者一覧コンポーネント
  const CandidateList = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>候補者一覧</CardTitle>
              <CardDescription>
                採用候補者の管理と進捗状況の確認
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>候補者追加</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新規候補者追加</DialogTitle>
                  <DialogDescription>
                    新しい候補者の情報を入力してください。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">名前</Label>
                    <Input
                      id="name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCandidate.email}
                      onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="position">応募職種</Label>
                    <Input
                      id="position"
                      value={newCandidate.position}
                      onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">ステータス</Label>
                    <Select
                      value={newCandidate.status}
                      onValueChange={(value) => setNewCandidate({ ...newCandidate, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ステータスを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="応募">応募</SelectItem>
                        <SelectItem value="書類選考">書類選考</SelectItem>
                        <SelectItem value="一次面接">一次面接</SelectItem>
                        <SelectItem value="二次面接">二次面接</SelectItem>
                        <SelectItem value="最終面接">最終面接</SelectItem>
                        <SelectItem value="内定">内定</SelectItem>
                        <SelectItem value="不採用">不採用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>キャンセル</Button>
                  <Button onClick={handleAddCandidate}>追加</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>ポジション</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>応募日</TableHead>
                <TableHead>応募元</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.length > 0 ? (
                candidates.map(candidate => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell>
                      <Badge variant={
                        candidate.status === '内定' || candidate.status === '入社' ? 'default' :
                        candidate.status === '最終面接' || candidate.status === '二次面接' ? 'secondary' :
                        candidate.status === '一次面接' || candidate.status === '書類選考' ? 'outline' :
                        candidate.status === '不採用' ? 'destructive' : 'outline'
                      }>
                        {candidate.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{candidate.appliedDate}</TableCell>
                    <TableCell>{candidate.source}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCandidate(candidate.id);
                            setActiveTab("candidate-detail");
                          }}
                        >
                          詳細
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCandidate(candidate.id);
                            setIsEditCandidateDialogOpen(true);
                          }}
                        >
                          編集
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleDeleteCandidate(candidate.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    候補者がいません。「候補者追加」ボタンから追加してください。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };
  
  // 候補者詳細コンポーネント
  const CandidateDetail = () => {
    const candidate = candidates.find(c => c.id === selectedCandidate);
    
    if (!candidate) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>候補者が見つかりません</CardTitle>
          </CardHeader>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{candidate.name}</CardTitle>
              <CardDescription>
                {candidate.position} | {candidate.email} {candidate.phone ? `| ${candidate.phone}` : ''}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("candidates")}
              >
                候補者一覧に戻る
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditCandidateDialogOpen(true);
                }}
              >
                編集
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="evaluations">評価</TabsTrigger>
              <TabsTrigger value="checklists">面接チェックリスト</TabsTrigger>
              <TabsTrigger value="tasks">タスク</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">基本情報</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-medium">ステータス</div>
                      <div className="col-span-2">
                        <Badge variant={
                          candidate.status === '内定' || candidate.status === '入社' ? 'default' :
                          candidate.status === '最終面接' || candidate.status === '二次面接' ? 'secondary' :
                          candidate.status === '一次面接' || candidate.status === '書類選考' ? 'outline' :
                          candidate.status === '不採用' ? 'destructive' : 'outline'
                        }>
                          {candidate.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-medium">応募日</div>
                      <div className="col-span-2">{candidate.appliedDate}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-medium">応募元</div>
                      <div className="col-span-2">{candidate.source}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-medium">メール</div>
                      <div className="col-span-2">{candidate.email}</div>
                    </div>
                    {candidate.phone && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="font-medium">電話番号</div>
                        <div className="col-span-2">{candidate.phone}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">評価サマリー</h3>
                  {candidate.evaluations && candidate.evaluations.length > 0 ? (
                    <div className="space-y-2">
                      {candidate.evaluations.map(evaluation => (
                        <div key={evaluation.id} className="p-2 border rounded-md">
                          <div className="flex justify-between">
                            <div className="font-medium">{evaluation.stage}</div>
                            <div>{evaluation.date}</div>
                          </div>
                          <div className="text-sm">評価者: {evaluation.interviewerName}</div>
                          <div className="mt-2 text-sm">
                            <span className="font-medium">総合評価:</span> {evaluation.overallScore}/5
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">評価がまだありません</div>
                  )}
                </div>
              </div>
              
              {candidate.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">メモ</h3>
                  <div className="p-4 bg-muted/20 rounded-md">
                    {candidate.notes}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-2">進捗状況</h3>
                <div className="relative">
                  <div className="flex justify-between mb-2">
                    <div className="text-xs">応募</div>
                    <div className="text-xs">書類選考</div>
                    <div className="text-xs">一次面接</div>
                    <div className="text-xs">二次面接</div>
                    <div className="text-xs">最終面接</div>
                    <div className="text-xs">内定</div>
                    <div className="text-xs">入社</div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full">
                    <div 
                      className="h-2 rounded-full bg-primary"
                      style={{ 
                        width: `${
                          candidate.status === '応募' ? 14 :
                          candidate.status === '書類選考' ? 28 :
                          candidate.status === '一次面接' ? 42 :
                          candidate.status === '二次面接' ? 56 :
                          candidate.status === '最終面接' ? 70 :
                          candidate.status === '内定' ? 84 :
                          candidate.status === '入社' ? 100 : 0
                        }%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="evaluations" className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">評価履歴</h3>
                <Button
                  onClick={() => setIsAddEvaluationDialogOpen(true)}
                >
                  評価追加
                </Button>
              </div>
              
              {candidate.evaluations && candidate.evaluations.length > 0 ? (
                <div className="space-y-4">
                  {candidate.evaluations.map(evaluation => (
                    <Card key={evaluation.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{evaluation.stage}</h4>
                            <div className="text-sm text-muted-foreground">
                              {evaluation.date} | 評価者: {evaluation.interviewerName}
                            </div>
                          </div>
                          <Badge variant="outline">
                            総合評価: {evaluation.overallScore}/5
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <div className="text-sm mb-1 flex justify-between">
                              <span>技術力</span>
                              <span>{evaluation.technicalScore}/5</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm mb-1 flex justify-between">
                              <span>コミュニケーション</span>
                              <span>{evaluation.communicationScore}/5</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm mb-1 flex justify-between">
                              <span>カルチャーフィット</span>
                              <span>{evaluation.cultureFitScore}/5</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <h5 className="text-sm font-medium mb-1">フィードバック</h5>
                          <div className="text-sm p-2 bg-muted/20 rounded-md">
                            {evaluation.feedback}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">評価がまだありません。「評価追加」ボタンから追加してください。</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="checklists" className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">面接チェックリスト</h3>
                <Button
                  onClick={() => setIsAddChecklistDialogOpen(true)}
                >
                  チェックリスト追加
                </Button>
              </div>
              
              {candidate.checklists && candidate.checklists.length > 0 ? (
                <div className="space-y-4">
                  <InterviewChecklistList
                    responses={candidate.checklists}
                    onViewResponse={(checklist) => {
                      setSelectedChecklist(checklist);
                      setIsViewChecklistDialogOpen(true);
                    }}
                    onAddNew={() => setIsAddChecklistDialogOpen(true)}
                  />
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">チェックリストがまだありません。「チェックリスト追加」ボタンから追加してください。</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tasks" className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">タスク一覧</h3>
                <Button 
                  onClick={() => setIsAddTaskDialogOpen(true)}
                >
                  タスク追加
                </Button>
              </div>
              
              {candidate.tasks && candidate.tasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                    <TableHead className="w-[30px]"></TableHead>
                      <TableHead>タスク</TableHead>
                      <TableHead>担当者</TableHead>
                      <TableHead>日付</TableHead>
                      <TableHead>金額</TableHead>
                      <TableHead>リンク</TableHead>
                      <TableHead>メモ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidate.tasks.map(task => (
                      <TableRow key={task.id} className={task.completed ? "bg-muted/20" : ""}>
                        <TableCell>
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => handleToggleTaskCompletion(candidate.id, task.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </TableCell>
                        <TableCell>{task.assigneeName}</TableCell>
                        <TableCell>{task.date}</TableCell>
                        <TableCell>{task.amount ? `${task.amount.toLocaleString()}円` : '-'}</TableCell>
                        <TableCell>
                          {task.link ? (
                            <a href={task.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              リンク
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{task.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">タスクがまだありません。「タスク追加」ボタンから追加してください。</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };
  
  // 採用KPIコンポーネント
  const RecruitmentKpiList = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>採用KPI</CardTitle>
              <CardDescription>
                採用活動の指標と目標
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddKpiDialogOpen(true)}>
              KPI追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>月</TableHead>
                <TableHead>ポジション</TableHead>
                <TableHead>応募数</TableHead>
                <TableHead>書類選考</TableHead>
                <TableHead>一次面接</TableHead>
                <TableHead>二次面接</TableHead>
                <TableHead>最終面接</TableHead>
                <TableHead>内定</TableHead>
                <TableHead>入社</TableHead>
                <TableHead>目標</TableHead>
                <TableHead>達成率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recruitmentKpis.length > 0 ? (
                recruitmentKpis.map(kpi => {
                  const achievementRate = Math.round((kpi.hires / kpi.target) * 100);
                  
                  return (
                    <TableRow key={kpi.id}>
                      <TableCell>{kpi.month}</TableCell>
                      <TableCell>{kpi.position}</TableCell>
                      <TableCell>{kpi.applications}</TableCell>
                      <TableCell>{kpi.screenings}</TableCell>
                      <TableCell>{kpi.firstInterviews}</TableCell>
                      <TableCell>{kpi.secondInterviews}</TableCell>
                      <TableCell>{kpi.finalInterviews}</TableCell>
                      <TableCell>{kpi.offers}</TableCell>
                      <TableCell>{kpi.hires}</TableCell>
                      <TableCell>{kpi.target}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                achievementRate >= 100 ? "bg-green-500" : 
                                achievementRate >= 70 ? "bg-yellow-500" : 
                                "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(achievementRate, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs">{achievementRate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center h-24">
                    KPIデータがありません。「KPI追加」ボタンから追加してください。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };
  
  // 候補者追加フォーム
  const CandidateAddForm = ({ 
    initialData, 
    onSubmit, 
    onCancel 
  }: { 
    initialData?: Candidate, 
    onSubmit: (data: any) => void, 
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      name: initialData?.name || '',
      position: initialData?.position || '',
      status: initialData?.status || '応募' as '応募' | '書類選考' | '一次面接' | '二次面接' | '最終面接' | '内定' | '入社' | '不採用',
      source: initialData?.source || '',
      appliedDate: initialData?.appliedDate || new Date().toISOString().split('T')[0],
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      notes: initialData?.notes || ''
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (initialData) {
        onSubmit({
          ...initialData,
          ...formData
        });
      } else {
        onSubmit(formData);
      }
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">氏名</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="氏名を入力"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">応募ポジション</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="ポジションを入力"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <select
              id="status"
              name="status"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="応募">応募</option>
              <option value="書類選考">書類選考</option>
              <option value="一次面接">一次面接</option>
              <option value="二次面接">二次面接</option>
              <option value="最終面接">最終面接</option>
              <option value="内定">内定</option>
              <option value="入社">入社</option>
              <option value="不採用">不採用</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source">応募元</Label>
            <Input
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="応募元を入力"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="メールアドレスを入力"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">電話番号</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="電話番号を入力（任意）"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="appliedDate">応募日</Label>
          <Input
            id="appliedDate"
            name="appliedDate"
            type="date"
            value={formData.appliedDate}
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
            placeholder="メモを入力（任意）"
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
  
  return (
    <Dashboard>
      <Header
        title="採用管理"
        subtitle="候補者の管理と採用KPIの追跡"
      />
      
      <div className="px-6 pb-8">
        <div className="border-b mb-6">
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 ${activeTab === 'candidates' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => {
                setActiveTab('candidates');
                setSelectedCandidate('');
              }}
            >
              候補者一覧
            </button>
            {selectedCandidate && (
              <button 
                className={`px-4 py-2 ${activeTab === 'candidate-detail' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('candidate-detail')}
              >
                候補者詳細
              </button>
            )}
            <button 
              className={`px-4 py-2 ${activeTab === 'kpi' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('kpi')}
            >
              採用KPI
            </button>
          </div>
        </div>
        
        {activeTab === 'candidates' && <CandidateList />}
        {activeTab === 'candidate-detail' && selectedCandidate && <CandidateDetail />}
        {activeTab === 'kpi' && <RecruitmentKpiList />}
      </div>
      
      {/* 候補者追加ダイアログ */}
      <Dialog open={isAddCandidateDialogOpen} onOpenChange={setIsAddCandidateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>候補者追加</DialogTitle>
            <DialogDescription>
              新しい候補者の情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          <CandidateAddForm 
            onSubmit={handleAddCandidate}
            onCancel={() => setIsAddCandidateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* 候補者編集ダイアログ */}
      <Dialog open={isEditCandidateDialogOpen} onOpenChange={setIsEditCandidateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>候補者編集</DialogTitle>
            <DialogDescription>
              候補者の情報を編集してください。
            </DialogDescription>
          </DialogHeader>
          {selectedCandidate && (
            <CandidateAddForm
              initialData={candidates.find(c => c.id === selectedCandidate)}
              onSubmit={handleEditCandidate}
              onCancel={() => setIsEditCandidateDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* チェックリスト追加ダイアログ */}
      <Dialog open={isAddChecklistDialogOpen} onOpenChange={setIsAddChecklistDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>面接チェックリスト追加</DialogTitle>
            <DialogDescription>
              面接チェックリストを作成してください。
            </DialogDescription>
          </DialogHeader>
          {selectedCandidate && (
            <InterviewChecklist
              candidateId={selectedCandidate}
              candidateName={candidates.find(c => c.id === selectedCandidate)?.name || ''}
              interviewerId={user?.id || ''}
              interviewerName={user?.name || ''}
              onSave={handleAddChecklist}
              onComplete={handleCompleteChecklist}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* チェックリスト表示・編集ダイアログ */}
      <Dialog open={isViewChecklistDialogOpen} onOpenChange={setIsViewChecklistDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>面接チェックリスト詳細</DialogTitle>
            <DialogDescription>
              面接チェックリストの詳細情報
            </DialogDescription>
          </DialogHeader>
          {selectedChecklist && (
            <InterviewChecklist
              candidateId={selectedChecklist.candidateId}
              candidateName={candidates.find(c => c.id === selectedChecklist.candidateId)?.name || ''}
              interviewerId={selectedChecklist.interviewerId}
              interviewerName={selectedChecklist.interviewerName}
              existingResponse={selectedChecklist}
              onSave={handleUpdateChecklist}
              onComplete={handleCompleteChecklist}
              readOnly={selectedChecklist.completed}
            />
          )}
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default Recruitment;