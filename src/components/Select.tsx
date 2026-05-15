import React from 'react';
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  error?: string;
}
export function Select({
  label,
  options,
  error,
  className = '',
  ...props
}: SelectProps) {
  return <div className="w-full">
      <label className="block text-sm font-medium text-secondary mb-1">
        {label}
      </label>
      <select className={`w-full px-3 py-2 bg-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-primary ${error ? 'border-red-500' : 'border-primary'} ${className}`} {...props}>
        {options.map(option => <option key={option.value} value={option.value} className="bg-card">
            {option.label}
          </option>)}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>;
}