
import React, { useState } from 'react';
import { EmployeePayment } from '@/types/employee';
import { useEmployee } from '@/context/EmployeeContext';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { EmployeeSelect } from '@/components/kpi/EmployeeSelect';

interface PaymentFormProps {
  initialData?: EmployeePayment;
  onSubmit: (data: Omit<EmployeePayment, 'id'>) => void;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { employees } = useEmployee();
  
  // 過去12ヶ月分の選択肢を生成
  const monthOptions = Array.from({ length: 12 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
  });
  
  // デフォルトの支払い日を当月25日に設定
  const getDefaultPaymentDate = (month: string) => {
    const [year, monthStr] = month.split('-');
    return `${year}-${monthStr}-25`;
  };
  
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    month: initialData?.month || monthOptions[0],
    paymentDate: initialData?.paymentDate || getDefaultPaymentDate(initialData?.month || monthOptions[0]),
    amount: initialData?.amount || 0,
    isPaid: initialData?.isPaid || false,
    paidAt: initialData?.paidAt || '',
    notes: initialData?.notes || '',
  });

  const handleMonthChange = (month: string) => {
    setFormData(prev => ({
      ...prev,
      month,
      paymentDate: getDefaultPaymentDate(month)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EmployeeSelect
        value={formData.employeeId}
        onChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
        users={employees}
        label="従業員選択"
      />
      
      <div className="space-y-2">
        <Label htmlFor="month">対象月</Label>
        <select
          id="month"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          value={formData.month}
          onChange={(e) => handleMonthChange(e.target.value)}
          required
        >
          {monthOptions.map(month => (
            <option key={month} value={month}>
              {month.replace('-', '年')}月
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paymentDate">支払い日</Label>
        <Input
          id="paymentDate"
          type="date"
          value={formData.paymentDate}
          onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">給与額</Label>
        <div className="flex">
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            required
          />
          <span className="ml-2 flex items-center">円</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPaid"
          checked={formData.isPaid}
          onCheckedChange={(checked) => {
            const isPaid = checked === true;
            setFormData(prev => ({
              ...prev,
              isPaid,
              paidAt: isPaid ? new Date().toISOString() : '',
            }));
          }}
        />
        <Label htmlFor="isPaid">支払い済み</Label>
      </div>
      
      {formData.isPaid && (
        <div className="space-y-2">
          <Label htmlFor="paidAt">実際の支払日</Label>
          <Input
            id="paidAt"
            type="date"
            value={formData.paidAt ? new Date(formData.paidAt).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : new Date();
              setFormData(prev => ({ ...prev, paidAt: date.toISOString() }));
            }}
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="notes">メモ</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="特記事項があれば入力してください"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button type="submit">{initialData ? '更新' : '追加'}</Button>
      </DialogFooter>
    </form>
  );
};
