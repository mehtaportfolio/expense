import React, { useState, useEffect } from 'react';
import { AlertCircleIcon, CheckIcon, BellIcon } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { PinInput } from './PinInput';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<boolean>;
  onTestNotification?: () => void;
  isLoading?: boolean;
}

export function PasswordModal({
  isOpen,
  onClose,
  onSubmit,
  onTestNotification,
  isLoading = false
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent, passwordOverride?: string) => {
    if (e) e.preventDefault();
    const currentPassword = passwordOverride || password;

    if (currentPassword.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setSubmitting(true);
    try {
      const isValid = await onSubmit(currentPassword);
      if (isValid) {
        setTimeout(() => {
          handleClose();
        }, 500);
      } else {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enter Master Password"
      headerContent={
        onTestNotification && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTestNotification();
            }}
            className="p-1 hover:bg-secondary rounded-full transition-colors"
            title="Test Push Notification"
          >
            <BellIcon className="w-4 h-4 text-blue-500" />
          </button>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-center text-secondary text-sm">
          Enter your 4-digit password
        </p>

        <PinInput
          value={password}
          onChange={(val) => {
            setPassword(val);
            setError('');
          }}
          disabled={submitting || isLoading}
          onComplete={(val) => {
            handleSubmit(undefined, val);
          }}
          autoFocus={isOpen}
        />

        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2"
            disabled={submitting || isLoading || password.length !== 4}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                Unlock
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
            disabled={submitting || isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
