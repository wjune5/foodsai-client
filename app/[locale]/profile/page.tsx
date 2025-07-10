'use client';

import { FC } from 'react';
import Navigation from '@/shared/components/Navigation';
import { ProfilePageContent } from '../auth/components/ProfilePageContent';
import Footer from '@/shared/components/Footer';

const ProfilePage: FC = () => {
  return (
    <div className="min-h-[calc(100vh-66px)] bg-pink-50 pb-12">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-cute p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">User Profile</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
          
          {/* Profile Component - Full Width */}
          <div className="w-full">
            <ProfilePageContent />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage; 