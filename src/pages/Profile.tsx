import React from 'react';
import { UserIcon } from 'lucide-react';
export function Profile() {
  return <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
        <UserIcon className="w-8 h-8 text-blue-500" />
      </div>
      <h2 className="text-xl font-semibold text-primary mb-2">Profile</h2>
      <p className="text-sm text-secondary text-center max-w-md">
        Manage your profile settings, preferences, and account information.
      </p>
    </div>;
}