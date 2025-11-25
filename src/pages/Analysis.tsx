import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useExpenses } from '../hooks/useExpenses';
import { useSalary } from '../hooks/useSalary';
import { BarChart } from '../components/BarChart';
import { LineChart } from '../components/LineChart';
import { Expense } from '../types/database';
import { IndianRupeeIcon } from 'lucide-react';

interface AnalysisProps {
  mode?: 'view' | 'edit' | null;
}

export function Analysis({ mode }: AnalysisProps) {
  const { expenses, loading } = useExpenses();
  const { calculateYearlySummary, salaryDetails } = useSalary();
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [salaryYearFilter, setSalaryYearFilter] = useState('');
  const [salaryYearInput, setSalaryYearInput] = useState('');

  if (loading) {
    return <div className="flex justify-center py-16">Loading...</div>;
  }

  const handleYearBarClick = (yearLabel: string) => {
    setYearFilter(yearLabel);
    setSelectedMonth(null);
  };

  const handleMonthBarClick = (monthLabel: string) => {
    const monthIndex = Array.from({ length: 12 }, (_, i) => 
      new Date(0, i).toLocaleString('default', { month: 'short' })
    ).indexOf(monthLabel);
    if (monthIndex !== -1) {
      setSelectedMonth(monthLabel);
      setMonthFilter((monthIndex + 1).toString());
    }
  };

  const getSalaryYearlySummary = (year: number) => {
    const yearlySummary = calculateYearlySummary(
      salaryDetails,
      expenses.filter(e => new Date(e.date).getFullYear() === year),
      year
    );
    
    if (!yearlySummary || yearlySummary.length === 0) return null;

    const overallSummary = {
      grossSalary: yearlySummary.reduce((sum, m) => sum + m.grossSalary, 0),
      directSaving: yearlySummary.reduce((sum, m) => sum + m.directSaving, 0),
      expenses: yearlySummary.reduce((sum, m) => sum + m.expenses, 0),
      balanceAmount: yearlySummary.reduce((sum, m) => sum + m.balanceAmount, 0),
      savingPercentage: yearlySummary.reduce((sum, m) => sum + m.grossSalary, 0) > 0 
        ? (yearlySummary.reduce((sum, m) => sum + m.grossSalary, 0) - yearlySummary.reduce((sum, m) => sum + m.expenses, 0)) / yearlySummary.reduce((sum, m) => sum + m.grossSalary, 0) * 100 
        : 0
    };

    return overallSummary;
  };

  const getSavingPercentageByMonth = (year: number) => {
    const yearlySummary = calculateYearlySummary(
      salaryDetails,
      expenses.filter(e => new Date(e.date).getFullYear() === year),
      year
    );
    
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return yearlySummary
      .filter(m => m.grossSalary > 0)
      .map((m) => ({
        label: monthLabels[m.month],
        value: m.savingPercentage
      }));
  };

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">Expense Analysis</h1>

      <Tabs className="mb-8">
        <TabList className="flex space-x-1 p-1 rounded-lg mb-6">
          <Tab className="px-4 py-2 rounded-md text-sm text-black font-medium bg-yellow-100 dark:bg-yellow-100 hover:bg-yellow-800 hover:dark:bg-yellow-800 aria-[selected=true]:bg-blue-600 aria-[selected=true]:dark:bg-blue-600 data-[selected=true]">Expense</Tab>
          {mode !== 'view' && <Tab className="px-4 py-2 rounded-md text-sm text-black font-medium bg-yellow-100 dark:bg-yellow-100 hover:bg-yellow-800 hover:dark:bg-yellow-800 aria-[selected=true]:bg-blue-600 aria-[selected=true]:dark:bg-blue-600 data-[selected=true]">Salary</Tab>}
        </TabList>

        <TabPanel>
          {/* Year Wise Tab */}
          <div className="space-y-6">
            {/* Year Wise Expenses Chart (Filter Free) */}
            <div className="bg-card p-4 rounded-lg shadow border border-primary">
              <BarChart
                data={getYearlyExpensesData(expenses)}
                title="Yearly Expenses (Click to select year)"
                onBarClick={handleYearBarClick}
              />
            </div>

            {yearFilter && (
              <div className="bg-blue-350 dark:bg-blue-650 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-primary">
                  Selected Year: <span className="font-bold">{yearFilter}</span>
                  {selectedMonth && <span> • Month: <span className="font-bold">{selectedMonth}</span></span>}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Month Wise Expenses Chart */}
              <div className="bg-card p-4 rounded-lg shadow border border-primary">
                <BarChart
                  data={getMonthlyExpensesData(expenses, parseInt(yearFilter))}
                  title="Monthly Expenses (Click to select month)"
                  onBarClick={handleMonthBarClick}
                />
              </div>

              {/* Expense Type Chart */}
              <div className="bg-card p-4 rounded-lg shadow border border-primary">
                <BarChart
                  data={getExpenseTypeData(expenses, parseInt(yearFilter), selectedMonth ? parseInt(monthFilter) : undefined)}
                  title={selectedMonth ? `Expense Types - ${selectedMonth} ${yearFilter}` : `Expense Types - ${yearFilter}`}
                />
              </div>
            </div>
          </div>
        </TabPanel>

        {mode !== 'view' && <TabPanel>
          {/* Salary Tab */}
          <div className="space-y-6">
            {/* Year Filter */}
            <div className="bg-card border border-primary rounded-lg p-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-primary block mb-2">Year</label>
                  <input
                    type="number"
                    value={salaryYearInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSalaryYearInput(value);
                      if (value.length === 4) {
                        const year = parseInt(value);
                        if (year >= 2016 && year <= 2050) {
                          setSalaryYearFilter(value);
                        }
                      } else {
                        setSalaryYearFilter('');
                      }
                    }}
                    placeholder="Enter year (e.g., 2025)"
                    className="w-full px-3 py-2 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card text-primary"
                    min="2016"
                    max="2050"
                  />
                </div>
              </div>
            </div>

            {salaryYearFilter && getSalaryYearlySummary(parseInt(salaryYearFilter)) ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  {/* Gross Salary Card */}
                  <div className="bg-card border border-primary rounded-lg p-6 shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary mb-1">Gross Salary</p>
                        <div className="flex items-center gap-2">
                          <IndianRupeeIcon className="w-5 h-5 text-primary" />
                          <p className="text-2xl font-bold text-primary">
                            {getSalaryYearlySummary(parseInt(salaryYearFilter))?.grossSalary.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-4xl opacity-10">💰</div>
                    </div>
                  </div>

                  {/* Direct Saving Card */}
                  <div className="bg-card border border-primary rounded-lg p-6 shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary mb-1">Direct Saving</p>
                        <div className="flex items-center gap-2">
                          <IndianRupeeIcon className="w-5 h-5 text-green-500" />
                          <p className="text-2xl font-bold text-green-500">
                            {getSalaryYearlySummary(parseInt(salaryYearFilter))?.directSaving.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-4xl opacity-10">🏦</div>
                    </div>
                  </div>

                  {/* Expenses Card */}
                  <div className="bg-card border border-primary rounded-lg p-6 shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary mb-1">Expenses</p>
                        <div className="flex items-center gap-2">
                          <IndianRupeeIcon className="w-5 h-5 text-red-500" />
                          <p className="text-2xl font-bold text-red-500">
                            {getSalaryYearlySummary(parseInt(salaryYearFilter))?.expenses.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-4xl opacity-10">💸</div>
                    </div>
                  </div>

                  {/* Balance Card */}
                  <div className="bg-card border border-primary rounded-lg p-6 shadow">
                    <div>
                      <p className="text-sm font-medium text-secondary mb-2">Balance Amount</p>
                      <div className="flex items-center gap-2 mb-3">
                        <IndianRupeeIcon className="w-5 h-5 text-orange-500" />
                        <p className="text-2xl font-bold text-orange-500">
                          {getSalaryYearlySummary(parseInt(salaryYearFilter))?.balanceAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Saving % Card */}
                  <div className="bg-card border border-primary rounded-lg p-6 shadow">
                    <div>
                      <p className="text-sm font-medium text-secondary mb-1">Overall Saving %</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {getSalaryYearlySummary(parseInt(salaryYearFilter))?.savingPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Line Chart - Saving % Month Wise */}
                <div className="bg-card border border-primary rounded-lg p-4 shadow">
                  <LineChart
                    data={getSavingPercentageByMonth(parseInt(salaryYearFilter))}
                    title={`Saving % Month Wise - ${salaryYearFilter}`}
                    height={300}
                    showValues={true}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                <p className="text-yellow-700 dark:text-yellow-300">Enter a year to view salary analysis</p>
              </div>
            )}
          </div>
        </TabPanel>}
      </Tabs>
    </div>
  );
}

// Helper functions for data aggregation
function getMonthlyExpensesData(expenses: Expense[], year: number) {
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    amount: 0
  }));

  expenses
    .filter(exp => new Date(exp.date).getFullYear() === year)
    .forEach(exp => {
      const month = new Date(exp.date).getMonth();
      monthlyData[month].amount += exp.amount;
    });

  return monthlyData.map(item => ({
    label: item.month,
    value: item.amount
  }));
}

function getExpenseTypeData(expenses: Expense[], year: number, month?: number) {
  const filteredExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getFullYear() === year &&
           (month === undefined || expDate.getMonth() + 1 === month);
  });

  const typeMap = new Map<string, number>();
  filteredExpenses.forEach(exp => {
    const current = typeMap.get(exp.expense_type) || 0;
    typeMap.set(exp.expense_type, current + exp.amount);
  });

  return Array.from(typeMap.entries())
    .map(([type, amount]) => ({
      label: type,
      value: amount
    }))
    .sort((a, b) => b.value - a.value);
}

function getYearlyExpensesData(expenses: Expense[]) {
  const yearMap = new Map<number, number>();

  expenses.forEach(exp => {
    const year = new Date(exp.date).getFullYear();
    const current = yearMap.get(year) || 0;
    yearMap.set(year, current + exp.amount);
  });

  return Array.from(yearMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, amount]) => ({
      label: year.toString(),
      value: amount
    }));
}



