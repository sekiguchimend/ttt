
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Employee } from '@/types/employee';

interface EmployeeSelectProps {
  value: string;
  onChange: (value: string) => void;
  users?: Employee[];  // Make users optional
  label?: string;      // Add optional label prop
}

export const EmployeeSelect: React.FC<EmployeeSelectProps> = ({ 
  value, 
  onChange,
  users,
  label
}) => {
  // Use provided users or default to sample users
  const employeeList = users || [
    { id: '1', name: '管理者', department: '経営' },
    { id: '2', name: '山田太郎', department: '営業' }
  ];
  
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="従業員を選択" />
        </SelectTrigger>
        <SelectContent>
          {employeeList.map(user => (
            <SelectItem key={user.id} value={user.id}>
              {user.name} ({user.department})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
