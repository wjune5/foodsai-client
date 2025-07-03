'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/services/AuthContext';
import { GuestModeWarningService } from '@/shared/services/GuestModeWarningService';
import { User, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface GuestModeIndicatorProps {
  className?: string;
  showBanner?: boolean;
  showToast?: boolean;
}

export const GuestModeIndicator: React.FC<GuestModeIndicatorProps> = ({
  className = '',
  showBanner = true,
  showToast = true
}) => {
  const { isGuestMode } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  // Initialize guest mode warning service
  useEffect(() => {
    if (isGuestMode) {
      const warningService = GuestModeWarningService.getInstance();
      warningService.initialize();
      warningService.showInitialWarning();
    }
  }, [isGuestMode]);

  if (!isGuestMode) {
    return null;
  }

  return (
    <>
      {/* Floating Guest Mode Indicator */}
      <div className={`fixed top-20 right-4 z-50 ${className}`}>
        <div className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">Guest Mode</span>
        </div>
      </div>

      {/* Banner Warning */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Guest Mode: Your data is stored locally on this device
              </span>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}; 