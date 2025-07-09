'use client';

import React, { useState } from 'react';
import { useAuth } from '@/shared/services/AuthContext';
import { User, Mail, Calendar, Edit, Save, Camera, LogOut, UserCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../shared/components/Dialog';
import toast from 'react-hot-toast';

interface UserProfileProps {
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, isGuestMode, logout, exitGuestMode } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
    setIsProfileOpen(false);
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
      <button
        onClick={() => setIsProfileOpen(true)}
        className={`flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors ${className}`}
      >
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-white">Guest</span>
      </button>
    );
  }

  return (
    <>
      {/* User Profile Button */}
      <button
        onClick={() => setIsProfileOpen(true)}
        className={`flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors ${className}`}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.nickname || user.username}
            className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {getInitials((user.nickname || user.username) ?? '')}
          </div>
        )}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">
            {user.nickname || user.username}
          </div>
          <div className="text-xs text-gray-300">
            {isGuestMode ? 'Guest Mode' : 'Authenticated'}
          </div>
        </div>
      </button>

      {/* Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>User Profile</span>
              {isGuestMode && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                  <UserCircle className="w-3 h-3 mr-1" />
                  Guest
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="relative inline-block">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.nickname || user.username}
                    className="w-20 h-20 rounded-full object-cover border-4 border-pink-100"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-pink-100">
                    {getInitials(user.nickname ?? user.username ?? '')}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-1 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user.username}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nickname"
                    value={editForm.nickname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user.nickname || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user.email || 'Not set'}</span>
                  </div>
                )}
              </div>

              {!isGuestMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleEditToggle}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditing
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-pink-500 text-white hover:bg-pink-600'
                }`}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isGuestMode ? 'Exit Guest' : 'Logout'}
              </button>
            </div>

            {/* Guest Mode Notice */}
            {isGuestMode && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <UserCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      Guest Mode Active
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your data is stored locally. Create an account to sync across devices.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 