export type Json = string | number | boolean | null | {
  [key: string]: Json | undefined;
} | Json[];
export interface Database {
  public: {
    Tables: {
      master: {
        Row: {
          id: number;
          category: string;
          expense_type: string;
        };
        Insert: {
          id?: number;
          category: string;
          expense_type: string;
        };
        Update: {
          id?: number;
          category?: string;
          expense_type?: string;
        };
      };
      user_master: {
        Row: {
          id: number;
          master_password: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          master_password: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          master_password?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: number;
          description: string;
          amount: number;
          category: string;
          expense_type: string;
          date: string;
        };
        Insert: {
          id?: number;
          description: string;
          amount: number;
          category: string;
          expense_type: string;
          date: string;
        };
        Update: {
          id?: number;
          description?: string;
          amount?: number;
          category?: string;
          expense_type?: string;
          date?: string;
        };
      };
      salary_details: {
        Row: {
          id: number;
          date: string;
          gross_salary: number;
          epf: number;
          mf: number;
          vpf: number;
          etf: number;
        };
        Insert: {
          id?: number;
          date: string;
          gross_salary: number;
          epf?: number;
          mf?: number;
          vpf?: number;
          etf?: number;
        };
        Update: {
          id?: number;
          date?: string;
          gross_salary?: number;
          epf?: number;
          mf?: number;
          vpf?: number;
          etf?: number;
        };
      };
      milk_details: {
        Row: {
          id: number;
          sr_no: number;
          kg: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          sr_no: number;
          kg: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          sr_no?: number;
          kg?: number;
          created_at?: string;
        };
      };
    };
  };
}
export type Master = Database['public']['Tables']['master']['Row'];
export type MasterInsert = Database['public']['Tables']['master']['Insert'];
export type MasterUpdate = Database['public']['Tables']['master']['Update'];
export type UserMaster = Database['public']['Tables']['user_master']['Row'];
export type UserMasterInsert = Database['public']['Tables']['user_master']['Insert'];
export type UserMasterUpdate = Database['public']['Tables']['user_master']['Update'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
export type SalaryDetail = Database['public']['Tables']['salary_details']['Row'];
export type SalaryDetailInsert = Database['public']['Tables']['salary_details']['Insert'];
export type SalaryDetailUpdate = Database['public']['Tables']['salary_details']['Update'];
export type MilkDetail = Database['public']['Tables']['milk_details']['Row'];
export type MilkDetailInsert = Database['public']['Tables']['milk_details']['Insert'];
export type MilkDetailUpdate = Database['public']['Tables']['milk_details']['Update'];