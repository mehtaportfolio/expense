import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return <div className="w-full">
      <label className="block text-sm font-medium text-secondary mb-1">
        {label}
      </label>
      <input className={`w-full px-3 py-2 bg-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-primary placeholder-tertiary ${error ? 'border-red-500' : 'border-primary'} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>;
}