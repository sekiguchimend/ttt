
import React from 'react';
import { format } from 'date-fns';
import { PlusCircle, Check, X, Pencil } from 'lucide-react';
import { Contractor, ContractorPayment } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ContractorPaymentListProps {
  contractor: Contractor;
  payments: ContractorPayment[];
  onAddPayment: () => void;
  onEditPayment: (payment: ContractorPayment) => void;
  onTogglePaymentStatus: (id: string, isPaid: boolean) => void;
}

export const ContractorPaymentList: React.FC<ContractorPaymentListProps> = ({
  contractor,
  payments,
  onAddPayment,
  onEditPayment,
  onTogglePaymentStatus,
}) => {
  // 日付を表示用にフォーマット
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'yyyy/MM/dd');
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{contractor.name}の支払い管理</CardTitle>
            <CardDescription>
              業務委託先への支払い状況
            </CardDescription>
          </div>
          <Button onClick={onAddPayment}>
            <PlusCircle className="mr-2 h-4 w-4" />
            支払いを追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>対象月</TableHead>
              <TableHead>支払予定日</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead>支払い状況</TableHead>
              <TableHead>実際の支払日</TableHead>
              <TableHead>メモ</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length > 0 ? (
              payments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.month.replace('-', '年')}月</TableCell>
                  <TableCell>{payment.paymentDate ? formatDate(payment.paymentDate) : '-'}</TableCell>
                  <TableCell className="text-right">{payment.amount.toLocaleString()}円</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {payment.isPaid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="mr-1 h-3 w-3" />
                          支払い済み
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <X className="mr-1 h-3 w-3" />
                          未払い
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.paidAt 
                      ? formatDate(payment.paidAt)
                      : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{payment.notes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditPayment(payment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!payment.isPaid ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => onTogglePaymentStatus(payment.id, true)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                          onClick={() => onTogglePaymentStatus(payment.id, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  支払いデータはまだありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
