import { supabase } from './supabase';
import { CATEGORIES } from '../types/expense';

// Initialize master table with default categories
export async function initMasterTable() {
  try {
    // Check if master table has any data
    const { data: existingData, error: checkError } = await supabase
      .from('master')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking master table:', checkError);
      return { success: false, error: checkError.message };
    }

    // If table has data, don't initialize
    if (existingData && existingData.length > 0) {
      console.log('Master table already has data, skipping initialization');
      return { success: true };
    }

    // Initialize with default categories (all as 'expense' type by default)
    const masterEntries = CATEGORIES.map(category => ({
      category,
      expense_type: 'expense' as const
    }));

    const { error: insertError } = await supabase
      .from('master')
      .insert(masterEntries);

    if (insertError) {
      console.error('Error initializing master table:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('Master table initialized successfully');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error initializing master table:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}