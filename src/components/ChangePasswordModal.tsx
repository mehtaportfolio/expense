import React, { useState, useEffect } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { PinInput } from './PinInput';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onChangePassword
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (currentPassword.length !== 4) {
      setError('Please enter your current 4-digit password');
      return;
    }

    if (newPassword.length !== 4) {
      setError('Please enter a new 4-digit password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setSubmitting(true);
    try {
      const isSuccess = await onChangePassword(currentPassword, newPassword);
      if (isSuccess) {
        setSuccess('Password changed successfully!');
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError('Failed to change password. Please check your current password.');
        setCurrentPassword('');
      }
    } catch (err) {
      setError('An error occurred while changing password. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Master Password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-secondary mb-2 text-center">
            Current Password
          </label>
          <PinInput
            value={currentPassword}
            onChange={(val) => {
              setCurrentPassword(val);
              setError('');
            }}
            disabled={submitting}
            autoFocus={isOpen}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2 text-center">
            New Password
          </label>
          <PinInput
            value={newPassword}
            onChange={(val) => {
              setNewPassword(val);
              setError('');
            }}
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2 text-center">
            Confirm New Password
          </label>
          <PinInput
            value={confirmPassword}
            onChange={(val) => {
              setConfirmPassword(val);
              setError('');
            }}
            disabled={submitting}
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={submitting || currentPassword.length !== 4 || newPassword.length !== 4 || confirmPassword.length !== 4}
          >
            {submitting ? 'Changing Password...' : 'Change Password'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
