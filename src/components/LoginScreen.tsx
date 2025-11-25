import React, { useState } from 'react';
import { LockIcon, EyeIcon, EyeOffIcon, AlertCircleIcon } from 'lucide-react';
import { Button } from './Button';

interface LoginScreenProps {
  onViewMode: () => void;
  onEditMode: (password: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function LoginScreen({
  onViewMode,
  onEditMode,
  isLoading = false
}: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const handleEditMode = async () => {
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setEditLoading(true);
    setError('');

    try {
      const isValid = await onEditMode(password);
      if (!isValid) {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditMode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-2xl p-8 border border-primary">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
              <LockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-primary mb-2">
            Expense Tracker
          </h1>
          <p className="text-center text-secondary mb-8">
            Choose how you want to access the app
          </p>

          <div className="space-y-4 ">
            <Button
              onClick={onViewMode}
              variant="secondary"
              className="w-full py-3 !bg-yellow-300 !text-black !hover:bg-yellow-400"
              disabled={isLoading || editLoading}
            >
              View Mode
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-secondary">or</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter master password"
                  disabled={editLoading}
                  className="w-full px-4 py-2 pr-10 bg-primary border border-primary rounded-lg text-primary placeholder-tertiary focus:outline-none focus:border-blue-600"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={editLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                onClick={handleEditMode}
                variant="primary"
                className="w-full py-3"
                disabled={editLoading || isLoading}
              >
                {editLoading ? 'Verifying...' : 'Edit Mode'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
