import React, { useState } from 'react';
import { EditIcon, TrashIcon } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Expense } from '../types/database';
import { ExpenseForm } from './ExpenseForm';
import { DeleteConfirmation } from './DeleteConfirmation';
import { useExpenses } from '../hooks/useExpenses';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseType: string;
  transactions: Expense[];
  onTransactionUpdate: () => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  expenseType,
  transactions,
  onTransactionUpdate
}: TransactionModalProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const { updateExpense, deleteExpense, getUniqueCategories } = useExpenses();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
  };

  const handleEditSubmit = async (expenseData: Parameters<typeof updateExpense>[1]) => {
    if (!editingExpense) return { success: false, error: 'No expense selected' };

    const result = await updateExpense(editingExpense.id, expenseData);
    if (result.success) {
      setEditingExpense(null);
      onTransactionUpdate();
    }
    return result;
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;

    const result = await deleteExpense(deletingExpense.id);
    if (result.success) {
      setDeletingExpense(null);
      onTransactionUpdate();
    }
  };

  const totalAmount = transactions.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <>
      <Modal
        isOpen={isOpen && !editingExpense && !deletingExpense}
        onClose={onClose}
        title={`${expenseType} Transactions`}
      >
        <div className="space-y-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-card-secondary rounded-lg border border-primary"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary">
{expense.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <span>{formatDate(expense.date)}</span>                    
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <span className="font-semibold text-primary">
                    {formatCurrency(expense.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(expense)}
                    className="p-1"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(expense)}
                    className="p-1 text-red-500 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {editingExpense && (
        <Modal
          isOpen={true}
          onClose={() => setEditingExpense(null)}
          title="Edit Transaction"
        >
          <ExpenseForm
            categories={getUniqueCategories()}
            expense={editingExpense}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingExpense(null)}
          />
        </Modal>
      )}

      {deletingExpense && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingExpense(null)}
          title="Delete Transaction"
        >
          <DeleteConfirmation
            expense={deletingExpense}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingExpense(null)}
            isDeleting={false}
          />
        </Modal>
      )}
    </>
  );
}