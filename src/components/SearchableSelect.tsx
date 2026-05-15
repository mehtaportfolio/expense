import React, { useEffect, useState, useRef } from 'react';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
interface SearchableSelectProps {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowAddNew?: boolean;
  onAddNew?: (value: string) => void;
}
export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  allowAddNew = false,
  onAddNew
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const filteredOptions = options.filter(option => option.label.toLowerCase().includes(search.toLowerCase()));
  const selectedOption = options.find(opt => opt.value === value);
  const showAddNew = allowAddNew && search.trim() && !filteredOptions.some(opt => opt.label.toLowerCase() === search.toLowerCase());
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-secondary mb-1">
        {label}
      </label>
      <div className="relative">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-3 py-2 bg-secondary border border-primary rounded-lg text-left flex items-center justify-between text-primary hover:bg-tertiary transition-colors">
          <span className={selectedOption ? 'text-primary' : 'text-tertiary'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDownIcon className={`w-4 h-4 text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && <div className="absolute z-50 w-full mt-1 bg-card border border-primary rounded-lg shadow-lg max-h-64 overflow-hidden">
            <div className="p-2 border-b border-primary">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 bg-secondary border border-primary rounded text-sm text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 && !showAddNew ? <div className="px-3 py-2 text-sm text-tertiary">
                  No results found
                </div> : <>
                  {filteredOptions.map(option => <button key={option.value} type="button" onClick={() => {
            onChange(option.value);
            setIsOpen(false);
            setSearch('');
          }} className={`w-full px-3 py-2 text-left text-sm hover:bg-tertiary transition-colors ${option.value === value ? 'bg-blue-500/10 text-blue-600' : 'text-primary'}`}>
                    {option.label}
                  </button>)}
                  {showAddNew && <button type="button" onClick={() => {
            if (onAddNew) {
              onAddNew(search.trim());
            }
            onChange(search.trim());
            setIsOpen(false);
            setSearch('');
          }} className="w-full px-3 py-2 text-left text-sm hover:bg-tertiary transition-colors text-blue-600 border-t border-primary">
                    + Add "{search.trim()}"
                  </button>}
                </>}
            </div>
          </div>}
      </div>
    </div>;
}