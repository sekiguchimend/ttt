export interface Transaction {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  status: string;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
} 