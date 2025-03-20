
import React, { useState } from 'react';
import { format } from 'date-fns';
import { PlusCircle, Check, X, Pencil } from 'lucide-react';
import { Employee, EmployeePayment } from '@/types/employee';
import { useEmployee } from '@/context/EmployeeContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentListProps {
  onAddPayment: () => void;
  onEditPayment: (payment: EmployeePayment) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  onAddPayment,
  onEditPayment,
  selectedMonth,
  setSelectedMonth,
}) => {
  const { employees, payments, updatePayment } = useEmployee();

  // 過去12ヶ月分の選択肢を生成
  const monthOptions = Array.from({ length: 12 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return {
      value: `${year}-${month.toString().padStart(2, '0')}`,
      label: `${year}年${month}月`,
    };
  });

  // 選択された月のお支払いデータをフィルタリング
  const filteredPayments = payments.filter(
    payment => payment.month === selectedMonth
  );

  // 支払い状態の切り替え
  const togglePaymentStatus = (id: string, isPaid: boolean) => {
    updatePayment(id, {
      isPaid,
      paidAt: isPaid ? new Date().toISOString() : undefined,
    });
  };

  // 従業員名を取得
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : '不明';
  };

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
            <CardTitle>給与支払い管理</CardTitle>
            <CardDescription>
              月別給与支払い状況
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="月を選択" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onAddPayment}>
              <PlusCircle className="mr-2 h-4 w-4" />
              給与追加
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>従業員</TableHead>
              <TableHead>対象月</TableHead>
              <TableHead>支払予定日</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead>支払い状況</TableHead>
              <TableHead>実際の支払日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>{getEmployeeName(payment.employeeId)}</TableCell>
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
                          onClick={() => togglePaymentStatus(payment.id, true)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                          onClick={() => togglePaymentStatus(payment.id, false)}
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
                  {selectedMonth}の給与データはまだありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
