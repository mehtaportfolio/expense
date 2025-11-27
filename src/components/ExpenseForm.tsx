import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { SearchableSelect } from './SearchableSelect';
import { Button } from './Button';
import { useMaster } from '../hooks/useMaster';
import { CATEGORIES } from '../types/expense';
import { ExpenseInsert, Expense } from '../types/database';
interface ExpenseFormProps {
  categories?: string[];
  expense?: Expense;
  onSubmit: (expense: ExpenseInsert) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onCancel: () => void;
}
export function ExpenseForm({
  categories = [],
  expense,
  onSubmit,
  onCancel
}: ExpenseFormProps) {
  const { getExpenseTypeByCategory, isCategoryInMaster, addMasterEntry, loading: masterLoading } = useMaster();

  // Combine database categories with default categories, remove duplicates
  const allCategories = Array.from(new Set([...categories, ...CATEGORIES]));
  const categoryOptions = allCategories.map(cat => ({
    value: cat,
    label: cat
  }));

  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount?.toString() || '',
    category: expense?.category || '',
    date: expense?.date || new Date().toISOString().split('T')[0]
  });

  // Expense type is derived from category, but can be manually set for new categories
  const [manualExpenseType, setManualExpenseType] = useState<string | null>(null);
  const isNewCategory = masterLoading ? false : !isCategoryInMaster(formData.category);
  const currentExpenseType = masterLoading
    ? 'expense'
    : (manualExpenseType || getExpenseTypeByCategory(formData.category) || '');

  // Reset manual expense type when category changes
  useEffect(() => {
    setManualExpenseType(null);
  }, [formData.category]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // If this is a new category, ensure expense type is set
    if (isNewCategory && !currentExpenseType) {
      setErrors({ submit: 'Please select an expense type for the new category' });
      return;
    }

    setSubmitting(true);

    // Add to master table if this is a new category
    if (isNewCategory && currentExpenseType) {
      const masterResult = await addMasterEntry({
        category: formData.category,
        expense_type: currentExpenseType
      });
      if (!masterResult.success) {
        setSubmitting(false);
        setErrors({ submit: masterResult.error || 'Failed to add category to master table' });
        return;
      }
    }

    const result = await onSubmit({
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      expense_type: currentExpenseType,
      date: formData.date
    });
    setSubmitting(false);
    if (result.success) {
      onCancel();
    } else if (result.error) {
      setErrors({
        submit: result.error
      });
    }
  };
  if (masterLoading) {
    return <div className="space-y-4">
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-secondary">Loading category data...</p>
        </div>
      </div>;
  }

  return <form onSubmit={handleSubmit} className="space-y-1">

      <Input label="Date" type="date" value={formData.date} onChange={e => setFormData(prev => ({
      ...prev,
      date: e.target.value
    }))} error={errors.date} />

      {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

      <Input label="Amount" type="number" step="0.01" value={formData.amount} onChange={e => setFormData(prev => ({
      ...prev,
      amount: e.target.value
    }))} placeholder="0.00" error={errors.amount} />

      <Input label="Description" value={formData.description} onChange={e => setFormData(prev => ({
      ...prev,
      description: e.target.value
    }))} placeholder="Coffee, groceries, salary..." error={errors.description} autoFocus />

      <SearchableSelect label="Category" value={formData.category} onChange={value => setFormData(prev => ({
      ...prev,
      category: value
    }))} options={categoryOptions} allowAddNew />

      {isNewCategory ? (
        <Input
          label="Expense Type"
          value={currentExpenseType}
          onChange={e => setManualExpenseType(e.target.value)}
          placeholder="Enter expense type (e.g., income, expense)"
        />
      ) : (
        <div className="w-full">
          <label className="block text-sm font-medium text-secondary mb-1">
            Expense Type
          </label>
          <div className="px-3 py-2 bg-secondary border border-primary rounded-lg text-primary">
            {currentExpenseType}
          </div>
        </div>
      )}
      {isNewCategory && (
        <p className="text-sm text-blue-600 mt-1">
          New category detected. Please enter the appropriate expense type.
        </p>
      )}



      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
          {submitting ? 'Saving...' : expense ? 'Update' : isNewCategory ? 'Save' : 'Save'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>;
}