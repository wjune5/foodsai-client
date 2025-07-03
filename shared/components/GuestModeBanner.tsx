'use client';

import React, { useState } from 'react';
import { useAuth } from '@/shared/services/AuthContext';
import { useTranslations } from 'next-intl';
import { X, AlertTriangle, UserPlus, Download, Upload, UserCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog';
import toast from 'react-hot-toast';

interface GuestModeBannerProps {
  className?: string;
  dismissible?: boolean;
  showExportOptions?: boolean;
}

export const GuestModeBanner: React.FC<GuestModeBannerProps> = ({ 
  className = '', 
  dismissible = true,
  showExportOptions = true 
}) => {
  const { isGuestMode, guestModeState, migrateToAuthenticatedUser } = useAuth();
  const t = useTranslations();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  if (!isGuestMode || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage to remember user preference
    localStorage.setItem('guest_mode_banner_dismissed', 'true');
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    toast.success('Data export started!');
    setShowExportModal(false);
  };

  const handleImportData = () => {
    // TODO: Implement data import functionality
    toast.success('Data import started!');
    setShowExportModal(false);
  };

  return (
    <>
      {/* Guest Mode Banner */}
      <div className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 shadow-lg ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Guest Mode Active
              </h3>
              <p className="text-sm opacity-90">
                Your data is stored locally on this device. 
                {showExportOptions && (
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="underline ml-1 hover:opacity-75"
                  >
                    Export your data
                  </button>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
            >
              Export Data
            </button>
            <button
              onClick={() => {
                // TODO: Open signup modal
                toast.success('Opening signup form...');
              }}
              className="px-3 py-1 bg-white text-orange-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors flex items-center"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Create Account
            </button>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Export/Import Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserCircle className="w-5 h-5" />
              <span>Guest Data Management</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Guest Mode Data
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your data is currently stored locally. Export it to save a backup, or create an account to sync across devices.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data (Backup)
              </button>

              <button
                onClick={handleImportData}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </button>

              <button
                onClick={() => {
                  // TODO: Open signup modal
                  setShowExportModal(false);
                  toast.success('Opening signup form...');
                }}
                className="w-full flex items-center justify-center px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account & Migrate Data
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>Guest data includes: inventory items, recipes, and settings</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 