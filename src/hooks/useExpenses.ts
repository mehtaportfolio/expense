import { useState, useEffect } from 'react';
import { Expense, ExpenseInsert, ExpenseUpdate } from '../types/database';
import { getApiUrl } from '../lib/api';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const password = sessionStorage.getItem('auth_password');
    return password ? { 'X-Auth-Password': password } : {};
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('/api/expenses'));
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: ExpenseInsert) => {
    try {
      const response = await fetch(getApiUrl('/api/expenses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(expense),
      });

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      await fetchExpenses();
      return { success: true };
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
      const response = await fetch(getApiUrl('/api/expenses/bulk'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(expensesToAdd),
      });

      if (!response.ok) {
        throw new Error('Failed to add expenses');
      }

      await fetchExpenses();
      return { success: true };
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
      const response = await fetch(getApiUrl(`/api/expenses/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      const updatedExpense = await response.json();
      setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp));
      
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update expense'
      };
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      const response = await fetch(getApiUrl(`/api/expenses/${id}`), {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      setExpenses(prev => prev.filter(exp => exp.id !== id));
      return { success: true };
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
