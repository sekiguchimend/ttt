
import React, { useState } from 'react';
import { Employee, EmploymentType } from '@/types/employee';
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

const EMPLOYMENT_TYPES: EmploymentType[] = [
  '正社員',
  '契約社員',
  'パート',
  'アルバイト',
  '業務委託',
];

interface EmployeeFormProps {
  initialData?: Partial<Employee>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    department: initialData?.department || '',
    role: initialData?.role || 'employee',
    employmentType: initialData?.employmentType || '正社員',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    salary: initialData?.salary || 0,
    bankInfo: {
      bankName: initialData?.bankInfo?.bankName || '',
      branchName: initialData?.bankInfo?.branchName || '',
      accountType: initialData?.bankInfo?.accountType || '普通',
      accountNumber: initialData?.bankInfo?.accountNumber || '',
      accountName: initialData?.bankInfo?.accountName || '',
    },
    documentUrl: initialData?.documentUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">部署</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">役割</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'admin' | 'employee' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="役割を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">管理者</SelectItem>
              <SelectItem value="employee">従業員</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employmentType">雇用形態</Label>
          <Select
            value={formData.employmentType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value as EmploymentType }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="雇用形態を選択" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startDate">入社日</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="salary">給与（月額）</Label>
        <div className="flex">
          <Input
            id="salary"
            name="salary"
            type="number"
            value={formData.salary}
            onChange={handleChange}
            required
          />
          <span className="ml-2 flex items-center">円</span>
        </div>
      </div>
      
      <div className="border p-4 rounded-md space-y-4">
        <h3 className="font-medium">銀行口座情報</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">銀行名</Label>
            <Input
              id="bankName"
              name="bankName"
              value={formData.bankInfo.bankName}
              onChange={handleBankInfoChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="branchName">支店名</Label>
            <Input
              id="branchName"
              name="branchName"
              value={formData.bankInfo.branchName}
              onChange={handleBankInfoChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountType">口座種別</Label>
            <Select
              value={formData.bankInfo.accountType}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                bankInfo: {
                  ...prev.bankInfo,
                  accountType: value as '普通' | '当座',
                }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="口座種別" />
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
              name="accountNumber"
              value={formData.bankInfo.accountNumber}
              onChange={handleBankInfoChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountName">口座名義</Label>
            <Input
              id="accountName"
              name="accountName"
              value={formData.bankInfo.accountName}
              onChange={handleBankInfoChange}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="documentUrl">書類URL</Label>
        <Input
          id="documentUrl"
          name="documentUrl"
          value={formData.documentUrl}
          onChange={handleChange}
          placeholder="書類のURL（任意）"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button type="submit">{initialData ? '更新' : '追加'}</Button>
      </DialogFooter>
    </form>
  );
};
