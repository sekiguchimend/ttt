
import React, { useState } from 'react';
import { Contractor, EmployeeBankInfo } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContractorFormProps {
  initialData?: Contractor;
  onSubmit: (data: Omit<Contractor, 'id'>) => void;
  onCancel: () => void;
}

export const ContractorForm: React.FC<ContractorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<Contractor, 'id'>>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    company: initialData?.company || '',
    contactPerson: initialData?.contactPerson || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || '',
    contractAmount: initialData?.contractAmount || 0,
    paymentCycle: initialData?.paymentCycle || '月次',
    bankInfo: initialData?.bankInfo || {
      bankName: '',
      branchName: '',
      accountType: '普通',
      accountNumber: '',
      accountName: '',
    },
    documentUrl: initialData?.documentUrl || '',
    status: initialData?.status || '進行中',
    payments: initialData?.payments || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleBankInfoChange = (field: keyof EmployeeBankInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo!,
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">業務委託先名</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">会社名</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">担当者名</Label>
        <Input
          id="contactPerson"
          value={formData.contactPerson}
          onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">契約開始日</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate ? formData.startDate.split('T')[0] : ''}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">契約終了日</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate ? formData.endDate.split('T')[0] : ''}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contractAmount">契約金額</Label>
          <div className="flex">
            <Input
              id="contractAmount"
              type="number"
              value={formData.contractAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, contractAmount: Number(e.target.value) }))}
              required
            />
            <span className="ml-2 flex items-center">円</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paymentCycle">支払いサイクル</Label>
          <Select
            value={formData.paymentCycle}
            onValueChange={(value: '月次' | '週次' | '完了時') => setFormData(prev => ({ ...prev, paymentCycle: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="支払いサイクルを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="月次">月次</SelectItem>
              <SelectItem value="週次">週次</SelectItem>
              <SelectItem value="完了時">完了時</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">ステータス</Label>
        <Select
          value={formData.status}
          onValueChange={(value: '進行中' | '完了' | '中断') => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="ステータスを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="進行中">進行中</SelectItem>
            <SelectItem value="完了">完了</SelectItem>
            <SelectItem value="中断">中断</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 border p-4 rounded-md">
        <h3 className="font-medium">振込先情報</h3>
        
        <div className="space-y-2">
          <Label htmlFor="bankName">銀行名</Label>
          <Input
            id="bankName"
            value={formData.bankInfo?.bankName || ''}
            onChange={(e) => handleBankInfoChange('bankName', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="branchName">支店名</Label>
          <Input
            id="branchName"
            value={formData.bankInfo?.branchName || ''}
            onChange={(e) => handleBankInfoChange('branchName', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="accountType">口座種別</Label>
          <Select
            value={formData.bankInfo?.accountType || '普通'}
            onValueChange={(value: '普通' | '当座') => handleBankInfoChange('accountType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="口座種別を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="普通">普通</SelectItem>
              <SelectItem value="当座">当座</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="accountNumber">口座番号</Label>
          <Input
            id="accountNumber"
            value={formData.bankInfo?.accountNumber || ''}
            onChange={(e) => handleBankInfoChange('accountNumber', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="accountName">口座名義</Label>
          <Input
            id="accountName"
            value={formData.bankInfo?.accountName || ''}
            onChange={(e) => handleBankInfoChange('accountName', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="documentUrl">契約書URL</Label>
        <Input
          id="documentUrl"
          value={formData.documentUrl || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, documentUrl: e.target.value }))}
          placeholder="https://example.com/document.pdf"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button type="submit">{initialData ? '更新' : '追加'}</Button>
      </DialogFooter>
    </form>
  );
};
