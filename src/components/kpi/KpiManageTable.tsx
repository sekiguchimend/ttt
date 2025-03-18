import React, { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { KpiMetric, KPI_CATEGORIES } from '@/types/kpi';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface KpiManageTableProps {
  kpis: KpiMetric[];
  onEdit: (kpi: KpiMetric) => void;
  onDelete: (id: string) => void;
}

export const KpiManageTable: React.FC<KpiManageTableProps> = ({
  kpis,
  onEdit,
  onDelete
}) => {
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  
  // サンプルユーザーリスト (実際のアプリでは動的に取得)
  const users = [
    { id: '1', name: '管理者', department: '経営' },
    { id: '2', name: '山田太郎', department: '営業' }
  ];

  // カテゴリでフィルタリングされたKPI
  const filteredKpis = selectedCategory
    ? kpis.filter(kpi => kpi.category === selectedCategory)
    : kpis;
  
  // 進捗状況の計算と表示色の決定
  const getProgressInfo = (kpi: KpiMetric) => {
    // 標準目標に対する進捗率
    const standardProgress = Math.round((kpi.value / kpi.standardTarget) * 100);
    
    // 色の決定
    let color = 'bg-red-500';
    let progressText = `${standardProgress}%`;
    
    if (kpi.value >= kpi.stretchTarget) {
      color = 'bg-green-500';
      progressText = `${standardProgress}% (目標達成+)`;
    } else if (kpi.value >= kpi.standardTarget) {
      color = 'bg-green-500';
      progressText = `${standardProgress}% (目標達成)`;
    } else if (kpi.value >= kpi.minimumTarget) {
      color = 'bg-yellow-500';
      progressText = `${standardProgress}% (最低ライン達成)`;
    }
    
    // 進捗バーの幅（最大100%）
    const progressWidth = Math.min(standardProgress, 100);
    
    return { color, progressText, progressWidth };
  };
  
  // KPI行の展開/折りたたみを切り替える
  const toggleExpand = (id: string) => {
    setExpandedKpi(expandedKpi === id ? null : id);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">KPI一覧</h3>
        <Select value={selectedCategory} onValueChange={(value: string) => setSelectedCategory(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="すべてのカテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">すべてのカテゴリ</SelectItem>
            {KPI_CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Table>
        <TableCaption>KPI一覧 ({filteredKpis.length}件)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]"></TableHead>
            <TableHead>KPI名</TableHead>
            <TableHead>達成値</TableHead>
            <TableHead>標準目標</TableHead>
            <TableHead>進捗状況</TableHead>
            <TableHead>カテゴリ</TableHead>
            {isAdmin && <TableHead>従業員</TableHead>}
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredKpis.length > 0 ? (
            filteredKpis.map(kpi => {
              const { color, progressText, progressWidth } = getProgressInfo(kpi);
              const isExpanded = expandedKpi === kpi.id;
              
              return (
                <React.Fragment key={kpi.id}>
                  <TableRow className={isExpanded ? "border-b-0" : ""}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand(kpi.id)}
                        className="h-6 w-6"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{kpi.name}</TableCell>
                    <TableCell>{kpi.value}{kpi.unit}</TableCell>
                    <TableCell>{kpi.standardTarget}{kpi.unit}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${color}`}
                            style={{ width: `${progressWidth}%` }}
                          ></div>
                        </div>
                        <span className="text-xs whitespace-nowrap">
                          {progressText}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {KPI_CATEGORIES.find(c => c.value === kpi.category)?.label || 'その他'}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {users.find(u => u.id === kpi.userId)?.name || '不明'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(kpi)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(kpi.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 8 : 7} className="bg-muted/50 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">最低ライン</h4>
                            <p className="text-sm">{kpi.minimumTarget}{kpi.unit}</p>
                            <div className="mt-1 h-1.5 w-full bg-muted rounded-full">
                              <div
                                className={`h-1.5 rounded-full ${kpi.value >= kpi.minimumTarget ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min((kpi.value / kpi.minimumTarget) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs mt-1">{Math.round((kpi.value / kpi.minimumTarget) * 100)}%</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">普通ライン</h4>
                            <p className="text-sm">{kpi.standardTarget}{kpi.unit}</p>
                            <div className="mt-1 h-1.5 w-full bg-muted rounded-full">
                              <div
                                className={`h-1.5 rounded-full ${kpi.value >= kpi.standardTarget ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ width: `${Math.min((kpi.value / kpi.standardTarget) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs mt-1">{Math.round((kpi.value / kpi.standardTarget) * 100)}%</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">いいライン</h4>
                            <p className="text-sm">{kpi.stretchTarget}{kpi.unit}</p>
                            <div className="mt-1 h-1.5 w-full bg-muted rounded-full">
                              <div
                                className={`h-1.5 rounded-full ${kpi.value >= kpi.stretchTarget ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min((kpi.value / kpi.stretchTarget) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs mt-1">{Math.round((kpi.value / kpi.stretchTarget) * 100)}%</p>
                          </div>
                        </div>
                        
                        {kpi.notes && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">メモ</h4>
                            <p className="text-sm text-muted-foreground">{kpi.notes}</p>
                          </div>
                        )}
                        
                        <div className="mt-4 text-xs text-muted-foreground">
                          最終更新: {new Date(kpi.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={isAdmin ? 8 : 7} className="text-center h-24">
                KPIデータがありません。「KPI追加」ボタンからKPIを追加してください。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
