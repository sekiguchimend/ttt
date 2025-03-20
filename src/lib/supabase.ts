import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// データベースの型定義
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'employee';
          department: string;
          avatar?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      employees: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'employee';
          department: string;
          employment_type: '正社員' | '契約社員' | 'パート' | 'アルバイト' | '業務委託';
          start_date: string;
          salary: number;
          bank_info: {
            bank_name: string;
            branch_name: string;
            account_type: '普通' | '当座';
            account_number: string;
            account_name: string;
          };
          document_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      employee_payments: {
        Row: {
          id: string;
          employee_id: string;
          month: string;
          payment_date: string;
          amount: number;
          is_paid: boolean;
          paid_at?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employee_payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employee_payments']['Insert']>;
      };
      contractors: {
        Row: {
          id: string;
          name: string;
          email: string;
          company_name: string;
          department: string;
          contract_type: '業務委託' | '派遣' | 'その他';
          start_date: string;
          end_date?: string;
          payment_cycle: '月次' | '週次' | '日次';
          payment_day: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contractors']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contractors']['Insert']>;
      };
      contractor_payments: {
        Row: {
          id: string;
          contractor_id: string;
          month: string;
          payment_date: string;
          amount: number;
          is_paid: boolean;
          paid_at?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contractor_payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contractor_payments']['Insert']>;
      };
      fixed_costs: {
        Row: {
          id: string;
          name: string;
          category: string;
          amount: number;
          payment_cycle: '月次' | '年次' | 'その他';
          payment_day: number;
          start_date: string;
          end_date?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fixed_costs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['fixed_costs']['Insert']>;
      };
      kpi_metrics: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          name: string;
          value: number;
          minimum_target: number;
          standard_target: number;
          stretch_target: number;
          unit: string;
          date: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kpi_metrics']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['kpi_metrics']['Insert']>;
      };
    };
  };
}; 