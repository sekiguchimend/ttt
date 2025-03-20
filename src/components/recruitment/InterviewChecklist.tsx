import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { CheckIcon, XIcon, PlusIcon, ClipboardCheckIcon } from 'lucide-react';

// チェックリスト項目の型定義
interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  required: boolean;
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

// デフォルトのチェックリスト項目
const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: '1',
    label: '身だしなみ・態度',
    description: '面接にふさわしい服装で、礼儀正しく対応できていたか',
    required: true
  },
  {
    id: '2',
    label: 'コミュニケーション能力',
    description: '質問に対して明確に回答し、自分の考えを伝えることができていたか',
    required: true
  },
  {
    id: '3',
    label: '技術的スキル',
    description: '応募ポジションに必要な技術的スキルを持っているか',
    required: true
  },
  {
    id: '4',
    label: '業界知識',
    description: '業界や会社についての基本的な知識を持っているか',
    required: false
  },
  {
    id: '5',
    label: 'チームワーク',
    description: 'チームでの協力や過去の経験について適切に説明できたか',
    required: true
  },
  {
    id: '6',
    label: '問題解決能力',
    description: '課題に対する解決策を論理的に考えることができるか',
    required: true
  },
  {
    id: '7',
    label: '入社意欲',
    description: '会社への興味や入社意欲が感じられたか',
    required: true
  },
  {
    id: '8',
    label: '成長意欲',
    description: '自己成長や学習への意欲が感じられたか',
    required: false
  },
  {
    id: '9',
    label: '価値観の一致',
    description: '会社の価値観や文化に合致しているか',
    required: true
  },
  {
    id: '10',
    label: '質問の質',
    description: '候補者からの質問が適切で、準備されていたか',
    required: false
  }
];

interface InterviewChecklistProps {
  candidateId: string;
  candidateName: string;
  interviewerId: string;
  interviewerName: string;
  existingResponse?: ChecklistResponse;
  onSave: (response: ChecklistResponse) => void;
  onComplete: (response: ChecklistResponse) => void;
  readOnly?: boolean;
}

