import { useState, useEffect } from 'react';
import { Master, MasterInsert } from '../types/database';

export function useMaster() {
  const [masterData, setMasterData] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/master');
      if (!response.ok) {
        throw new Error('Failed to fetch master data');
      }
      const data = await response.json();

      // If no data, initialize the master table
      if (!data || data.length === 0) {
        // We'll need to move initMasterTable logic to backend or handle it here via backend API
        // For now, let's assume the backend handles it or we call an init endpoint
        const initResponse = await fetch('/api/master/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([
            { category: 'Food', expense_type: 'expense' },
            { category: 'Transport', expense_type: 'expense' },
            { category: 'Salary', expense_type: 'income' },
            // ... add more as needed from initMasterTable.ts
          ])
        });

        if (initResponse.ok) {
          const newDataResponse = await fetch('/api/master');
          const newData = await newDataResponse.json();
          setMasterData(newData || []);
        } else {
          throw new Error('Failed to initialize master table');
        }
      } else {
        setMasterData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch master data');
    } finally {
      setLoading(false);
    }
  };

  const getExpenseTypeByCategory = (category: string): 'income' | 'expense' | null => {
    const masterEntry = masterData.find(entry => entry.category.toLowerCase() === category.toLowerCase());
    return masterEntry ? (masterEntry.expense_type as 'income' | 'expense') : null;
  };

  const isCategoryInMaster = (category: string): boolean => {
    return masterData.some(entry => entry.category.toLowerCase() === category.toLowerCase());
  };

  const addMasterEntry = async (entry: MasterInsert) => {
    try {
      const response = await fetch('/api/master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
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
