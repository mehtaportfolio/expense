import React, { useMemo, useState } from 'react';
import { Expense } from '../types/database';
import { CircularProgress } from '../components/CircularProgress';
import { BarChart } from '../components/BarChart';
import { TransactionModal } from '../components/TransactionModal';
import { CalendarIcon } from 'lucide-react';
interface DashboardProps {
  expenses: Expense[];
  onExpenseUpdate?: () => void;
}
export function Dashboard({
  expenses,
  onExpenseUpdate
}: DashboardProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    expenseType: string;
    transactions: Expense[];
  }>({
    isOpen: false,
    expenseType: '',
    transactions: []
  });
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    const monthExpenses = expenses.filter(exp => {
      // Parse date string (YYYY-MM-DD format from Supabase)
      const dateParts = exp.date.split('-');
      const expYear = parseInt(dateParts[0]);
      const expMonth = parseInt(dateParts[1]); // Already 1-12
      return expYear === currentYear && expMonth === currentMonth;
    });
    const income = monthExpenses.filter(e => e.expense_type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const total = income + expense;
    const balance = income - expense;
    return {
      income,
      expense,
      total,
      balance,
      count: monthExpenses.length,
      expenses: monthExpenses
    };
  }, [expenses]);

  const expenseTypeChartData = useMemo(() => {
    const typeTotals: Record<string, number> = {};

    currentMonthData.expenses.forEach(exp => {
      const normalizedType = exp.expense_type.toLowerCase();
      typeTotals[normalizedType] = (typeTotals[normalizedType] || 0) + exp.amount;
    });



    return Object.entries(typeTotals)
      .map(([type, amount]) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: amount
      }))
      .sort((a, b) => b.value - a.value); // Sort by amount descending
  }, [currentMonthData.expenses]);

  const handleBarClick = (expenseTypeLabel: string) => {
    // Convert display label back to database format (lowercase)
    const expenseType = expenseTypeLabel.toLowerCase();

    const transactions = currentMonthData.expenses.filter(
      exp => exp.expense_type.toLowerCase() === expenseType
    );

    setModalState({
      isOpen: true,
      expenseType: expenseTypeLabel,
      transactions
    });
  };

  const handleModalClose = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleTransactionUpdate = () => {
    onExpenseUpdate?.();
  };
  const monthName = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });

  return <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CalendarIcon className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-semibold text-primary">{monthName}</h2>
        </div>
        <p className="text-sm text-tertiary">
          {currentMonthData.count} transactions this month
        </p>
      </div>

      <div className="flex justify-center py-8">
        <CircularProgress value={currentMonthData.total} max={currentMonthData.total > 0 ? currentMonthData.total * 1.2 : 100000} size={240} strokeWidth={16} label="Current Month Expenses" sublabel={`${currentMonthData.count} transactions`} />
      </div>

      {expenseTypeChartData.length > 0 && (
        <div className="mt-8">
          <BarChart
            data={expenseTypeChartData}
            title="Current Month Expenses by Type"
            height={180}
            showValues={true}
            onBarClick={handleBarClick}
          />
        </div>
      )}

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        expenseType={modalState.expenseType}
        transactions={modalState.transactions}
        onTransactionUpdate={handleTransactionUpdate}
      />
    </div>;
}
