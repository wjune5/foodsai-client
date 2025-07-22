'use client';

import React, { useState } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { User, Mail, Calendar, Edit, Save, Camera, LogOut, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export const ProfilePageContent: React.FC = () => {
  const t = useTranslations();
  const { user, isGuestMode, isAuthenticated, logout, exitGuestMode } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      // TODO: Implement save functionality
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
            Username
          </label>
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={editForm.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          ) : (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 font-medium">{user.username}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="nickname"
              value={editForm.nickname}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          ) : (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 font-medium">{user.nickname || 'Not set'}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={editForm.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          ) : (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 font-medium">{user.email || 'Not set'}</span>
            </div>
          )}
        </div>

        {!isGuestMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-6">
        <button
          onClick={handleEditToggle}
          className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
            isEditing
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-pink-500 text-white hover:bg-pink-600'
          }`}
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
        </button>
        {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
              {t('common.logout')}
            </button>
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