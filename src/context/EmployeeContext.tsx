
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, EmployeePayment, EmploymentType } from '@/types/employee';
import { User } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// サンプルデータ
const SAMPLE_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: '管理者',
    email: 'admin@example.com',
    role: 'admin',
    department: '経営',
    employmentType: '正社員',
    startDate: '2020-01-01',
    salary: 450000,
    bankInfo: {
      bankName: '三菱UFJ銀行',
      branchName: '東京支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountName: 'カンリシャ'
    }
  },
  {
    id: '2',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'employee',
    department: '営業',
    employmentType: '正社員',
    startDate: '2022-04-01',
    salary: 320000,
    bankInfo: {
      bankName: 'みずほ銀行',
      branchName: '渋谷支店',
      accountType: '普通',
      accountNumber: '7654321',
      accountName: 'ヤマダ タロウ'
    }
  },
];

const SAMPLE_PAYMENTS: EmployeePayment[] = [
  {
    id: '1',
    employeeId: '1',
    amount: 450000,
    month: '2023-05',
    paymentDate: '2023-05-25', // Added missing paymentDate property
    isPaid: true,
    paidAt: '2023-05-25T10:00:00Z',
  },
  {
    id: '2',
    employeeId: '1',
    amount: 450000,
    month: '2023-06',
    paymentDate: '2023-06-25', // Added missing paymentDate property
    isPaid: true,
    paidAt: '2023-06-25T10:00:00Z',
  },
  {
    id: '3',
    employeeId: '2',
    amount: 320000,
    month: '2023-05',
    paymentDate: '2023-05-25', // Added missing paymentDate property
    isPaid: true,
    paidAt: '2023-05-25T10:00:00Z',
  },
  {
    id: '4',
    employeeId: '2',
    amount: 320000,
    month: '2023-06',
    paymentDate: '2023-06-25', // Added missing paymentDate property
    isPaid: false,
  },
];

interface EmployeeContextType {
  employees: Employee[];
  payments: EmployeePayment[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addPayment: (payment: Omit<EmployeePayment, 'id'>) => void;
  updatePayment: (id: string, data: Partial<EmployeePayment>) => void;
  deletePayment: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getPaymentsByEmployee: (employeeId: string) => EmployeePayment[];
  getPaymentsByMonth: (month: string) => EmployeePayment[];
  loading: boolean;
}

const EmployeeContext = createContext<EmployeeContextType>({
  employees: [],
  payments: [],
  addEmployee: () => {},
  updateEmployee: () => {},
  deleteEmployee: () => {},
  addPayment: () => {},
  updatePayment: () => {},
  deletePayment: () => {},
  getEmployeeById: () => undefined,
  getPaymentsByEmployee: () => [],
  getPaymentsByMonth: () => [],
  loading: false,
});

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState<EmployeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Load sample data
  useEffect(() => {
    const storedEmployees = localStorage.getItem('erp_employees');
    const storedPayments = localStorage.getItem('erp_payments');
    
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      setEmployees(SAMPLE_EMPLOYEES);
      localStorage.setItem('erp_employees', JSON.stringify(SAMPLE_EMPLOYEES));
    }
    
    if (storedPayments) {
      setPayments(JSON.parse(storedPayments));
    } else {
      setPayments(SAMPLE_PAYMENTS);
      localStorage.setItem('erp_payments', JSON.stringify(SAMPLE_PAYMENTS));
    }
    
    setLoading(false);
  }, []);
  
  // Save data when it changes
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem('erp_employees', JSON.stringify(employees));
    }
  }, [employees]);
  
  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem('erp_payments', JSON.stringify(payments));
    }
  }, [payments]);
  
  // Employee CRUD
  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
    };
    setEmployees(prev => [...prev, newEmployee]);
    toast({
      title: "従業員追加完了",
      description: `${employee.name}さんを追加しました`,
    });
  };
  
  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(prev => 
      prev.map(employee => 
        employee.id === id ? { ...employee, ...data } : employee
      )
    );
    toast({
      title: "従業員情報更新完了",
      description: "従業員情報を更新しました",
    });
  };
  
  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(employee => employee.id !== id));
    toast({
      title: "従業員削除完了",
      description: "従業員を削除しました",
    });
  };
  
  // Payment CRUD
  const addPayment = (payment: Omit<EmployeePayment, 'id'>) => {
    const newPayment: EmployeePayment = {
      ...payment,
      id: Date.now().toString(),
    };
    setPayments(prev => [...prev, newPayment]);
    toast({
      title: "給与データ追加完了",
      description: `${payment.month}の給与データを追加しました`,
    });
  };
  
  const updatePayment = (id: string, data: Partial<EmployeePayment>) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === id ? { ...payment, ...data } : payment
      )
    );
    toast({
      title: "給与データ更新完了",
      description: "給与情報を更新しました",
    });
  };
  
  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(payment => payment.id !== id));
    toast({
      title: "給与データ削除完了",
      description: "給与データを削除しました",
    });
  };
  
  // Getter functions
  const getEmployeeById = (id: string) => {
    return employees.find(employee => employee.id === id);
  };
  
  const getPaymentsByEmployee = (employeeId: string) => {
    return payments.filter(payment => payment.employeeId === employeeId);
  };
  
  const getPaymentsByMonth = (month: string) => {
    return payments.filter(payment => payment.month === month);
  };
  
  return (
    <EmployeeContext.Provider value={{
      employees,
      payments,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addPayment,
      updatePayment,
      deletePayment,
      getEmployeeById,
      getPaymentsByEmployee,
      getPaymentsByMonth,
      loading
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => useContext(EmployeeContext);
