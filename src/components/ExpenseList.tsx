import React from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { Expense } from '../types/database';
import { CATEGORY_COLORS, Category } from '../types/expense';
interface ExpenseListProps {
  expenses: Expense[];
  mode?: 'view' | 'edit' | null;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}
export function ExpenseList({
  expenses,
  mode,
  onEdit,
  onDelete
}: ExpenseListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  if (expenses.length === 0) {
    return <div className="bg-card rounded-lg border border-primary p-12 text-center">
        <p className="text-secondary text-lg">No expenses found</p>
        <p className="text-tertiary text-sm mt-1">
          Add your first expense to get started
        </p>
      </div>;
  }
  return <div className="bg-card rounded-lg border border-primary divide-y divide-primary">
      {expenses.map(expense => <div key={expense.id} className="p-4 hover:bg-card-hover transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${CATEGORY_COLORS[expense.category as Category] || CATEGORY_COLORS.Other}`}>
                  {expense.category}
                </span>
                <span className="text-xs text-tertiary">
                  {formatDate(expense.date)}
                </span>
              </div>
              <p className="text-sm font-medium text-primary truncate">
                {expense.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className={`text-sm ${expense.expense_type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                {expense.expense_type === 'income' ? '+' : '-'}
                {formatCurrency(expense.amount)}
              </p>

                {mode !== 'view' && <div className="flex gap-1">
                <button onClick={() => onEdit(expense)} className="p-2 text-tertiary hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors" aria-label="Edit expense">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(expense)} className="p-2 text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" aria-label="Delete expense">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>}
            </div>
          </div>
        </div>)}
    </div>;
}