import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Expense, ExpenseInsert } from '../types/database';
import { Button } from './Button';
import { Input } from './Input';

interface RecurringExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpenses: (expenses: ExpenseInsert[]) => Promise<{ success: boolean; error?: string }>;
}

interface RecurringExpenseRow {
  category: string;
  description: string;
  expense_type: string;
  amount: number;
  date: string;
}

const RECURRING_CATEGORIES = [
  'House Rent',
  'Mess',
  'Monali',
  'TDS',
  'Proff Tax',
  'Light Bill',
  'Wifi'
];

export function RecurringExpensesModal({
  isOpen,
  onClose,
  onAddExpenses
}: RecurringExpensesModalProps) {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get last month date range
  const getLastMonthRange = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      start: lastMonth.toISOString().split('T')[0],
      end: lastMonthEnd.toISOString().split('T')[0]
    };
  };

  // Get current month date
  const getCurrentMonthDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const fetchLastMonthExpenses = async () => {
    try {
      setLoading(true);
      const { start, end } = getLastMonthRange();

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .in('category', RECURRING_CATEGORIES)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

      if (error) throw error;

      // Group by category and take the most recent entry for each
      const categoryMap = new Map<string, Expense>();

      data?.forEach(expense => {
        if (!categoryMap.has(expense.category)) {
          categoryMap.set(expense.category, expense);
        }
      });

      // Create rows for all recurring categories, using last month's data where available
      const rows: RecurringExpenseRow[] = RECURRING_CATEGORIES.map(category => {
        const lastMonthExpense = categoryMap.get(category);
        return {
          category,
          description: lastMonthExpense?.description || category,
          expense_type: lastMonthExpense?.expense_type || 'expense',
          amount: lastMonthExpense?.amount || 0,
          date: getCurrentMonthDate()
        };
      });

      setRecurringExpenses(rows);
    } catch (error) {
      console.error('Error fetching last month expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLastMonthExpenses();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAmountChange = (index: number, amount: string) => {
    const newExpenses = [...recurringExpenses];
    newExpenses[index].amount = parseFloat(amount) || 0;
    setRecurringExpenses(newExpenses);
  };

  const handleDateChange = (index: number, date: string) => {
    const newExpenses = [...recurringExpenses];
    newExpenses[index].date = date;

    // If this is the first row, update all other rows with the same date
    if (index === 0) {
      for (let i = 1; i < newExpenses.length; i++) {
        newExpenses[i].date = date;
      }
    }

    setRecurringExpenses(newExpenses);
  };

  const handleUpdate = async () => {
    // Filter out expenses with amount 0
    const expensesToAdd = recurringExpenses
      .filter(expense => expense.amount > 0)
      .map(expense => ({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        expense_type: expense.expense_type,
        date: expense.date
      }));

    if (expensesToAdd.length === 0) {
      return;
    }

    setSubmitting(true);
    const result = await onAddExpenses(expensesToAdd);
    setSubmitting(false);

    if (result.success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-primary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-primary px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Recurring Expenses</h2>
          <button onClick={onClose} className="text-tertiary hover:text-primary transition-colors" aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-secondary">Loading last month's data...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-primary">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="border border-primary px-4 py-2 text-left text-xs font-medium w-1/5">Category</th>
                      <th className="border border-primary px-4 py-2 text-left text-xs font-medium w-1/5">Description</th>
                      <th className="border border-primary px-4 py-2 text-left text-sm font-medium w-1/8">Date</th>
                      <th className="border border-primary px-4 py-2 text-left text-xs font-medium w-1/6">Exp Type</th>
                      <th className="border border-primary px-4 py-2 text-left text-sm font-medium w-1/2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringExpenses.map((expense, index) => (
                      <tr key={expense.category} className="hover:bg-secondary/50">
                        <td className="border border-primary px-4 py-2 text-xs w-1/5">{expense.category}</td>
                        <td className="border border-primary px-4 py-2 text-xs w-1/5">{expense.description}</td>
                        <td className="border border-primary px-4 py-2 w-1/8">
                          <input
                            type="date"
                            value={expense.date}
                            onChange={(e) => handleDateChange(index, e.target.value)}
                            className="w-full px-2 py-1 text-sm bg-card border border-primary rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-primary px-4 py-2 text-xs w-1/6">{expense.expense_type}</td>
                        <td className="border border-primary px-4 py-2 w-1/4">
                          <input
                            type="number"
                            step="0.01"
                            value={expense.amount}
                            onChange={(e) => handleAmountChange(index, e.target.value)}
                            className="w-full px-0 py-1 text-sm bg-card border border-primary rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdate}
                  variant="primary"
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Adding Expenses...' : 'Update Expenses'}
                </Button>
                <Button
                  onClick={onClose}
                  variant="secondary"
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}