import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Expense, ExpenseInsert, ExpenseUpdate } from '../types/database';
export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const fetchExpenses = async () => {
  try {
    setLoading(true);
    setError(null);
    const allData: Expense[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;
    while (hasMore) {
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .range(from, from + batchSize - 1);
      if (fetchError) throw fetchError;
      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allData.push(...data);
        from += batchSize;
        hasMore = data.length === batchSize;
      }
    }
    setExpenses(allData);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
  } finally {
    setLoading(false);
  }
};

  const addExpense = async (expense: ExpenseInsert) => {
    try {
      const {
        data,
        error: insertError
      } = await supabase.from('expenses').insert([expense]).select();
      if (insertError) throw insertError;
      if (data && data.length > 0) {
        setExpenses(prev => [data[0], ...prev]);
      } else {
        await fetchExpenses();
      }
      return {
        success: true
      };
    } catch (err) {
      console.error('Error adding expense:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add expense'
      };
    }
  };

  const addExpenses = async (expensesToAdd: ExpenseInsert[]) => {
    try {
      const {
        data,
        error: insertError
      } = await supabase.from('expenses').insert(expensesToAdd).select();
      if (insertError) throw insertError;
      if (data && data.length > 0) {
        setExpenses(prev => [...data, ...prev]);
      } else {
        await fetchExpenses();
      }
      return {
        success: true
      };
    } catch (err) {
      console.error('Error adding expenses:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add expenses'
      };
    }
  };
  const updateExpense = async (id: number, updates: ExpenseUpdate) => {
    try {
      const {
        data,
        error: updateError
      } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
      if (updateError) throw updateError;
      if (data) {
        setExpenses(prev => prev.map(exp => exp.id === id ? data : exp));
      }
      return {
        success: true
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update expense'
      };
    }
  };
  const deleteExpense = async (id: number) => {
    try {
      const {
        error: deleteError
      } = await supabase.from('expenses').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      return {
        success: true
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete expense'
      };
    }
  };
  const getUniqueCategories = () => {
    const categories = new Set(expenses.map(exp => exp.category));
    return Array.from(categories).sort();
  };

  useEffect(() => {
    fetchExpenses();
  }, []);
  return {
    expenses,
    loading,
    error,
    addExpense,
    addExpenses,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
    getUniqueCategories
  };
}