import React from 'react';
import { LayoutDashboardIcon, IndianRupeeIcon, BarChart3Icon, WalletIcon } from 'lucide-react';
type Page = 'dashboard' | 'expenses' | 'analysis' | 'salary';
interface BottomNavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  mode?: 'view' | 'edit' | null;
}
export function BottomNav({
  currentPage,
  onPageChange,
  mode
}: BottomNavProps) {
  const navItems = [{
    id: 'dashboard' as Page,
    label: 'Dashboard',
    icon: LayoutDashboardIcon
  }, {
    id: 'expenses' as Page,
    label: 'Expenses',
    icon: IndianRupeeIcon
  }, {
    id: 'analysis' as Page,
    label: 'Analysis',
    icon: BarChart3Icon
  }, {
    id: 'salary' as Page,
    label: 'Salary',
    icon: WalletIcon,
    hidden: mode === 'view'
  }].filter(item => !item.hidden);
  return <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-around">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return <button key={item.id} onClick={() => onPageChange(item.id)} className={`flex flex-col items-center gap-1 py-3 px-4 transition-colors ${isActive ? 'text-blue-600' : 'text-tertiary hover:text-primary'}`}>
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>;
        })}
        </div>
      </div>
    </nav>;
}