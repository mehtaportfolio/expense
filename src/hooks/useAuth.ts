import { createContext, useContext, useState } from 'react';

type Mode = 'view' | 'edit';

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
  const [mode, setMode] = useState<Mode>(() => {
    // Check if we already have a verified password in this session
    return sessionStorage.getItem('auth_password') ? 'edit' : 'view';
  });

  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const { isValid } = await response.json();

      if (isValid) {
        setMode('edit');
        sessionStorage.setItem('auth_password', password);
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
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Password': currentPassword
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        return false;
      }

      const { success } = await response.json();
      if (success) {
        sessionStorage.setItem('auth_password', newPassword);
      }
      return success;
    } catch (err) {
      console.error('Password change error:', err);
      return false;
    }
  };

  const logout = () => {
    setMode('view');
    sessionStorage.removeItem('auth_password');
  };

  return {
    mode,
    setMode,
    verifyPassword,
    changePassword,
    logout
  };
}
