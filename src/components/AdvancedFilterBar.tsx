import React, { useState } from 'react';
import { FilterIcon, XIcon } from 'lucide-react';
import { Input } from './Input';
import { SearchableSelect } from './SearchableSelect';
import { Button } from './Button';
import { DescriptionFilter } from './DescriptionFilter';
interface FilterState {
  fromDate: string;
  toDate: string;
  category: string;
  description: string[];
  expense_type: string;
}
interface AdvancedFilterBarProps {
  categories: string[];
  descriptions: string[];
  expenseTypes: string[];
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
}
export function AdvancedFilterBar({
  categories,
  descriptions,
  expenseTypes,
  onApplyFilters,
  onResetFilters
}: AdvancedFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    fromDate: '',
    toDate: '',
    category: 'all',
    description: [],
    expense_type: 'all'
  });
  const categoryOptions = [{
    value: 'all',
    label: 'All Categories'
  }, ...categories.map(cat => ({
    value: cat,
    label: cat
  }))];
  const expenseTypeOptions = [{
    value: 'all',
    label: 'All Types'
  }, ...expenseTypes.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }))];
  const handleApply = () => {
    onApplyFilters(filters);
    setIsExpanded(false);
  };
  const handleReset = () => {
    const resetFilters = {
      fromDate: '',
      toDate: '',
      category: 'all',
      description: [],
      expense_type: 'all'
    };
    setFilters(resetFilters);
    onResetFilters();
    setIsExpanded(false);
  };
  const hasActiveFilters = filters.fromDate || filters.toDate || filters.category !== 'all' || filters.description.length > 0 || filters.expense_type !== 'all';
  return <div className="bg-card rounded-lg border border-primary">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-card-hover transition-colors">
        <div className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-primary">
            Advanced Filters
          </span>
          {hasActiveFilters && <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              Active
            </span>}
        </div>
        <XIcon className={`w-4 h-4 text-tertiary transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
      </button>

      {isExpanded && <div className="px-4 pb-4 border-t border-primary pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="From Date" type="date" value={filters.fromDate} onChange={e => setFilters(prev => ({
          ...prev,
          fromDate: e.target.value
        }))} />
            <Input label="To Date" type="date" value={filters.toDate} onChange={e => setFilters(prev => ({
          ...prev,
          toDate: e.target.value
        }))} />
            <SearchableSelect label="Category" options={categoryOptions} value={filters.category} onChange={value => setFilters(prev => ({
          ...prev,
          category: value
        }))} placeholder="Select category" />
            <SearchableSelect label="Expense Type" options={expenseTypeOptions} value={filters.expense_type} onChange={value => setFilters(prev => ({
          ...prev,
          expense_type: value
        }))} placeholder="Select expense type" />
          </div>
          <div className="mb-4">
            <DescriptionFilter
              descriptions={descriptions}
              selectedDescriptions={filters.description}
              onSelectionChange={descriptions => setFilters(prev => ({
                ...prev,
                description: descriptions
              }))}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="primary" onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="secondary" onClick={handleReset} className="flex-1">
              Reset
            </Button>
          </div>
        </div>}
    </div>;
}