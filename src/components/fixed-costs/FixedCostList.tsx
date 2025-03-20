
import React, { useState } from 'react';
import { useFixedCosts } from '@/context/FixedCostsContext';
import { FixedCost } from '@/types/fixed-costs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Search } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { FixedCostForm } from './FixedCostForm';

export const FixedCostList: React.FC = () => {
  const { costs, deleteCost } = useFixedCosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [costToDelete, setCostToDelete] = useState<FixedCost | null>(null);

  // Filter costs based on search query
  const filteredCosts = costs.filter(cost => 
    cost.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cost.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cost.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (cost: FixedCost) => {
    setCostToDelete(cost);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (costToDelete) {
      deleteCost(costToDelete.id);
      setDeleteConfirmOpen(false);
      setCostToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  if (editingCost) {
    return (
      <FixedCostForm 
        editingCost={editingCost}
        onComplete={() => setEditingCost(null)}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>固定費一覧</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>カテゴリー</TableHead>
                  <TableHead className="text-right">金額 (円)</TableHead>
                  <TableHead>開始日</TableHead>
                  <TableHead>終了日</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      固定費が登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell className="font-medium">{cost.name}</TableCell>
                      <TableCell>{cost.category}</TableCell>
                      <TableCell className="text-right">{cost.amount.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(cost.startDate)}</TableCell>
                      <TableCell>{cost.endDate ? formatDate(cost.endDate) : '-'}</TableCell>
                      <TableCell>
                        {cost.isRecurring ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            毎月
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            一回のみ
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingCost(cost)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">編集</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(cost)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">削除</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この固定費を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {costToDelete?.name}（{costToDelete?.amount.toLocaleString()}円）を削除します。この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
