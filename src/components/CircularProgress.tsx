import React from 'react';
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}
export function CircularProgress({
  value,
  max,
  size = 200,
  strokeWidth = 12,
  label,
  sublabel
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = max > 0 ? value / max * 100 : 0;
  const offset = circumference - percentage / 100 * circumference;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  return <div className="flex flex-col items-center">
      <div className="relative" style={{
      width: size,
      height: size
    }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-tertiary opacity-20" />
          {/* Progress circle */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-blue-600 transition-all duration-500" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(value)}
          </p>
          {sublabel && <p className="text-xs text-tertiary mt-1">{sublabel}</p>}
        </div>
      </div>
      <p className="text-sm font-medium text-secondary mt-4">{label}</p>
    </div>;
}