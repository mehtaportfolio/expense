import React from 'react';
import { TrendingUpIcon, TrendingDownIcon, WalletIcon } from 'lucide-react';
import { Expense } from '../types/database';
interface SummaryCardsProps {
  expenses: Expense[];
}
export function SummaryCards({
  expenses
}: SummaryCardsProps) {
  const income = expenses.filter(e => e.expense_type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const expenseTotal = expenses.filter(e => e.expense_type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = income - expenseTotal;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-lg border border-primary p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary">Total Income</p>
            <p className="text-2xl font-semibold text-emerald-500 mt-1">
              {formatCurrency(income)}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <TrendingUpIcon className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-primary p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary">Total Expenses</p>
            <p className="text-2xl font-semibold text-red-500 mt-1">
              {formatCurrency(expenseTotal)}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
            <TrendingDownIcon className="w-6 h-6 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-primary p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary">Balance</p>
            <p className={`text-2xl font-semibold mt-1 ${balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>
    </div>;
}