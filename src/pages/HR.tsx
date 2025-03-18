
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEmployee } from '@/context/EmployeeContext';
import { Employee, EmployeePayment } from '@/types/employee';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/layout/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

// Import HR components
import { EmployeeList } from '@/components/hr/EmployeeList';
import { EmployeeForm } from '@/components/hr/EmployeeForm';
import { PaymentList } from '@/components/hr/PaymentList';
import { PaymentForm } from '@/components/hr/PaymentForm';

const HR = () => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { 
    addEmployee, 
    updateEmployee, 
    addPayment, 
    updatePayment, 
    loading: employeeLoading 
  } = useEmployee();
  const navigate = useNavigate();

  // State for dialogs and forms
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [currentPayment, setCurrentPayment] = useState<EmployeePayment | null>(null);
  const [activeTab, setActiveTab] = useState<string>("employees");
  
  // 給与の月選択
  const currentMonth = new Date();
  const monthString = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(monthString);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
    
    // 管理者以外はアクセス拒否
    if (!authLoading && isAuthenticated && !isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  if (authLoading || employeeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // 従業員追加ダイアログを開く
  const openAddEmployeeDialog = () => {
    setIsAddEmployeeDialogOpen(true);
  };

  // 従業員編集ダイアログを開く
  const openEditEmployeeDialog = (id: string) => {
    const { getEmployeeById } = useEmployee();
    const employee = getEmployeeById(id);
    if (employee) {
      setCurrentEmployee(employee);
      setIsEditEmployeeDialogOpen(true);
    }
  };

  // 給与追加ダイアログを開く
  const openAddPaymentDialog = () => {
    setIsAddPaymentDialogOpen(true);
  };

  // 給与編集ダイアログを開く
  const openEditPaymentDialog = (payment: EmployeePayment) => {
    setCurrentPayment(payment);
    setIsEditPaymentDialogOpen(true);
  };

  // 従業員追加処理
  const handleAddEmployee = (data: Omit<Employee, 'id'>) => {
    addEmployee(data);
    setIsAddEmployeeDialogOpen(false);
  };

  // 従業員更新処理
  const handleUpdateEmployee = (data: Partial<Employee>) => {
    if (currentEmployee) {
      updateEmployee(currentEmployee.id, data);
    }
    setIsEditEmployeeDialogOpen(false);
    setCurrentEmployee(null);
  };

  // 給与追加処理
  const handleAddPayment = (data: Omit<EmployeePayment, 'id'>) => {
    addPayment(data);
    setIsAddPaymentDialogOpen(false);
  };

  // 給与更新処理
  const handleUpdatePayment = (data: Partial<EmployeePayment>) => {
    if (currentPayment) {
      updatePayment(currentPayment.id, data);
    }
    setIsEditPaymentDialogOpen(false);
    setCurrentPayment(null);
  };

  return (
    <Dashboard>
      <Header 
        title="人事・給与" 
        subtitle="従業員情報と給与管理"
      />
      
      <div className="px-6 pb-8">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:flex">
            <TabsTrigger value="employees">従業員管理</TabsTrigger>
            <TabsTrigger value="payroll">給与管理</TabsTrigger>
          </TabsList>
          
          {/* 従業員管理タブ */}
          <TabsContent value="employees" className="mt-6">
            <EmployeeList 
              onAddEmployee={openAddEmployeeDialog}
              onEditEmployee={openEditEmployeeDialog}
            />
          </TabsContent>
          
          {/* 給与管理タブ */}
          <TabsContent value="payroll" className="mt-6">
            <PaymentList 
              onAddPayment={openAddPaymentDialog}
              onEditPayment={openEditPaymentDialog}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 従業員追加ダイアログ */}
      <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>従業員を追加</DialogTitle>
            <DialogDescription>
              新しい従業員情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm 
            onSubmit={handleAddEmployee}
            onCancel={() => setIsAddEmployeeDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* 従業員編集ダイアログ */}
      <Dialog open={isEditEmployeeDialogOpen} onOpenChange={setIsEditEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>従業員情報を編集</DialogTitle>
            <DialogDescription>
              従業員情報を更新します。
            </DialogDescription>
          </DialogHeader>
          {currentEmployee && (
            <EmployeeForm 
              initialData={currentEmployee}
              onSubmit={handleUpdateEmployee}
              onCancel={() => {
                setIsEditEmployeeDialogOpen(false);
                setCurrentEmployee(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* 給与追加ダイアログ */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>給与情報を追加</DialogTitle>
            <DialogDescription>
              従業員の給与情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          <PaymentForm 
            onSubmit={handleAddPayment}
            onCancel={() => setIsAddPaymentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* 給与編集ダイアログ */}
      <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>給与情報を編集</DialogTitle>
            <DialogDescription>
              給与情報を更新します。
            </DialogDescription>
          </DialogHeader>
          {currentPayment && (
            <PaymentForm 
              initialData={currentPayment}
              onSubmit={handleUpdatePayment}
              onCancel={() => {
                setIsEditPaymentDialogOpen(false);
                setCurrentPayment(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Dashboard>
  );
};

export default HR;
