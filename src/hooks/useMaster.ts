import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { initMasterTable } from '../lib/initMasterTable';
import { Master, MasterInsert } from '../types/database';

export function useMaster() {
  const [masterData, setMasterData] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('master')
        .select('*')
        .order('category');

      if (fetchError) throw fetchError;

      // If no data, initialize the master table
      if (!data || data.length === 0) {
        const initResult = await initMasterTable();
        if (initResult.success) {
          // Fetch again after initialization
          const { data: newData, error: refetchError } = await supabase
            .from('master')
            .select('*')
            .order('category');
          if (refetchError) throw refetchError;
          setMasterData(newData || []);
        } else {
          throw new Error(initResult.error || 'Failed to initialize master table');
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
    return masterEntry ? masterEntry.expense_type : null;
  };

  const isCategoryInMaster = (category: string): boolean => {
    return masterData.some(entry => entry.category.toLowerCase() === category.toLowerCase());
  };

  const addMasterEntry = async (entry: MasterInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('master')
        .insert(entry)
        .select()
        .single();

      if (insertError) throw insertError;
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