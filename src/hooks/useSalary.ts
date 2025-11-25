import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SalaryDetail, SalaryDetailInsert, SalaryDetailUpdate } from '../types/database';

export function useSalary() {
  const [salaryDetails, setSalaryDetails] = useState<SalaryDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalaryDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('salary_details')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      setSalaryDetails(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch salary details');
    } finally {
      setLoading(false);
    }
  };

  const addSalaryDetail = async (salaryDetail: SalaryDetailInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('salary_details')
        .insert(salaryDetail)
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) {
        setSalaryDetails(prev => [data, ...prev]);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add salary detail'
      };
    }
  };

  const updateSalaryDetail = async (id: number, salaryDetail: SalaryDetailUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('salary_details')
        .update(salaryDetail)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setSalaryDetails(prev => prev.map(detail =>
          detail.id === id ? data : detail
        ));
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update salary detail'
      };
    }
  };

  const getSalaryDetailsByMonthYear = (month: number | null, year: number | null) => {
    return salaryDetails.filter(detail => {
      const date = new Date(detail.date);
      const detailMonth = date.getMonth();
      const detailYear = date.getFullYear();
      
      if (month !== null && year !== null) {
        return detailMonth === month && detailYear === year;
      } else if (month !== null) {
        return detailMonth === month;
      } else if (year !== null) {
        return detailYear === year;
      }
      return true;
    });
  };

  const getExpensesByMonthYear = (expenses: Array<{ date: string; amount: number }>, month: number | null, year: number | null) => {
    return expenses.filter(expense => {
      const date = new Date(expense.date);
      const expenseMonth = date.getMonth();
      const expenseYear = date.getFullYear();
      
      if (month !== null && year !== null) {
        return expenseMonth === month && expenseYear === year;
      } else if (month !== null) {
        return expenseMonth === month;
      } else if (year !== null) {
        return expenseYear === year;
      }
      return true;
    });
  };

  const calculateMonthlySummary = (salaryDetails: SalaryDetail[], expenses: Array<{ amount: number }>) => {
    if (salaryDetails.length === 0) return null;

    const totalGrossSalary = salaryDetails.reduce((sum, detail) => sum + detail.gross_salary, 0);
    const totalDirectSaving = salaryDetails.reduce((sum, detail) =>
      sum + detail.epf + detail.mf + detail.vpf + detail.etf, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balanceAmount = totalGrossSalary - totalDirectSaving - totalExpenses;
    const savingPercentage = totalGrossSalary > 0 ? ((totalGrossSalary - totalExpenses) / totalGrossSalary) * 100 : 0;

    return {
      grossSalary: totalGrossSalary,
      directSaving: totalDirectSaving,
      expenses: totalExpenses,
      balanceAmount,
      savingPercentage
    };
  };

  const calculateYearlySummary = (salaryDetails: SalaryDetail[], expenses: Array<{ amount: number }>, year: number) => {
    const monthSummaries = [];
    
    for (let month = 0; month < 12; month++) {
      const monthSalaries = salaryDetails.filter(detail => {
        const date = new Date(detail.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

      const monthExpenses = expenses.filter(expense => {
        const date = new Date(expense.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

      const totalGrossSalary = monthSalaries.reduce((sum, detail) => sum + detail.gross_salary, 0);
      const totalDirectSaving = monthSalaries.reduce((sum, detail) =>
        sum + detail.epf + detail.mf + detail.vpf + detail.etf, 0);
      const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const balanceAmount = totalGrossSalary - totalDirectSaving - totalExpenses;
      const savingPercentage = totalGrossSalary > 0 ? ((totalGrossSalary - totalExpenses) / totalGrossSalary) * 100 : 0;

      monthSummaries.push({
        month,
        grossSalary: totalGrossSalary,
        directSaving: totalDirectSaving,
        expenses: totalExpenses,
        balanceAmount,
        savingPercentage
      });
    }

    return monthSummaries;
  };

  useEffect(() => {
    fetchSalaryDetails();
  }, []);

  return {
    salaryDetails,
    loading,
    error,
    addSalaryDetail,
    updateSalaryDetail,
    refetch: fetchSalaryDetails,
    getSalaryDetailsByMonthYear,
    getExpensesByMonthYear,
    calculateMonthlySummary,
    calculateYearlySummary
  };
}