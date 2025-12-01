import { useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Expense, ExpenseInsert } from '../types/database';
import { AdvancedFilterBar } from '../components/AdvancedFilterBar';
import { ExpenseList } from '../components/ExpenseList';
import { ExpenseForm } from '../components/ExpenseForm';
import { DeleteConfirmation } from '../components/DeleteConfirmation';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { RecurringExpensesModal } from '../components/RecurringExpensesModal';
import { MilkTrackingModal } from '../components/MilkTrackingModal';
import { useMaster } from '../hooks/useMaster';
interface ExpensesProps {
  expenses: Expense[];
  categories: string[];
  mode?: 'view' | 'edit' | null;
  onAddExpense: (expense: ExpenseInsert) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onAddExpenses?: (expenses: ExpenseInsert[]) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onUpdateExpense: (id: number, updates: ExpenseInsert) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onDeleteExpense: (id: number) => Promise<{
    success: boolean;
    error?: string;
  }>;
}
interface FilterState {
  fromDate: string;
  toDate: string;
  category: string;
  description: string[];
  expense_type: string;
}
export function Expenses({
  expenses,
  categories,
  mode,
  onAddExpense,
  onAddExpenses,
  onUpdateExpense,
  onDeleteExpense
}: ExpensesProps) {
  const { masterData } = useMaster();
  const [filters, setFilters] = useState<FilterState>({
    fromDate: '',
    toDate: '',
    category: 'all',
    description: [],
    expense_type: 'all'
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isMilkModalOpen, setIsMilkModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const uniqueDescriptions = useMemo(() => {
    const descriptions = new Set(expenses.map(exp => exp.description));
    return Array.from(descriptions).sort();
  }, [expenses]);

  const uniqueCategories = useMemo(() => {
    return masterData.map(entry => entry.category).sort();
  }, [masterData]);

  const uniqueExpenseTypes = useMemo(() => {
    const expenseTypes = new Set(masterData.map(entry => entry.expense_type));
    return Array.from(expenseTypes).sort();
  }, [masterData]);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    // Date range filter - normalize date strings for proper comparison
    if (filters.fromDate) {
      result = result.filter(exp => {
        const expDate = exp.date.split('T')[0];
        return expDate >= filters.fromDate;
      });
    }
    if (filters.toDate) {
      result = result.filter(exp => {
        const expDate = exp.date.split('T')[0];
        return expDate <= filters.toDate;
      });
    }
    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(exp => exp.category === filters.category);
    }
    // Description filter
    if (filters.description.length > 0) {
      result = result.filter(exp => filters.description.includes(exp.description));
    }
    // Expense type filter
    if (filters.expense_type !== 'all') {
      result = result.filter(exp => exp.expense_type === filters.expense_type);
    }
    // Only limit to latest 20 when no filters are applied
    const hasActiveFilters = filters.fromDate || filters.toDate ||
      filters.category !== 'all' || filters.description.length > 0 ||
      filters.expense_type !== 'all';
    return hasActiveFilters ? result : result.slice(0, 20);
  }, [expenses, filters]);
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };
  const handleResetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      category: 'all',
      description: [],
      expense_type: 'all'
    });
  };
  const handleDelete = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    const result = await onDeleteExpense(deletingExpense.id);
    setIsDeleting(false);
    if (result.success) {
      setDeletingExpense(null);
    }
  };

  const handleAddExpenses = async (expensesToAdd: ExpenseInsert[]) => {
    if (onAddExpenses) {
      return await onAddExpenses(expensesToAdd);
    } else {
      // Fallback to individual adds
      for (const expense of expensesToAdd) {
        const result = await onAddExpense(expense);
        if (!result.success) {
          return result;
        }
      }
      return { success: true };
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Transactions</h2>
          <p className="text-sm text-secondary mt-1">
            Showing latest {filteredExpenses.length} of {expenses.length}{' '}
            transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsMilkModalOpen(true)}>
            Milk
          </Button>
          {mode !== 'view' && (
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <PlusIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <AdvancedFilterBar categories={uniqueCategories} descriptions={uniqueDescriptions} expenseTypes={uniqueExpenseTypes} onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} />

      <ExpenseList expenses={filteredExpenses} mode={mode} onEdit={setEditingExpense} onDelete={setDeletingExpense} />

      {mode !== 'view' && <>
      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Expense"
        headerContent={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsAddModalOpen(false);
              setIsRecurringModalOpen(true);
            }}
            className="p-1"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        }
      >
        <ExpenseForm categories={categories} onSubmit={onAddExpense} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Expense Modal */}
      <Modal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} title="Edit Expense">
        {editingExpense && <ExpenseForm categories={categories} expense={editingExpense} onSubmit={updates => onUpdateExpense(editingExpense.id, updates)} onCancel={() => setEditingExpense(null)} />}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingExpense} onClose={() => !isDeleting && setDeletingExpense(null)} title="Confirm Delete">
        {deletingExpense && <DeleteConfirmation expense={deletingExpense} onConfirm={handleDelete} onCancel={() => setDeletingExpense(null)} isDeleting={isDeleting} />}
      </Modal>

      {/* Recurring Expenses Modal */}
      <RecurringExpensesModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onAddExpenses={handleAddExpenses}
      />

      </>}

      {/* Milk Tracking Modal */}
      <MilkTrackingModal
        isOpen={isMilkModalOpen}
        onClose={() => setIsMilkModalOpen(false)}
        mode={mode}
      />
    </div>;
}