import { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

type Mode = 'view' | 'edit' | null;

interface AuthContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  verifyPassword: (password: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [mode, setMode] = useState<Mode>(null);

  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_master')
        .select('master_password')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching master password:', error);
        return false;
      }

      if (data && data.master_password === password) {
        setMode('edit');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Password verification error:', err);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_master')
        .select('master_password')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching master password:', error);
        return false;
      }

      if (!data || data.master_password !== currentPassword) {
        return false;
      }

      const { error: updateError } = await supabase
        .from('user_master')
        .update({ master_password: newPassword })
        .limit(1);

      if (updateError) {
        console.error('Error updating password:', updateError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Password change error:', err);
      return false;
    }
  };

  const logout = () => {
    setMode(null);
  };

  return {
    mode,
    setMode,
    verifyPassword,
    changePassword,
    logout
  };
}
