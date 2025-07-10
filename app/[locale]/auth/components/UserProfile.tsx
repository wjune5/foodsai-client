'use client';

import React from 'react';
import { useAuth } from '@/shared/services/AuthContext';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import Image from 'next/image';

interface UserProfileProps {
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, isGuestMode } = useAuth();
  const router = useRouter();
  const localize = useLocalizedPath();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    router.push(localize('/profile'));
  };

  if (!user) {
    return (
      <button
        onClick={handleProfileClick}
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
    <button
      onClick={handleProfileClick}
      className={`flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors ${className}`}
    >
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={user.nickname || user.username || 'User'}
          width={32}
          height={32}
          unoptimized
          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
        />
      ) : (
        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {getInitials((user.nickname || user.username) ?? '')}
        </div>
      )}
      {/* <div className="hidden md:block text-left">
        <div className="text-sm font-medium text-pink-500">
          {isGuestMode ? 'Guest Mode' : ''}
        </div>
      </div> */}
    </button>
  );
}; 