import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, EmployeePayment, EmploymentType } from '@/types/employee';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
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
  addEmployee: (data: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addPayment: (data: Omit<EmployeePayment, 'id'>) => Promise<void>;
  updatePayment: (id: string, data: Partial<EmployeePayment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
  getPaymentById: (id: string) => EmployeePayment | undefined;
  loading: boolean;
  fetchEmployees: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType>({
  employees: [],
  payments: [],
  addEmployee: async () => {},
  updateEmployee: async () => {},
  deleteEmployee: async () => {},
  addPayment: async () => {},
  updatePayment: async () => {},
  deletePayment: async () => {},
  getEmployeeById: () => undefined,
  getPaymentById: () => undefined,
  loading: true,
  fetchEmployees: async () => {},
});

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState<EmployeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // 従業員データの取得
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setEmployees(data.map(employee => ({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          department: employee.department,
          employmentType: employee.employment_type,
          startDate: employee.start_date,
          salary: employee.salary,
          bankInfo: employee.bank_info,
          documentUrl: employee.document_url,
        })));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "エラー",
        description: "従業員データの取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // 給与データの取得
  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPayments(data.map(payment => ({
          id: payment.id,
          employeeId: payment.employee_id,
          month: payment.month,
          paymentDate: payment.payment_date,
          amount: payment.amount,
          isPaid: payment.is_paid,
          paidAt: payment.paid_at,
          notes: payment.notes,
        })));
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "エラー",
        description: "給与データの取得に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // 初期データの読み込み
  useEffect(() => {
    Promise.all([fetchEmployees(), fetchPayments()]).finally(() => {
      setLoading(false);
    });
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
  
  // 従業員の追加
  const addEmployee = async (data: Omit<Employee, 'id'>) => {
    try {
      const { data: newEmployee, error } = await supabase
        .from('employees')
        .insert({
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
          employment_type: data.employmentType,
          start_date: data.startDate,
          salary: data.salary,
          bank_info: data.bankInfo,
          document_url: data.documentUrl,
        })
        .select()
        .single();

      if (error) throw error;

      if (newEmployee) {
        setEmployees(prev => [{
          id: newEmployee.id,
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
          department: newEmployee.department,
          employmentType: newEmployee.employment_type,
          startDate: newEmployee.start_date,
          salary: newEmployee.salary,
          bankInfo: newEmployee.bank_info,
          documentUrl: newEmployee.document_url,
        }, ...prev]);

        toast({
          title: "従業員を追加しました",
          description: `${data.name}さんを追加しました。`,
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "エラー",
        description: "従業員の追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // 従業員の更新
  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    try {
      const { data: updatedEmployee, error } = await supabase
        .from('employees')
        .update({
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
          employment_type: data.employmentType,
          start_date: data.startDate,
          salary: data.salary,
          bank_info: data.bankInfo,
          document_url: data.documentUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updatedEmployee) {
        setEmployees(prev => prev.map(employee =>
          employee.id === id
            ? {
                id: updatedEmployee.id,
                name: updatedEmployee.name,
                email: updatedEmployee.email,
                role: updatedEmployee.role,
                department: updatedEmployee.department,
                employmentType: updatedEmployee.employment_type,
                startDate: updatedEmployee.start_date,
                salary: updatedEmployee.salary,
                bankInfo: updatedEmployee.bank_info,
                documentUrl: updatedEmployee.document_url,
              }
            : employee
        ));

        toast({
          title: "従業員情報を更新しました",
          description: `${data.name}さんの情報を更新しました。`,
        });
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "エラー",
        description: "従業員情報の更新に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // 従業員の削除
  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmployees(prev => prev.filter(employee => employee.id !== id));

      toast({
        title: "従業員を削除しました",
        description: "従業員を削除しました。",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "エラー",
        description: "従業員の削除に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // 給与の追加
  const addPayment = async (data: Omit<EmployeePayment, 'id'>) => {
    try {
      const { data: newPayment, error } = await supabase
        .from('employee_payments')
        .insert({
          employee_id: data.employeeId,
          month: data.month,
          payment_date: data.paymentDate,
          amount: data.amount,
          is_paid: data.isPaid,
          paid_at: data.paidAt,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;

      if (newPayment) {
        setPayments(prev => [{
          id: newPayment.id,
          employeeId: newPayment.employee_id,
          month: newPayment.month,
          paymentDate: newPayment.payment_date,
          amount: newPayment.amount,
          isPaid: newPayment.is_paid,
          paidAt: newPayment.paid_at,
          notes: newPayment.notes,
        }, ...prev]);

        toast({
          title: "給与情報を追加しました",
          description: "給与情報を追加しました。",
        });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "エラー",
        description: "給与情報の追加に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // 給与の更新
  const updatePayment = async (id: string, data: Partial<EmployeePayment>) => {
    try {
      const { data: updatedPayment, error } = await supabase
        .from('employee_payments')
        .update({
          employee_id: data.employeeId,
          month: data.month,
          payment_date: data.paymentDate,
          amount: data.amount,
          is_paid: data.isPaid,
          paid_at: data.paidAt,
          notes: data.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updatedPayment) {
        setPayments(prev => prev.map(payment =>
          payment.id === id
            ? {
                id: updatedPayment.id,
                employeeId: updatedPayment.employee_id,
                month: updatedPayment.month,
                paymentDate: updatedPayment.payment_date,
                amount: updatedPayment.amount,
                isPaid: updatedPayment.is_paid,
                paidAt: updatedPayment.paid_at,
                notes: updatedPayment.notes,
              }
            : payment
        ));

        toast({
          title: "給与情報を更新しました",
          description: "給与情報を更新しました。",
        });
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "エラー",
        description: "給与情報の更新に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // 給与の削除
  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPayments(prev => prev.filter(payment => payment.id !== id));

      toast({
        title: "給与情報を削除しました",
        description: "給与情報を削除しました。",
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "エラー",
        description: "給与情報の削除に失敗しました。",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // 従業員の取得
  const getEmployeeById = (id: string) => {
    return employees.find(employee => employee.id === id);
  };

  // 給与の取得
  const getPaymentById = (id: string) => {
    return payments.find(payment => payment.id === id);
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
      getPaymentById,
      loading,
      fetchEmployees
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => useContext(EmployeeContext);
