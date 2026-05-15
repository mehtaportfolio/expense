import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { Button } from './Button';
import { Expense } from '../types/database';
interface DeleteConfirmationProps {
  expense: Expense;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}
export function DeleteConfirmation({
  expense,
  onConfirm,
  onCancel,
  isDeleting
}: DeleteConfirmationProps) {
  return <div className="text-center">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangleIcon className="w-6 h-6 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-primary mb-2">
        Delete Expense?
      </h3>

      <p className="text-sm text-secondary mb-1">
        Are you sure you want to delete this expense?
      </p>

      <p className="text-sm font-medium text-primary mb-6">
        "{expense.description}"
      </p>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" className="flex-1" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>;
}