export const InterviewChecklist: React.FC<InterviewChecklistProps> = ({
  candidateId,
  candidateName,
  interviewerId,
  interviewerName,
  existingResponse,
  onSave,
  onComplete,
  readOnly = false
}) => {
  const [checklistItems] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST_ITEMS);
  const [responses, setResponses] = useState<{
    itemId: string;
    checked: boolean;
    notes?: string;
  }[]>(
    existingResponse?.items || 
    checklistItems.map(item => ({
      itemId: item.id,
      checked: false,
      notes: ''
    }))
  );
  const [overallNotes, setOverallNotes] = useState<string>(existingResponse?.overallNotes || '');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  // チェックボックスの状態を変更
  const handleCheckChange = (itemId: string, checked: boolean) => {
    if (readOnly) return;
    
    setResponses(prev => 
      prev.map(response => 
        response.itemId === itemId 
          ? { ...response, checked } 
          : response
      )
    );
  };
  
  // メモの内容を変更
  const handleNotesChange = (itemId: string, notes: string) => {
    if (readOnly) return;
    
    setResponses(prev => 
      prev.map(response => 
        response.itemId === itemId 
          ? { ...response, notes } 
          : response
      )
    );
  };
  
  // 全体のメモを変更
  const handleOverallNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    setOverallNotes(e.target.value);
  };
  
  // チェックリストを保存
  const handleSave = () => {
    const response: ChecklistResponse = {
      id: existingResponse?.id || Math.random().toString(36).substring(2, 9),
      candidateId,
      interviewerId,
      interviewerName,
      date: existingResponse?.date || new Date().toISOString(),
      items: responses,
      overallNotes,
      completed: existingResponse?.completed || false
    };
    
    onSave(response);
    toast({
      title: "チェックリストを保存しました",
      description: "面接チェックリストが保存されました。",
    });
  };
  
  // チェックリストを完了
  const handleComplete = () => {
    // 必須項目がすべてチェックされているか確認
    const requiredItems = checklistItems.filter(item => item.required);
    const allRequiredChecked = requiredItems.every(item => 
      responses.find(r => r.itemId === item.id)?.checked
    );
    
    if (!allRequiredChecked) {
      toast({
        title: "必須項目が未チェックです",
        description: "すべての必須項目をチェックしてください。",
        variant: "destructive"
      });
      return;
    }
    
    setIsConfirmDialogOpen(true);
  };
  
  // 完了を確定
  const confirmComplete = () => {
    const response: ChecklistResponse = {
      id: existingResponse?.id || Math.random().toString(36).substring(2, 9),
      candidateId,
      interviewerId,
      interviewerName,
      date: existingResponse?.date || new Date().toISOString(),
      items: responses,
      overallNotes,
      completed: true
    };
    
    onComplete(response);
    setIsConfirmDialogOpen(false);
    
    toast({
      title: "チェックリストを完了しました",
      description: "面接チェックリストが完了としてマークされました。",
    });
  };
  
  // 必須項目のチェック状況を計算
  const requiredItems = checklistItems.filter(item => item.required);
  const checkedRequiredItems = requiredItems.filter(item => 
    responses.find(r => r.itemId === item.id)?.checked
  );
  const requiredProgress = Math.round((checkedRequiredItems.length / requiredItems.length) * 100);
  
  // 全項目のチェック状況を計算
  const checkedItems = responses.filter(r => r.checked);
  const totalProgress = Math.round((checkedItems.length / checklistItems.length) * 100);
  
  return (
    <Card className={readOnly ? "bg-muted/10" : ""}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>面接チェックリスト</CardTitle>
            <CardDescription>
              {candidateName}さんの面接評価 | 評価者: {interviewerName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {existingResponse?.completed ? (
              <Badge className="bg-green-500">完了済み</Badge>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  必須項目: {checkedRequiredItems.length}/{requiredItems.length}
                </div>
                <div className="w-24 h-2 bg-muted rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      requiredProgress === 100 ? "bg-green-500" : 
                      requiredProgress >= 50 ? "bg-yellow-500" : 
                      "bg-red-500"
                    }`}
                    style={{ width: `${requiredProgress}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            {checklistItems.map(item => (
              <div key={item.id} className="flex items-start space-x-3 p-3 rounded-md border">
                <Checkbox 
                  id={`item-${item.id}`}
                  checked={responses.find(r => r.itemId === item.id)?.checked || false}
                  onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
                  disabled={readOnly || existingResponse?.completed}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <Label 
                      htmlFor={`item-${item.id}`}
                      className="text-base font-medium cursor-pointer"
                    >
                      {item.label}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <Textarea 
                    placeholder="メモを入力（任意）"
                    value={responses.find(r => r.itemId === item.id)?.notes || ''}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    disabled={readOnly || existingResponse?.completed}
                    className="h-20"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="overall-notes">総合評価・メモ</Label>
            <Textarea 
              id="overall-notes"
              placeholder="総合的な評価やメモを入力してください"
              value={overallNotes}
              onChange={handleOverallNotesChange}
              disabled={readOnly || existingResponse?.completed}
              className="h-32"
            />
          </div>
          
          {!readOnly && !existingResponse?.completed && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSave}>
                保存
              </Button>
              <Button onClick={handleComplete}>
                <CheckIcon className="mr-2 h-4 w-4" />
                完了
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* 完了確認ダイアログ */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>チェックリスト完了の確認</DialogTitle>
            <DialogDescription>
              チェックリストを完了としてマークします。完了後は編集できなくなります。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>候補者: {candidateName}</p>
            <p>評価者: {interviewerName}</p>
            <p>チェック項目: {checkedItems.length}/{checklistItems.length} ({totalProgress}%)</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>キャンセル</Button>
            <Button onClick={confirmComplete}>完了する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// チェックリスト一覧コンポーネント
interface InterviewChecklistListProps {
  responses: ChecklistResponse[];
  onViewResponse: (response: ChecklistResponse) => void;
  onAddNew: () => void;
}

export const InterviewChecklistList: React.FC<InterviewChecklistListProps> = ({
  responses,
  onViewResponse,
  onAddNew
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>面接チェックリスト</CardTitle>
            <CardDescription>
              候補者の面接評価チェックリスト一覧
            </CardDescription>
          </div>
          <Button onClick={onAddNew}>
            <PlusIcon className="mr-2 h-4 w-4" />
            新規チェックリスト
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {responses.length > 0 ? (
          <div className="space-y-4">
            {responses.map(response => (
              <div 
                key={response.id} 
                className="flex justify-between items-center p-4 border rounded-md hover:bg-muted/20 cursor-pointer"
                onClick={() => onViewResponse(response)}
              >
                <div>
                  <div className="font-medium">
                    評価者: {response.interviewerName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(response.date).toLocaleDateString()} {new Date(response.date).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {response.completed ? (
                    <Badge className="bg-green-500">
                      <CheckIcon className="mr-1 h-3 w-3" />
                      完了
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <ClipboardCheckIcon className="mr-1 h-3 w-3" />
                      進行中
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    詳細
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">チェックリストがまだありません。「新規チェックリスト」ボタンから追加してください。</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};