
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contractor, ContractorPayment } from '@/types/employee';
import { useToast } from '@/hooks/use-toast';

// サンプルデータ
const SAMPLE_CONTRACTORS: Contractor[] = [
  {
    id: '1',
    name: '山田システム開発',
    email: 'yamada@example.com',
    company: '株式会社山田システム',
    contactPerson: '山田一郎',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    contractAmount: 500000,
    paymentCycle: '月次',
    bankInfo: {
      bankName: 'みずほ銀行',
      branchName: '渋谷支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountName: 'ヤマダ システム（カ',
    },
    documentUrl: 'https://example.com/contract.pdf',
    status: '進行中',
  },
  {
    id: '2',
    name: '佐藤デザイン事務所',
    email: 'sato@example.com',
    company: '佐藤デザイン事務所',
    contactPerson: '佐藤花子',
    startDate: '2023-03-15',
    contractAmount: 300000,
    paymentCycle: '月次',
    bankInfo: {
      bankName: '三菱UFJ銀行',
      branchName: '新宿支店',
      accountType: '普通',
      accountNumber: '7654321',
      accountName: 'サトウ ハナコ',
    },
    status: '進行中',
  },
];

const SAMPLE_CONTRACTOR_PAYMENTS: ContractorPayment[] = [
  {
    id: '1',
    contractorId: '1',
    amount: 500000,
    month: '2023-05',
    paymentDate: '2023-05-30',
    isPaid: true,
    paidAt: '2023-05-30T10:00:00Z',
    notes: '5月分の開発報酬',
  },
  {
    id: '2',
    contractorId: '1',
    amount: 500000,
    month: '2023-06',
    paymentDate: '2023-06-30',
    isPaid: false,
  },
  {
    id: '3',
    contractorId: '2',
    amount: 300000,
    month: '2023-05',
    paymentDate: '2023-05-30',
    isPaid: true,
    paidAt: '2023-05-30T10:00:00Z',
    notes: '5月分のデザイン報酬',
  },
];

interface ContractorContextType {
  contractors: Contractor[];
  contractorPayments: ContractorPayment[];
  addContractor: (contractor: Omit<Contractor, 'id'>) => void;
  updateContractor: (id: string, data: Partial<Contractor>) => void;
  deleteContractor: (id: string) => void;
  getContractorById: (id: string) => Contractor | undefined;
  addContractorPayment: (payment: Omit<ContractorPayment, 'id'>) => void;
  updateContractorPayment: (id: string, data: Partial<ContractorPayment>) => void;
  deleteContractorPayment: (id: string) => void;
  getContractorPaymentsByContractorId: (contractorId: string) => ContractorPayment[];
  loading: boolean;
}

const ContractorContext = createContext<ContractorContextType>({
  contractors: [],
  contractorPayments: [],
  addContractor: () => {},
  updateContractor: () => {},
  deleteContractor: () => {},
  getContractorById: () => undefined,
  addContractorPayment: () => {},
  updateContractorPayment: () => {},
  deleteContractorPayment: () => {},
  getContractorPaymentsByContractorId: () => [],
  loading: false,
});

export const ContractorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [contractorPayments, setContractorPayments] = useState<ContractorPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Load sample data
  useEffect(() => {
    const storedContractors = localStorage.getItem('erp_contractors');
    const storedContractorPayments = localStorage.getItem('erp_contractor_payments');
    
    if (storedContractors) {
      setContractors(JSON.parse(storedContractors));
    } else {
      setContractors(SAMPLE_CONTRACTORS);
      localStorage.setItem('erp_contractors', JSON.stringify(SAMPLE_CONTRACTORS));
    }
    
    if (storedContractorPayments) {
      setContractorPayments(JSON.parse(storedContractorPayments));
    } else {
      setContractorPayments(SAMPLE_CONTRACTOR_PAYMENTS);
      localStorage.setItem('erp_contractor_payments', JSON.stringify(SAMPLE_CONTRACTOR_PAYMENTS));
    }
    
    setLoading(false);
  }, []);
  
  // Save data when it changes
  useEffect(() => {
    if (contractors.length > 0) {
      localStorage.setItem('erp_contractors', JSON.stringify(contractors));
    }
  }, [contractors]);
  
  useEffect(() => {
    if (contractorPayments.length > 0) {
      localStorage.setItem('erp_contractor_payments', JSON.stringify(contractorPayments));
    }
  }, [contractorPayments]);
  
  // Contractor CRUD
  const addContractor = (contractor: Omit<Contractor, 'id'>) => {
    const newContractor: Contractor = {
      ...contractor,
      id: Date.now().toString(),
    };
    setContractors(prev => [...prev, newContractor]);
    toast({
      title: "業務委託先追加完了",
      description: `${contractor.name}を追加しました`,
    });
  };
  
  const updateContractor = (id: string, data: Partial<Contractor>) => {
    setContractors(prev => 
      prev.map(contractor => 
        contractor.id === id ? { ...contractor, ...data } : contractor
      )
    );
    toast({
      title: "業務委託先情報更新完了",
      description: "業務委託先情報を更新しました",
    });
  };
  
  const deleteContractor = (id: string) => {
    setContractors(prev => prev.filter(contractor => contractor.id !== id));
    toast({
      title: "業務委託先削除完了",
      description: "業務委託先を削除しました",
    });
  };
  
  const getContractorById = (id: string) => {
    return contractors.find(contractor => contractor.id === id);
  };
  
  // ContractorPayment CRUD
  const addContractorPayment = (payment: Omit<ContractorPayment, 'id'>) => {
    const newPayment: ContractorPayment = {
      ...payment,
      id: Date.now().toString(),
    };
    setContractorPayments(prev => [...prev, newPayment]);
    toast({
      title: "支払いデータ追加完了",
      description: `${payment.month}の支払いデータを追加しました`,
    });
  };
  
  const updateContractorPayment = (id: string, data: Partial<ContractorPayment>) => {
    setContractorPayments(prev => 
      prev.map(payment => 
        payment.id === id ? { ...payment, ...data } : payment
      )
    );
    toast({
      title: "支払いデータ更新完了",
      description: "支払い情報を更新しました",
    });
  };
  
  const deleteContractorPayment = (id: string) => {
    setContractorPayments(prev => prev.filter(payment => payment.id !== id));
    toast({
      title: "支払いデータ削除完了",
      description: "支払いデータを削除しました",
    });
  };
  
  const getContractorPaymentsByContractorId = (contractorId: string) => {
    return contractorPayments.filter(payment => payment.contractorId === contractorId);
  };
  
  return (
    <ContractorContext.Provider value={{
      contractors,
      contractorPayments,
      addContractor,
      updateContractor,
      deleteContractor,
      getContractorById,
      addContractorPayment,
      updateContractorPayment,
      deleteContractorPayment,
      getContractorPaymentsByContractorId,
      loading,
    }}>
      {children}
    </ContractorContext.Provider>
  );
};

export const useContractor = () => useContext(ContractorContext);
