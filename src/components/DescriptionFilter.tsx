import React, { useState, useMemo } from 'react';
import { Input } from './Input';

interface DescriptionFilterProps {
  descriptions: string[];
  selectedDescriptions: string[];
  onSelectionChange: (descriptions: string[]) => void;
}

export function DescriptionFilter({
  descriptions,
  selectedDescriptions,
  onSelectionChange
}: DescriptionFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDescriptions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return descriptions
      .filter(desc => desc.toLowerCase().includes(term))
      .sort();
  }, [descriptions, searchTerm]);

  const handleCheckboxChange = (description: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedDescriptions, description]);
    } else {
      onSelectionChange(selectedDescriptions.filter(d => d !== description));
    }
  };

  return (
    <div className="space-y-2">
      <Input
        label="Description"
        type="text"
        placeholder="Search descriptions..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      {filteredDescriptions.length > 0 && (
        <div className="max-h-32 overflow-y-auto border border-primary rounded p-2 space-y-1">
          {filteredDescriptions.map(description => (
            <label key={description} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedDescriptions.includes(description)}
                onChange={e => handleCheckboxChange(description, e.target.checked)}
                className="rounded"
              />
              <span className="truncate">{description}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}