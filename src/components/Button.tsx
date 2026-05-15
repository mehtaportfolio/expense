import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-[var(--bg-primary)]',
    secondary: 'bg-tertiary text-primary hover:bg-secondary focus:ring-gray-500 border border-primary focus:ring-offset-[var(--bg-primary)]',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-[var(--bg-primary)]',
    ghost: 'text-secondary hover:bg-tertiary hover:text-primary focus:ring-gray-500 focus:ring-offset-[var(--bg-primary)]'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>;
}