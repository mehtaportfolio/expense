import React, { useEffect, useState, useRef } from 'react';
import { ChevronDownIcon } from 'lucide-react';

interface MultiSelectCheckboxProps {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectCheckbox({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select items...'
}: MultiSelectCheckboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.value));
    }
  };

  const selectedLabels = options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label)
    .join(', ');

  const displayText = selectedLabels || placeholder;

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-secondary mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-secondary border border-primary rounded-lg text-left flex items-center justify-between text-primary hover:bg-tertiary transition-colors"
        >
          <span className={selectedValues.length > 0 ? 'text-primary' : 'text-tertiary'}>
            {displayText}
          </span>
          <ChevronDownIcon
            className={`w-4 h-4 text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-primary rounded-lg shadow-lg max-h-64 overflow-hidden">
            <div className="border-b border-primary">
              <button
                type="button"
                onClick={handleSelectAll}
                className="w-full px-3 py-2 text-left text-sm hover:bg-tertiary transition-colors text-primary font-medium flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.length === options.length && options.length > 0}
                  readOnly
                  className="w-4 h-4 rounded border-primary bg-secondary cursor-pointer"
                />
                {selectedValues.length === options.length && options.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-tertiary transition-colors text-primary flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    readOnly
                    className="w-4 h-4 rounded border-primary bg-secondary cursor-pointer"
                  />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
