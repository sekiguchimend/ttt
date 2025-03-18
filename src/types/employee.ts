
export type EmploymentType = '正社員' | '契約社員' | 'パート' | 'アルバイト' | '業務委託';

export interface EmployeeBankInfo {
  bankName: string;
  branchName: string;
  accountType: '普通' | '当座';
  accountNumber: string;
  accountName: string;
}

export interface EmployeePayment {
  id: string;
  employeeId: string;
  amount: number;
  month: string; // YYYY-MM format
  paymentDate: string; // 支払い日 (YYYY-MM-DD format)
  isPaid: boolean;
  paidAt?: string;
  notes?: string;
}

export interface Employee extends User {
  employmentType: EmploymentType;
  startDate: string;
  salary: number;
  bankInfo?: EmployeeBankInfo;
  documentUrl?: string;
  payments?: EmployeePayment[];
}

export interface Contractor {
  id: string;
  name: string;
  email: string;
  company?: string;
  contactPerson?: string;
  startDate: string;
  endDate?: string;
  contractAmount: number;
  paymentCycle: '月次' | '週次' | '完了時';
  bankInfo?: EmployeeBankInfo;
  documentUrl?: string;
  status: '進行中' | '完了' | '中断';
  payments?: ContractorPayment[];
}

export interface ContractorPayment {
  id: string;
  contractorId: string;
  amount: number;
  month: string; // YYYY-MM format
  paymentDate: string; // 支払い日 (YYYY-MM-DD format)
  isPaid: boolean;
  paidAt?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  avatar?: string;
}
