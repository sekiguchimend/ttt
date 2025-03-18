
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Contractor, ContractorPayment } from '@/types/employee';
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
import { ContractorForm } from '@/components/contractor/ContractorForm';
import { ContractorList } from '@/components/contractor/ContractorList';
import { ContractorPaymentForm } from '@/components/contractor/ContractorPaymentForm';
import { ContractorPaymentList } from '@/components/contractor/ContractorPaymentList';
import { useContractor } from '@/context/ContractorContext';

const Contractors = () => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const {
    contractors,
    addContractor,
    updateContractor,
    getContractorById,
    contractorPayments,
    addContractorPayment,
    updateContractorPayment,
    getContractorPaymentsByContractorId,
    loading: contractorLoading,
  } = useContractor();
  const navigate = useNavigate();

  // State for dialogs and forms
  const [isAddContractorDialogOpen, setIsAddContractorDialogOpen] = useState(false);
  const [isEditContractorDialogOpen, setIsEditContractorDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [currentContractor, setCurrentContractor] = useState<Contractor | null>(null);
  const [currentPayment, setCurrentPayment] = useState<ContractorPayment | null>(null);
  const [activeTab, setActiveTab] = useState<string>("contractorList");
  const [viewingContractorId, setViewingContractorId] = useState<string | null>(null);

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

  if (authLoading || contractorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // 業務委託先追加ダイアログを開く
  const openAddContractorDialog = () => {
    setIsAddContractorDialogOpen(true);
  };

  // 業務委託先編集ダイアログを開く
  const openEditContractorDialog = (id: string) => {
    const contractor = getContractorById(id);
    if (contractor) {
      setCurrentContractor(contractor);
      setIsEditContractorDialogOpen(true);
    }
  };

  // 支払い追加ダイアログを開く
  const openAddPaymentDialog = () => {
    if (!viewingContractorId) return;
    setIsAddPaymentDialogOpen(true);
  };

  // 支払い編集ダイアログを開く
  const openEditPaymentDialog = (payment: ContractorPayment) => {
    setCurrentPayment(payment);
    setIsEditPaymentDialogOpen(true);
  };

  // 業務委託先の支払い一覧を表示
  const viewContractorPayments = (contractorId: string) => {
    const contractor = getContractorById(contractorId);
    if (contractor) {
      setViewingContractorId(contractorId);
      setActiveTab("paymentList");
    }
  };

  // 業務委託先追加処理
  const handleAddContractor = (data: Omit<Contractor, 'id'>) => {
    addContractor(data);
    setIsAddContractorDialogOpen(false);
  };

  // 業務委託先更新処理
  const handleUpdateContractor = (data: Partial<Contractor>) => {
    if (currentContractor) {
      updateContractor(currentContractor.id, data);
    }
    setIsEditContractorDialogOpen(false);
    setCurrentContractor(null);
  };

  // 支払い追加処理
  const handleAddPayment = (data: Omit<ContractorPayment, 'id'>) => {
    addContractorPayment(data);
    setIsAddPaymentDialogOpen(false);
  };

  // 支払い更新処理
  const handleUpdatePayment = (data: Partial<ContractorPayment>) => {
    if (currentPayment) {
      updateContractorPayment(currentPayment.id, data);
    }
    setIsEditPaymentDialogOpen(false);
    setCurrentPayment(null);
  };

  // 支払い状態の切り替え
  const handleTogglePaymentStatus = (id: string, isPaid: boolean) => {
    updateContractorPayment(id, {
      isPaid,
      paidAt: isPaid ? new Date().toISOString() : undefined,
    });
  };

  // 一覧に戻る
  const backToList = () => {
    setViewingContractorId(null);
    setActiveTab("contractorList");
  };

  // 現在表示中の業務委託先
  const viewingContractor = viewingContractorId 
    ? getContractorById(viewingContractorId) 
    : null;

  // 現在表示中の業務委託先の支払い一覧
  const viewingPayments = viewingContractorId
    ? getContractorPaymentsByContractorId(viewingContractorId)
    : [];

  return (
    <Dashboard>
      <Header 
        title="業務委託管理" 
        subtitle="業務委託先の情報と支払い管理"
      />
      
      <div className="px-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:flex">
            <TabsTrigger value="contractorList" onClick={backToList}>業務委託先一覧</TabsTrigger>
            {viewingContractorId && (
              <TabsTrigger value="paymentList">支払い管理</TabsTrigger>
            )}
          </TabsList>
          
          {/* 業務委託先一覧タブ */}
          <TabsContent value="contractorList" className="mt-6">
            <ContractorList 
              contractors={contractors}
              onAddContractor={openAddContractorDialog}
              onEditContractor={openEditContractorDialog}
              onViewPayments={viewContractorPayments}
            />
          </TabsContent>
          
          {/* 支払い管理タブ */}
          {viewingContractor && (
            <TabsContent value="paymentList" className="mt-6">
              <ContractorPaymentList 
                contractor={viewingContractor}
                payments={viewingPayments}
                onAddPayment={openAddPaymentDialog}
                onEditPayment={openEditPaymentDialog}
                onTogglePaymentStatus={handleTogglePaymentStatus}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* 業務委託先追加ダイアログ */}
      <Dialog open={isAddContractorDialogOpen} onOpenChange={setIsAddContractorDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>業務委託先を追加</DialogTitle>
            <DialogDescription>
              新しい業務委託先情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          <ContractorForm 
            onSubmit={handleAddContractor}
            onCancel={() => setIsAddContractorDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* 業務委託先編集ダイアログ */}
      <Dialog open={isEditContractorDialogOpen} onOpenChange={setIsEditContractorDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>業務委託先情報を編集</DialogTitle>
            <DialogDescription>
              業務委託先情報を更新します。
            </DialogDescription>
          </DialogHeader>
          {currentContractor && (
            <ContractorForm 
              initialData={currentContractor}
              onSubmit={handleUpdateContractor}
              onCancel={() => {
                setIsEditContractorDialogOpen(false);
                setCurrentContractor(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* 支払い追加ダイアログ */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>支払い情報を追加</DialogTitle>
            <DialogDescription>
              業務委託先への支払い情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          {viewingContractorId && (
            <ContractorPaymentForm 
              contractorId={viewingContractorId}
              onSubmit={handleAddPayment}
              onCancel={() => setIsAddPaymentDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* 支払い編集ダイアログ */}
      <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>支払い情報を編集</DialogTitle>
            <DialogDescription>
              支払い情報を更新します。
            </DialogDescription>
          </DialogHeader>
          {currentPayment && viewingContractorId && (
            <ContractorPaymentForm 
              contractorId={viewingContractorId}
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

export default Contractors;
