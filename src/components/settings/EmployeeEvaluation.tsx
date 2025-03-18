import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useEmployee } from '@/context/EmployeeContext';
import { User } from '@/context/AuthContext';
import { PencilIcon, StarIcon, FileTextIcon } from 'lucide-react';

// 評価の型定義
interface EmployeeEvaluationData {
  id: string;
  employeeId: string;
  evaluatorId: string;
  period: string; // 例: "2025-Q1", "2025-上半期", "2025-年間"
  performanceScore: number; // 1-5
  skillScore: number; // 1-5
  attitudeScore: number; // 1-5
  overallScore: number; // 1-5
  strengths: string;
  improvements: string;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

// サンプル評価データ
const sampleEvaluations: EmployeeEvaluationData[] = [
  {
    id: '1',
    employeeId: '2', // 山田太郎
    evaluatorId: '1', // 管理者
    period: '2024-Q4',
    performanceScore: 4,
    skillScore: 3,
    attitudeScore: 5,
    overallScore: 4,
    strengths: '顧客対応が非常に丁寧で、クライアントからの評価が高い。チームワークも良好。',
    improvements: '技術的なスキルをさらに向上させることで、より複雑な案件にも対応できるようになると良い。',
    comments: '全体的に良好な成績を維持している。次期はリーダーシップの発揮も期待したい。',
    createdAt: '2024-12-25T10:00:00Z',
    updatedAt: '2024-12-25T10:00:00Z'
  },
  {
    id: '2',
    employeeId: '3', // 佐藤花子
    evaluatorId: '1', // 管理者
    period: '2024-Q4',
    performanceScore: 5,
    skillScore: 4,
    attitudeScore: 4,
    overallScore: 4,
    strengths: '業務の効率化に積極的に取り組み、部署全体の生産性向上に貢献している。',
    improvements: 'コミュニケーションをより活発にすることで、チーム内の情報共有がさらに向上すると良い。',
    comments: '非常に優秀な人材。今後は後輩の育成にも力を入れてほしい。',
    createdAt: '2024-12-26T14:30:00Z',
    updatedAt: '2024-12-26T14:30:00Z'
  }
];

// 評価期間のオプション
const evaluationPeriods = [
  { value: '2025-Q1', label: '2025年第1四半期' },
  { value: '2025-Q2', label: '2025年第2四半期' },
  { value: '2025-Q3', label: '2025年第3四半期' },
  { value: '2025-Q4', label: '2025年第4四半期' },
  { value: '2025-上半期', label: '2025年上半期' },
  { value: '2025-下半期', label: '2025年下半期' },
  { value: '2025-年間', label: '2025年年間評価' }
];

// スコアの表示を星に変換する関数
const renderStars = (score: number) => {
  return Array(5).fill(0).map((_, index) => (
    <StarIcon 
      key={index} 
      className={`h-4 w-4 ${index < score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
    />
  ));
};

// 評価フォームの初期値
const initialFormData = {
  employeeId: '',
  period: '2025-Q1',
  performanceScore: 3,
  skillScore: 3,
  attitudeScore: 3,
  overallScore: 3,
  strengths: '',
  improvements: '',
  comments: ''
};

const EmployeeEvaluation: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { employees } = useEmployee();
  const [evaluations, setEvaluations] = useState<EmployeeEvaluationData[]>(sampleEvaluations);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EmployeeEvaluationData | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [filteredEvaluations, setFilteredEvaluations] = useState<EmployeeEvaluationData[]>(evaluations);

  // 評価一覧をフィルタリング
  useEffect(() => {
    if (selectedEmployeeId) {
      setFilteredEvaluations(evaluations.filter(evaluation => evaluation.employeeId === selectedEmployeeId));
    } else {
      setFilteredEvaluations(evaluations);
    }
  }, [selectedEmployeeId, evaluations]);

  // フォームの入力値を更新
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Score') ? Number(value) : value
    }));
  };

  // セレクトの値を更新
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // スコアの値を更新
  const handleScoreChange = (name: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // フォームをリセット
  const resetForm = () => {
    setFormData(initialFormData);
  };

  // 評価を追加
  const handleAddEvaluation = () => {
    if (!user) return;

    const now = new Date().toISOString();
    const newEvaluation: EmployeeEvaluationData = {
      id: Math.random().toString(36).substring(2, 9),
      employeeId: formData.employeeId,
      evaluatorId: user.id,
      period: formData.period,
      performanceScore: formData.performanceScore,
      skillScore: formData.skillScore,
      attitudeScore: formData.attitudeScore,
      overallScore: formData.overallScore,
      strengths: formData.strengths,
      improvements: formData.improvements,
      comments: formData.comments,
      createdAt: now,
      updatedAt: now
    };

    setEvaluations([...evaluations, newEvaluation]);
    setIsAddDialogOpen(false);
    resetForm();

    toast({
      title: "評価を追加しました",
      description: `${employees.find(e => e.id === formData.employeeId)?.name}さんの評価を追加しました。`,
    });
  };

  // 評価を編集
  const handleEditEvaluation = () => {
    if (!selectedEvaluation || !user) return;

    const updatedEvaluation: EmployeeEvaluationData = {
      ...selectedEvaluation,
      employeeId: formData.employeeId,
      period: formData.period,
      performanceScore: formData.performanceScore,
      skillScore: formData.skillScore,
      attitudeScore: formData.attitudeScore,
      overallScore: formData.overallScore,
      strengths: formData.strengths,
      improvements: formData.improvements,
      comments: formData.comments,
      updatedAt: new Date().toISOString()
    };

    const updatedEvaluations = evaluations.map(evaluation =>
      evaluation.id === selectedEvaluation.id ? updatedEvaluation : evaluation
    );

    setEvaluations(updatedEvaluations);
    setIsEditDialogOpen(false);
    setSelectedEvaluation(null);
    resetForm();

    toast({
      title: "評価を更新しました",
      description: `${employees.find(e => e.id === formData.employeeId)?.name}さんの評価を更新しました。`,
    });
  };

  // 評価の編集ダイアログを開く
  const handleEditClick = (evaluation: EmployeeEvaluationData) => {
    setSelectedEvaluation(evaluation);
    setFormData({
      employeeId: evaluation.employeeId,
      period: evaluation.period,
      performanceScore: evaluation.performanceScore,
      skillScore: evaluation.skillScore,
      attitudeScore: evaluation.attitudeScore,
      overallScore: evaluation.overallScore,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      comments: evaluation.comments
    });
    setIsEditDialogOpen(true);
  };

  // 評価の詳細ダイアログを開く
  const handleViewClick = (evaluation: EmployeeEvaluationData) => {
    setSelectedEvaluation(evaluation);
    setIsViewDialogOpen(true);
  };

  // 評価フォーム
  const EvaluationForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="employeeId">従業員</Label>
        <Select
          value={formData.employeeId}
          onValueChange={(value) => handleSelectChange('employeeId', value)}
          disabled={isEdit}
        >
          <SelectTrigger>
            <SelectValue placeholder="従業員を選択" />
          </SelectTrigger>
          <SelectContent>
            {employees.filter(e => e.role === 'employee').map(employee => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name} ({employee.department})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="period">評価期間</Label>
        <Select
          value={formData.period}
          onValueChange={(value) => handleSelectChange('period', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="評価期間を選択" />
          </SelectTrigger>
          <SelectContent>
            {evaluationPeriods.map(period => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 pt-4">
        <h3 className="text-lg font-medium">評価スコア</h3>
        
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="performanceScore">業績</Label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleScoreChange('performanceScore', score)}
                  className="p-1"
                >
                  <StarIcon 
                    className={`h-6 w-6 ${score <= formData.performanceScore ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <Input
            type="range"
            id="performanceScore"
            name="performanceScore"
            min="1"
            max="5"
            step="1"
            value={formData.performanceScore}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="skillScore">スキル</Label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleScoreChange('skillScore', score)}
                  className="p-1"
                >
                  <StarIcon 
                    className={`h-6 w-6 ${score <= formData.skillScore ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <Input
            type="range"
            id="skillScore"
            name="skillScore"
            min="1"
            max="5"
            step="1"
            value={formData.skillScore}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="attitudeScore">姿勢・態度</Label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleScoreChange('attitudeScore', score)}
                  className="p-1"
                >
                  <StarIcon 
                    className={`h-6 w-6 ${score <= formData.attitudeScore ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <Input
            type="range"
            id="attitudeScore"
            name="attitudeScore"
            min="1"
            max="5"
            step="1"
            value={formData.attitudeScore}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="overallScore">総合評価</Label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleScoreChange('overallScore', score)}
                  className="p-1"
                >
                  <StarIcon 
                    className={`h-6 w-6 ${score <= formData.overallScore ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <Input
            type="range"
            id="overallScore"
            name="overallScore"
            min="1"
            max="5"
            step="1"
            value={formData.overallScore}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="strengths">強み・評価点</Label>
        <Textarea
          id="strengths"
          name="strengths"
          value={formData.strengths}
          onChange={handleInputChange}
          placeholder="従業員の強みや評価できる点を入力してください"
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="improvements">改善点・課題</Label>
        <Textarea
          id="improvements"
          name="improvements"
          value={formData.improvements}
          onChange={handleInputChange}
          placeholder="今後改善すべき点や課題を入力してください"
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="comments">総合コメント</Label>
        <Textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleInputChange}
          placeholder="総合的な評価コメントを入力してください"
          rows={3}
        />
      </div>
    </div>
  );

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>従業員評価</CardTitle>
          <CardDescription>
            従業員の評価と成績管理
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>従業員評価</CardTitle>
          <CardDescription>
            従業員の評価と成績管理
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedEmployeeId}
            onValueChange={setSelectedEmployeeId}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="全従業員" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全従業員</SelectItem>
              {employees.filter(e => e.role === 'employee').map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            評価を追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>従業員</TableHead>
              <TableHead>評価期間</TableHead>
              <TableHead>業績</TableHead>
              <TableHead>スキル</TableHead>
              <TableHead>姿勢・態度</TableHead>
              <TableHead>総合評価</TableHead>
              <TableHead>評価日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvaluations.length > 0 ? (
              filteredEvaluations.map(evaluation => {
                const employee = employees.find(e => e.id === evaluation.employeeId);
                const evaluationPeriod = evaluationPeriods.find(p => p.value === evaluation.period);
                
                return (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">{employee?.name || '不明'}</TableCell>
                    <TableCell>{evaluationPeriod?.label || evaluation.period}</TableCell>
                    <TableCell>
                      <div className="flex">{renderStars(evaluation.performanceScore)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex">{renderStars(evaluation.skillScore)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex">{renderStars(evaluation.attitudeScore)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex">{renderStars(evaluation.overallScore)}</div>
                    </TableCell>
                    <TableCell>{new Date(evaluation.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewClick(evaluation)}>
                          <FileTextIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(evaluation)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  評価データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* 評価追加ダイアログ */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>新規評価追加</DialogTitle>
            <DialogDescription>
              従業員の評価情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          <EvaluationForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddEvaluation}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 評価編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>評価編集</DialogTitle>
            <DialogDescription>
              評価情報を編集してください。
            </DialogDescription>
          </DialogHeader>
          <EvaluationForm isEdit={true} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleEditEvaluation}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 評価詳細ダイアログ */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>評価詳細</DialogTitle>
            <DialogDescription>
              {selectedEvaluation && (
                <>
                  {employees.find(e => e.id === selectedEvaluation.employeeId)?.name}さんの
                  {evaluationPeriods.find(p => p.value === selectedEvaluation.period)?.label}評価
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvaluation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">従業員</h3>
                  <p>{employees.find(e => e.id === selectedEvaluation.employeeId)?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">部署</h3>
                  <p>{employees.find(e => e.id === selectedEvaluation.employeeId)?.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">評価期間</h3>
                  <p>{evaluationPeriods.find(p => p.value === selectedEvaluation.period)?.label}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">評価日</h3>
                  <p>{new Date(selectedEvaluation.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">評価スコア</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">業績</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(selectedEvaluation.performanceScore)}</div>
                      <span className="font-medium">{selectedEvaluation.performanceScore}/5</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">スキル</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(selectedEvaluation.skillScore)}</div>
                      <span className="font-medium">{selectedEvaluation.skillScore}/5</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">姿勢・態度</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(selectedEvaluation.attitudeScore)}</div>
                      <span className="font-medium">{selectedEvaluation.attitudeScore}/5</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">総合評価</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(selectedEvaluation.overallScore)}</div>
                      <span className="font-medium">{selectedEvaluation.overallScore}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">評価コメント</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">強み・評価点</h4>
                    <p className="p-3 bg-muted/20 rounded-md">{selectedEvaluation.strengths}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">改善点・課題</h4>
                    <p className="p-3 bg-muted/20 rounded-md">{selectedEvaluation.improvements}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">総合コメント</h4>
                    <p className="p-3 bg-muted/20 rounded-md">{selectedEvaluation.comments}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmployeeEvaluation;