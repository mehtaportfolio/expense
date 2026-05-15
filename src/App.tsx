import React, { useState } from 'react';
import { RefreshCwIcon, AlertCircleIcon, LockIcon, LockOpenIcon, KeyIcon } from 'lucide-react';
import { useExpenses } from './hooks/useExpenses';
import { useTheme } from './hooks/useTheme';
import { useAuthProvider, AuthContext } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import { BottomNav } from './components/BottomNav';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/Button';
import { PasswordModal } from './components/PasswordModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Analysis } from './pages/Analysis';
import { Salary } from './pages/Salary';
import { getApiUrl } from './lib/api';

type Page = 'dashboard' | 'expenses' | 'analysis' | 'salary';

function AppContent() {
  const {
    expenses,
    loading,
    error,
    addExpense,
    addExpenses,
    updateExpense,
    deleteExpense,
    refetch,
    getUniqueCategories
  } = useExpenses();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const { showTestNotification } = useNotifications(expenses);
  const authContext = React.useContext(AuthContext);
  if (!authContext) {
    throw new Error('AppContent must be used within AuthProvider');
  }
  const {
    mode,
    verifyPassword,
    changePassword,
    logout
  } = authContext;
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingPage, setPendingPage] = useState<Page | null>(null);

  const restartBackend = async () => {
    if (!window.confirm('Are you sure you want to restart the backend?')) return;

    try {
      const password = sessionStorage.getItem('auth_password');
      const response = await fetch(getApiUrl('/api/restart'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(password ? { 'X-Auth-Password': password } : {})
        }
      });

      if (response.ok) {
        alert('Backend restart initiated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to restart backend: ${error.message || response.statusText}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleVerifyPassword = async (password: string) => {
    const isValid = await verifyPassword(password);
    if (isValid && pendingPage) {
      setCurrentPage(pendingPage);
      setPendingPage(null);
    }
    return isValid;
  };

  if (loading) {
    return <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary">Loading expenses...</p>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="bg-card border border-primary rounded-lg p-8 max-w-2xl w-full">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircleIcon className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-primary mb-2">
                Connection Error
              </h2>
              <p className="text-sm text-secondary mb-4">{error}</p>

              <div className="bg-secondary rounded-lg p-4 mb-4 text-sm border border-primary">
                <p className="font-medium text-primary mb-2">
                  Common solutions:
                </p>
                <ul className="space-y-2 text-secondary">
                  <li>
                    • Ensure the backend server is running and accessible
                  </li>
                  <li>
                    • Verify the database connection in the backend logs
                  </li>
                  <li>
                    • Check if the backend environment variables are correctly configured
                  </li>
                  <li>• Check browser console for detailed error messages</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={refetch} variant="primary">
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-primary pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Expense Tracker</h1>
            <p className="text-xs text-tertiary mt-1">
              {mode === 'view' ? '👁️ View Mode - Read Only' : '✏️ Edit Mode - Full Access'}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={restartBackend} 
              aria-label="Restart Backend"
              className={`w-8 h-8 p-0 flex items-center justify-center rounded-full font-bold transition-colors border-2 ${
                theme === 'dark' 
                  ? 'border-white text-white hover:bg-white/10' 
                  : 'border-black text-black hover:bg-black/10'
              }`}
            >
              R
            </Button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Button variant="ghost" size="sm" onClick={refetch} aria-label="Refresh expenses">
              <RefreshCwIcon className="w-4 h-4" />
            </Button>
            {mode === 'edit' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsChangePasswordModalOpen(true)} 
                aria-label="Change password"
              >
                <KeyIcon className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (mode === 'view') {
                  setIsPasswordModalOpen(true);
                } else {
                  logout();
                  if (currentPage === 'salary') {
                    setCurrentPage('dashboard');
                  }
                }
              }} 
              aria-label={mode === 'view' ? 'Switch to edit mode' : 'Lock application'}
              className={mode === 'edit' ? 'text-blue-400' : ''}
            >
              {mode === 'view' ? <LockIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-180px)]">
          {currentPage === 'dashboard' && <Dashboard expenses={expenses} mode={mode} onExpenseUpdate={refetch} />}
          {currentPage === 'expenses' && <Expenses expenses={expenses} categories={getUniqueCategories()} mode={mode} onAddExpense={addExpense} onAddExpenses={addExpenses} onUpdateExpense={updateExpense} onDeleteExpense={deleteExpense} />}
          {currentPage === 'analysis' && <Analysis mode={mode} />}
          {currentPage === 'salary' && mode === 'edit' && <Salary mode={mode} />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        mode={mode} 
        onRequirePassword={() => {
          setPendingPage('salary');
          setIsPasswordModalOpen(true);
        }}
      />

      {/* Password Modal for switching to Edit Mode */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPendingPage(null);
        }}
        onSubmit={handleVerifyPassword}
        onTestNotification={showTestNotification}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onChangePassword={changePassword}
      />
    </div>;
}

export function App() {
  const authValue = useAuthProvider();
  
  return (
    <AuthContext.Provider value={authValue}>
      <AppContent />
    </AuthContext.Provider>
  );
}