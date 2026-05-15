import React, { useState } from 'react';
import { PlusIcon, IndianRupeeIcon, PencilIcon, LockIcon, Trash2Icon, Bell, BellOff } from 'lucide-react';
import { useSalary } from '../hooks/useSalary';
import { useExpenses } from '../hooks/useExpenses';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { SalaryDetailInsert, SalaryDetail } from '../types/database';

interface SalaryProps {
  mode?: 'view' | 'edit' | null;
}

const MONTHS = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' }
];

export function Salary({ mode }: SalaryProps) {
  const { loading, error, addSalaryDetail, updateSalaryDetail, deleteSalaryDetail, getSalaryDetailsByMonthYear, calculateYearlySummary, salaryDetails } = useSalary();
  const { expenses } = useExpenses();
  const { theme } = useTheme();
  const { isMonthlyEnabled, toggleMonthlyNotifications } = useNotifications(expenses, salaryDetails);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearInput, setYearInput] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editYear, setEditYear] = useState('');
  const [selectedEditDate, setSelectedEditDate] = useState('');
  const [matchingEntries, setMatchingEntries] = useState<SalaryDetail[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    gross_salary: '',
    epf: '',
    mf: '',
    vpf: '',
    etf: ''
  });
  const [editFormData, setEditFormData] = useState({
    id: 0 as string | number,
    date: '',
    gross_salary: '',
    epf: '',
    mf: '',
    vpf: '',
    etf: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});



  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.date) errors.date = 'Date is required';
    if (!formData.gross_salary || parseFloat(formData.gross_salary) <= 0) {
      errors.gross_salary = 'Gross salary must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const salaryData: SalaryDetailInsert = {
      date: formData.date,
      gross_salary: parseFloat(formData.gross_salary),
      epf: parseFloat(formData.epf) || 0,
      mf: parseFloat(formData.mf) || 0,
      vpf: parseFloat(formData.vpf) || 0,
      etf: parseFloat(formData.etf) || 0
    };

    const result = await addSalaryDetail(salaryData);
    if (result.success) {
      setIsModalOpen(false);
      setFormData({
        date: '',
        gross_salary: '',
        epf: '',
        mf: '',
        vpf: '',
        etf: ''
      });
    }
  };

  const handleEditMonthYearSelect = (month: string, year: string) => {
    setFormErrors({});
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const matches = salaryDetails.filter(detail => {
      const d = new Date(detail.date);
      return d.getMonth() === monthNum && d.getFullYear() === yearNum;
    });

    if (matches.length > 0) {
      setMatchingEntries(matches);
      if (matches.length === 1) {
        handleEntrySelect(matches[0]);
      }
    } else {
      setFormErrors({ date: 'No salary details found for the selected month and year' });
    }
  };

  const handleEntrySelect = (entry: SalaryDetail) => {
    setSelectedEditDate(entry.date);
    setEditFormData({
      id: entry.id,
      date: entry.date,
      gross_salary: entry.gross_salary.toString(),
      epf: entry.epf.toString(),
      mf: entry.mf.toString(),
      vpf: entry.vpf.toString(),
      etf: entry.etf.toString()
    });
  };

  const handleDeleteEntry = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this salary entry?')) return;
    
    setIsDeleting(true);
    const result = await deleteSalaryDetail(id);
    setIsDeleting(false);
    
    if (result.success) {
      setMatchingEntries(prev => prev.filter(e => e.id !== id));
      if (matchingEntries.length <= 1) {
        setIsEditModalOpen(false);
        setEditMonth('');
        setEditYear('');
        setMatchingEntries([]);
      }
    } else {
      setFormErrors({ date: result.error || 'Failed to delete entry' });
    }
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.date || !editFormData.gross_salary) {
      setFormErrors({
        date: !editFormData.date ? 'Date is required' : '',
        gross_salary: !editFormData.gross_salary ? 'Gross salary is required' : ''
      });
      return;
    }

    const salaryData = {
      date: editFormData.date,
      gross_salary: parseFloat(editFormData.gross_salary),
      epf: parseFloat(editFormData.epf) || 0,
      mf: parseFloat(editFormData.mf) || 0,
      vpf: parseFloat(editFormData.vpf) || 0,
      etf: parseFloat(editFormData.etf) || 0
    };

    const result = await updateSalaryDetail(editFormData.id, salaryData);
    if (result.success) {
      setIsEditModalOpen(false);
      setSelectedEditDate('');
      setEditMonth('');
      setEditYear('');
      setEditFormData({
        id: 0,
        date: '',
        gross_salary: '',
        epf: '',
        mf: '',
        vpf: '',
        etf: ''
      });
    }
  };

  const handleResetFilter = () => {
    setSelectedYear(null);
    setYearInput('');
  };

  const hasActiveFilter = selectedYear !== null;

  const filteredSalaryDetails = hasActiveFilter
    ? getSalaryDetailsByMonthYear(null, selectedYear)
    : [];

  const yearlySummary = hasActiveFilter && selectedYear !== null 
    ? calculateYearlySummary(filteredSalaryDetails, expenses.filter(e => new Date(e.date).getFullYear() === selectedYear), selectedYear)
    : null;

  const overallSummary = yearlySummary
    ? {
        month: -1,
        grossSalary: yearlySummary.reduce((sum, m) => sum + m.grossSalary, 0),
        directSaving: yearlySummary.reduce((sum, m) => sum + m.directSaving, 0),
        expenses: yearlySummary.reduce((sum, m) => sum + m.expenses, 0),
        balanceAmount: yearlySummary.reduce((sum, m) => sum + m.balanceAmount, 0),
        savingPercentage: yearlySummary.reduce((sum, m) => sum + m.grossSalary, 0) > 0 
          ? (yearlySummary.reduce((sum, m) => sum + m.grossSalary, 0) - yearlySummary.reduce((sum, m) => sum + m.expenses, 0)) / yearlySummary.reduce((sum, m) => sum + m.grossSalary, 0) * 100 
          : 0
      }
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (mode === 'view') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6">
          <LockIcon className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Access Restricted</h2>
        <p className="text-secondary max-w-sm">
          Salary information is private. Please unlock the application with your master password to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Salary Details</h1>
        <div className="flex gap-2">
          <Button onClick={toggleMonthlyNotifications} variant="secondary" className={`p-2 ${isMonthlyEnabled ? 'text-primary border-primary' : 'text-secondary'}`} title={isMonthlyEnabled ? 'Disable Monthly Notifications' : 'Enable Monthly Notifications'}>
            {isMonthlyEnabled ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </Button>
          <Button onClick={() => setIsEditModalOpen(true)} variant="secondary" className="flex items-center gap-2">
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-primary rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-32">
            <Input
              label="Year"
              type="text"
              value={yearInput}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setYearInput('');
                  setSelectedYear(null);
                } else if (/^\d+$/.test(value) && value.length <= 4) {
                  setYearInput(value);
                  if (value.length === 4) {
                    const year = parseInt(value);
                    if (year >= 2016 && year <= 2050) {
                      setSelectedYear(year);
                    } else {
                      setSelectedYear(null);
                    }
                  }
                }
              }}
              placeholder="2025"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleResetFilter} variant="secondary">
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Yearly Summary Table */}
      {yearlySummary && (
        <div className="bg-card border border-primary rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-primary">
            <h2 className="text-lg font-semibold text-primary">
              Monthly Summary for {selectedYear}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Gross Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Direct Saving</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Expenses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Balance Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Saving %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary">
                {overallSummary && (
                  <tr className={theme === 'dark' ? 'bg-yellow-300/10' : 'bg-green-700/10'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-yellow-300' : 'text-green-700'}`}>
                      Overall
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-yellow-300' : 'text-green-700'}`}>
                      <div className="flex items-center">
                        <IndianRupeeIcon className="w-4 h-4 mr-1" />
                        {overallSummary.grossSalary.toLocaleString()}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-yellow-300' : 'text-green-700'}`}>
                      <div className="flex items-center">
                        <IndianRupeeIcon className="w-4 h-4 mr-1" />
                        {overallSummary.directSaving.toLocaleString()}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-yellow-300' : 'text-green-700'}`}>
                      <div className="flex items-center">
                        <IndianRupeeIcon className="w-4 h-4 mr-1" />
                        {overallSummary.expenses.toLocaleString()}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-yellow-300' : 'text-green-700'}`}>
                      <div className="flex items-center">
                        <IndianRupeeIcon className="w-4 h-4 mr-1" />
                        {overallSummary.balanceAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-yellow-300' : 'text-green-700'}`}>
                      {overallSummary.savingPercentage.toFixed(2)}%
                    </td>
                  </tr>
                )}
                {yearlySummary
                  .filter(monthlySummary => monthlySummary.grossSalary > 0)
                  .map((monthlySummary) => (
                  <tr key={monthlySummary.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                      {MONTHS.find(m => m.value === monthlySummary.month.toString())?.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      <div className="flex items-center">
                        <IndianRupeeIcon className="w-4 h-4 mr-1" />
                        {monthlySummary.grossSalary.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      <div className="flex items-center">
                        <IndianRupeeIcon className="w-4 h-4 mr-1" />
                        {monthlySummary.directSaving.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      <div className="flex items-center">
                        <IndianRupeeIcon className="w-4 h-4 mr-1" />
                        {monthlySummary.expenses.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      <div className="flex items-center">
                        <IndianRupeeIcon className="w-4 h-4 mr-1" />
                        {monthlySummary.balanceAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      {monthlySummary.savingPercentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* Add Salary Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Salary Details"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={formErrors.date}
            required
          />
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <Input
              label="Gross Salary"
              type="number"
              step="0.01"
              value={formData.gross_salary}
              onChange={(e) => handleInputChange('gross_salary', e.target.value)}
              error={formErrors.gross_salary}
              required
            />
            <Input
              label="EPF"
              type="number"
              step="0.01"
              value={formData.epf}
              onChange={(e) => handleInputChange('epf', e.target.value)}
            />
            <Input
              label="MF"
              type="number"
              step="0.01"
              value={formData.mf}
              onChange={(e) => handleInputChange('mf', e.target.value)}
            />
            <Input
              label="VPF"
              type="number"
              step="0.01"
              value={formData.vpf}
              onChange={(e) => handleInputChange('vpf', e.target.value)}
            />
            <Input
              label="ETF"
              type="number"
              step="0.01"
              value={formData.etf}
              onChange={(e) => handleInputChange('etf', e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Add Salary
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Salary Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditDate('');
          setEditMonth('');
          setEditYear('');
          setFormErrors({});
          setMatchingEntries([]);
          setEditFormData({
            id: 0 as string | number,
            date: '',
            gross_salary: '',
            epf: '',
            mf: '',
            vpf: '',
            etf: ''
          });
        }}
        title="Edit Salary Details"
      >
        {!selectedEditDate ? (
          matchingEntries.length > 1 ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-secondary">Multiple entries found. Please select one to edit or delete:</p>
              <div className="divide-y divide-primary border border-primary rounded-lg overflow-hidden">
                {matchingEntries.map(entry => (
                  <div key={entry.id} className="p-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                    <button 
                      onClick={() => handleEntrySelect(entry)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-primary">{entry.date}</div>
                      <div className="text-[10px] text-secondary font-mono truncate max-w-[200px]">ID: {entry.id}</div>
                      <div className="text-sm text-secondary font-semibold">Gross: ₹{entry.gross_salary.toLocaleString()}</div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntry(entry.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-2 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setMatchingEntries([]);
                  setEditMonth('');
                  setEditYear('');
                }}
                className="w-full"
              >
                Back to Selection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Month"
                  options={[{ value: '', label: 'Select Month' }, ...MONTHS]}
                  value={editMonth}
                  onChange={(e) => setEditMonth(e.target.value)}
                  required
                />
                <Input
                  label="Year"
                  type="text"
                  placeholder="2025"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  required
                />
              </div>
              {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={() => {
                    if (!editMonth || !editYear) {
                      setFormErrors({ date: 'Please select both month and year' });
                    } else {
                      handleEditMonthYearSelect(editMonth, editYear);
                    }
                  }} 
                  className="flex-1"
                >
                  Apply
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )
        ) : (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Date"
              type="date"
              value={editFormData.date}
              onChange={(e) => handleEditInputChange('date', e.target.value)}
              error={formErrors.date}
              required
            />
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <Input
                label="Gross Salary"
                type="number"
                step="0.01"
                value={editFormData.gross_salary}
                onChange={(e) => handleEditInputChange('gross_salary', e.target.value)}
                error={formErrors.gross_salary}
                required
              />
              <Input
                label="EPF"
                type="number"
                step="0.01"
                value={editFormData.epf}
                onChange={(e) => handleEditInputChange('epf', e.target.value)}
              />
              <Input
                label="MF"
                type="number"
                step="0.01"
                value={editFormData.mf}
                onChange={(e) => handleEditInputChange('mf', e.target.value)}
              />
              <Input
                label="VPF"
                type="number"
                step="0.01"
                value={editFormData.vpf}
                onChange={(e) => handleEditInputChange('vpf', e.target.value)}
              />
              <Input
                label="ETF"
                type="number"
                step="0.01"
                value={editFormData.etf}
                onChange={(e) => handleEditInputChange('etf', e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1 min-w-[140px]">
                Update Salary
              </Button>
              <Button 
                type="button" 
                variant="danger" 
                onClick={() => handleDeleteEntry(editFormData.id)}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                <Trash2Icon className="w-4 h-4" />
                Delete
              </Button>
              <Button type="button" variant="secondary" onClick={() => {
                setSelectedEditDate('');
                if (matchingEntries.length <= 1) {
                  setEditMonth('');
                  setEditYear('');
                  setMatchingEntries([]);
                }
                setFormErrors({});
                setEditFormData({
                  id: 0 as string | number,
                  date: '',
                  gross_salary: '',
                  epf: '',
                  mf: '',
                  vpf: '',
                  etf: ''
                });
              }} className="flex-1 min-w-[140px]">
                Back
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}