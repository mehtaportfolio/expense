import React, { useState } from 'react';

import { Input } from './Input';
import { SearchableSelect } from './SearchableSelect';
import { Button } from './Button';
import { useMaster } from '../hooks/useMaster';
import { CATEGORIES } from '../types/expense';
import { ExpenseInsert, Expense } from '../types/database';
import { Modal } from './Modal';
import { PlusIcon } from 'lucide-react';

const EXPENSE_TYPE_VALUES = ['expense', 'income'] as const;
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
  const {
    getExpenseTypeByCategory,
    isCategoryInMaster,
    addMasterEntry,
    loading: masterLoading,
    refetch,
    masterData
  } = useMaster();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newMasterCategory, setNewMasterCategory] = useState('');
  const [newExpenseType, setNewExpenseType] = useState('');

  const masterExpenseTypes = Array.from(
    new Set(
      // case-insensitive unique set, normalized to lower-case
      masterData
        .map((m) => m.expense_type?.toLowerCase())
        .filter(Boolean) as string[]
    )
  );

  const normalizeType = (v: string) => v.trim().toLowerCase();



  // Category dropdown should come from master table (so newly saved categories appear immediately)
  const allCategories = Array.from(
    new Set([...masterData.map(m => m.category), ...CATEGORIES])
  );
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

  // Expense type is derived from category (must exist in master)
  const isNewCategory = masterLoading ? false : !isCategoryInMaster(formData.category);

  // If the master lookup fails for any reason, try a case-insensitive match locally.
  const fallbackExpenseType = (() => {
    const cat = formData.category?.trim().toLowerCase();
    if (!cat) return null;
    const masterEntry = masterData.find(m => m.category?.trim().toLowerCase() === cat);
    return masterEntry?.expense_type?.trim() || null;
  })();

  const currentExpenseType = masterLoading
    ? 'expense'
    : (getExpenseTypeByCategory(formData.category) || fallbackExpenseType || '');

  // Use the master-provided expense_type for storage.
  // It may be values like 'Dining', 'Groceries', etc, not strictly 'expense'/'income'.
  const normalizedCurrentExpenseType = currentExpenseType?.trim();




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

    // If this is a new category, we must create it via the category modal.
    if (isNewCategory) {
      setErrors({ submit: 'Please add this category using the C icon first.' });
      return;
    }


    setSubmitting(true);

    // Ensure expense type is resolved before submitting.
    // Master mapping is the source of truth for expense_type.
    if (!normalizedCurrentExpenseType) {
      setSubmitting(false);
      setErrors({
        submit: 'Expense type mapping missing for selected category. Add the category via the + (C) button.'
      });
      return;
    }


    // Add to master table if this is a new category
    if (isNewCategory && currentExpenseType) {
      const masterResult = await addMasterEntry({
        category: formData.category,
        expense_type: normalizedCurrentExpenseType
      });


      if (!masterResult.success) {
        setSubmitting(false);
        setErrors({ submit: masterResult.error || 'Failed to add category to master table' });
        return;
      }

      // Ensure master is refreshed so the new category/expense_type is immediately available
      await refetch();
    }

    const result = await onSubmit({
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      expense_type: normalizedCurrentExpenseType,
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

  return <>
    <form onSubmit={handleSubmit} className="space-y-1">


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

      <div className="flex items-end gap-3">

        <div className="flex-1">
          <SearchableSelect
            label="Category"
            value={formData.category}
            onChange={value => setFormData(prev => ({
              ...prev,
              category: value
            }))}
            options={categoryOptions}
            allowAddNew={false}
          />          </div>

          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary border border-primary text-primary hover:bg-tertiary transition-colors"
            title="Add category"
            aria-label="Add category"
            onClick={() => {
              setIsCategoryModalOpen(true);
            }}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
       </div>
          <div className="mt-2 space-y-1">
            <div className="text-sm font-medium text-primary">Expense Type</div>
            <div className="px-3 py-2 rounded-lg bg-tertiary/20 border border-primary/20 text-primary">
              {normalizedCurrentExpenseType ? normalizedCurrentExpenseType : '—'}
            </div>
 
 

      </div>

      {isNewCategory && (
        <p className="text-sm text-blue-600 mt-1">
          Add category via the button above.
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
    </form>

    <Modal
      isOpen={isCategoryModalOpen}
      onClose={() => setIsCategoryModalOpen(false)}
      title="Add Master Category"
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const category = newMasterCategory.trim();
          // Keep expense type casing exactly as selected/typed by the user
          const expenseType = newExpenseType.trim();





          if (!category) return;
          if (!expenseType) return;

          const masterResult = await addMasterEntry({
            category,
            expense_type: expenseType
          });

          if (!masterResult.success) {
            // backend error (category/expense_type insert failed)
            return;
          }


          await refetch();


          setFormData(prev => ({
            ...prev,
            category
          }));

          setNewMasterCategory('');
          setNewExpenseType('');
          setIsCategoryModalOpen(false);
        }}
        className="space-y-3"
      >
        <Input
          label="Category"
          value={newMasterCategory}
          onChange={(e) => setNewMasterCategory(e.target.value)}
          placeholder="e.g., Groceries"
          autoFocus
        />

        <div>
          <SearchableSelect
            label="Expense Type"
            value={newExpenseType}
            onChange={setNewExpenseType}
            placeholder="Select or type..."
            options={masterExpenseTypes.map((t) => ({ value: t, label: t }))}
            allowAddNew
            onAddNew={(val) => {
              setNewExpenseType(val);
            }}
          />

          <p className="text-xs text-tertiary mt-2">Existing types come from master. You can also type a new one.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" className="flex-1" disabled={masterLoading}>
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsCategoryModalOpen(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  </>
}

