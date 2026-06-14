import { useState, useEffect } from 'react';
import { Master, MasterInsert } from '../types/database';
import { getApiUrl } from '../lib/api';

export function useMaster() {
  const [masterData, setMasterData] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('/api/master'));
      if (!response.ok) {
        throw new Error('Failed to fetch master data');
      }
      const data = await response.json();

      // If no data, initialize the master table
      if (!data || data.length === 0) {
        const initResponse = await fetch(getApiUrl('/api/master/initialize'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([
            { category: 'Food', expense_type: 'expense' },
            { category: 'Transport', expense_type: 'expense' },
            { category: 'Salary', expense_type: 'income' },
          ])
        });

        if (!initResponse.ok) {
          throw new Error('Failed to initialize master table');
        }
      }

      // Always refetch after possible initialization so masterData reflects DB state
      const newDataResponse = await fetch(getApiUrl('/api/master'));
      if (!newDataResponse.ok) {
        throw new Error('Failed to fetch master data');
      }
      const newData = await newDataResponse.json();
      setMasterData(newData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch master data');
    } finally {
      setLoading(false);
    }
  };

  const getExpenseTypeByCategory = (category: string): 'income' | 'expense' | null => {
    const masterEntry = masterData.find(entry => entry.category.toLowerCase() === category.toLowerCase());
    if (!masterEntry?.expense_type) return null;

    const normalized = String(masterEntry.expense_type).trim().toLowerCase();
    return (normalized === 'income' || normalized === 'expense')
      ? (normalized as 'income' | 'expense')
      : null;
  };

  const isCategoryInMaster = (category: string): boolean => {
    return masterData.some(entry => entry.category.toLowerCase() === category.toLowerCase());
  };

  const addMasterEntry = async (entry: MasterInsert) => {
    // Keep expense_type casing exactly as provided by the user (existing values may be mixed)
    const normalizedEntry = {
      ...entry,
      expense_type: typeof entry.expense_type === 'string' ? entry.expense_type.trim() : entry.expense_type
    };
    try {
      const response = await fetch(getApiUrl('/api/master'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedEntry),
      });

      if (!response.ok) {
        throw new Error('Failed to add master entry');
      }

      const data = await response.json();
      if (data) {
        setMasterData(prev => [...prev, data]);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add master entry'
      };
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  return {
    masterData,
    loading,
    error,
    getExpenseTypeByCategory,
    isCategoryInMaster,
    addMasterEntry,
    refetch: fetchMasterData
  };
}
