'use client';

import React, { useState } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { User, Mail, Calendar, Edit, Save, Camera, LogOut, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { databaseService } from '@/shared/services/DatabaseService';

export const ProfilePageContent: React.FC = () => {
  const t = useTranslations();
  const { user, isGuestMode, isAuthenticated, logout, exitGuestMode, updateUserFromGuestService } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    id: String(user?.id),
    username: user?.username || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  const handleEditToggle = async () => {
    if (isEditing) {
      await databaseService.updateUserProfile(editForm);
      updateUserFromGuestService();
      toast.success('Profile updated successfully!');
    }
    setIsEditing(!isEditing);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    if (isGuestMode) {
      exitGuestMode();
      toast.success('Exited guest mode');
    } else {
      logout();
      toast.success('Logged out successfully');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No User Found</h2>
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('user.username')}
          </label>
          {isEditing ? (
            <div className="relative flex items-center">
              <User className="w-5 h-5 text-gray-400 absolute left-3 pointer-events-none" />
              <Input
                type="text"
                name="username"
                disabled={true}
                value={editForm.username}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
          ) : (
            <div className="flex items-center px-3 py-1 bg-gray-50 h-9 w-full min-w-0 rounded-md">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-900 font-medium">{user.username}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('user.displayName')}
          </label>
          {isEditing ? (
            <div className="relative flex items-center">
              <User className="w-5 h-5 text-gray-400 absolute left-3 pointer-events-none" />
              <Input
                type="text"
                name="nickname"
                value={editForm.nickname}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
          ) : (
            <div className="flex items-center px-3 py-1 bg-gray-50 h-9 w-full min-w-0 rounded-md">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-900 font-medium">{user.nickname || ''}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('user.email')}
          </label>
          {isEditing ? (
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 pointer-events-none" />
              <Input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
          ) : (
            <div className="flex items-center px-3 py-1 bg-gray-50 h-9 w-full min-w-0 rounded-md">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-900 font-medium">{user.email || ''}</span>
            </div>
          )}
        </div>

        {!isGuestMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('user.memberSince')}
            </label>
            <div className="flex items-center px-3 py-1 bg-gray-50 h-9 w-full min-w-0 rounded-md">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-900 font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-6 w-full justify-center">
        <Button
          onClick={handleEditToggle}
          className="w-[50%] flex items-center justify-center"
          variant={isEditing ? 'default' : 'outline'}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              {t('common.save')}
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </>
          )}
        </Button>
        {isAuthenticated && (
        <Button
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
              {t('common.logout')}
            </Button>
        )}
      </div>

      {/* Guest Mode Notice */}
      {isGuestMode && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <UserCircle className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h4 className="text-lg font-medium text-yellow-800 mb-2">
                Guest Mode Active
              </h4>
              <p className="text-yellow-700">
                Your data is stored locally on this device. Create an account to sync your data across devices and access additional features.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 