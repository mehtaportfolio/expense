import React from 'react';
import { FilterIcon } from 'lucide-react';
import { CATEGORIES } from '../types/expense';
interface FilterBarProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}
export function FilterBar({
  selectedCategory,
  onCategoryChange
}: FilterBarProps) {
  return <div className="bg-card rounded-lg border border-primary p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-secondary">
          <FilterIcon className="w-4 h-4" />
          Filter:
        </div>
        <button onClick={() => onCategoryChange(null)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-tertiary text-secondary hover:bg-secondary hover:text-primary'}`}>
          All
        </button>
        {CATEGORIES.map(category => <button key={category} onClick={() => onCategoryChange(category)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-tertiary text-secondary hover:bg-secondary hover:text-primary'}`}>
            {category}
          </button>)}
      </div>
    </div>;
}