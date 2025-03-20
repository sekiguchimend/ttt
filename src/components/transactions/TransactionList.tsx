import React, { useState } from 'react';
import { useKpi } from '@/context/KpiContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from './TransactionForm';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  userId: string;
  name: string;
  amount: number;
  date: string;
  category: 'sales' | 'development';
  description?: string;
}

export const TransactionList: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useKpi();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleSubmit = async (data: Omit<Transaction, 'id'>) => {
    try {
      console.log('TransactionList handleSubmit called with data:', data);
      if (selectedTransaction) {
        console.log('Updating transaction:', selectedTransaction.id);
        await updateTransaction(selectedTransaction.id, data);
        toast({
          title: "取引を更新しました",
          description: "取引情報が正常に更新されました。",
        });
      } else {
        console.log('Adding new transaction with data:', data);
        await addTransaction(data);
        toast({
          title: "取引を追加しました",
          description: "新しい取引が正常に追加されました。",
        });
      }
      setIsDialogOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error in TransactionList handleSubmit:', error);
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "取引の保存中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast({
        title: "取引を削除しました",
        description: "取引が正常に削除されました。",
      });
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "取引の削除中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setSelectedTransaction(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">取引一覧</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              新規取引
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTransaction ? '取引の編集' : '新規取引の追加'}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false);
                setSelectedTransaction(null);
              }}
              initialData={selectedTransaction}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>取引名</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>取引日</TableHead>
            <TableHead>カテゴリ</TableHead>
            <TableHead>備考</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.name}</TableCell>
              <TableCell>{transaction.amount.toLocaleString()}円</TableCell>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              <TableCell>
                {transaction.category === 'sales' ? '営業' : '開発'}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(transaction)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 