'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/services/AuthContext';
import { guestDB } from '@/shared/utils/guest_db';
import { Trash2, Download, Upload, Database, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/Dialog';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import toast from 'react-hot-toast';
import Navigation from '@/shared/components/Navigation';

export default function SettingsPage() {
  const t = useTranslations();
  const { isGuestMode, exitGuestMode } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [dbSize, setDbSize] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Get database size
  const getDatabaseSize = async () => {
    try {
      const size = await guestDB.getDatabaseSize();
      setDbSize(size);
    } catch (error) {
      console.error('Error getting database size:', error);
    }
  };

  // Clear database function
  const clearDatabase = async () => {
    try {
      setIsClearing(true);
      await guestDB.clearAllData();
      toast.success('Database cleared successfully');
      setDbSize(0);
    } catch (error) {
      console.error('Error clearing database:', error);
      toast.error('Failed to clear database');
    } finally {
      setIsClearing(false);
    }
  };

  // Export data function
  const exportData = async () => {
    try {
      setIsExporting(true);
      const data = await guestDB.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `foodsai-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Import data function
  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);
      await guestDB.importData(data);
      toast.success('Data imported successfully');
      getDatabaseSize();
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  // Initialize database size on mount
  React.useEffect(() => {
    if (isGuestMode) {
      getDatabaseSize();
    }
  }, [isGuestMode]);

  return (
    <div className="min-h-[calc(100vh-66px)] bg-pink-50 pb-12">
        <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Settings className="w-8 h-8 text-pink-500" />
            Settings
          </h1>
          <p className="text-gray-600">Manage your app preferences and data</p>
        </div>

        <div className="grid gap-6">
          {/* Language Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Language & Region</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Choose your preferred language</p>
              </div>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Database Management */}
          {isGuestMode && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-500" />
                Database Management
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Database Size</p>
                    <p className="text-gray-600 text-sm">
                      {dbSize !== null ? `${dbSize} records` : 'Click to refresh'}
                    </p>
                  </div>
                  <button
                    onClick={getDatabaseSize}
                    className="flex items-center justify-center px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors whitespace-nowrap"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Export Data</p>
                    <p className="text-gray-600 text-sm">Download your data as JSON backup</p>
                  </div>
                  <button
                    onClick={exportData}
                    disabled={isExporting}
                    className="flex items-center justify-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export'}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Import Data</p>
                    <p className="text-gray-600 text-sm">Restore data from JSON backup</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                      disabled={isImporting}
                    />
                    <span className="flex items-center justify-center px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors cursor-pointer whitespace-nowrap">
                      <Upload className="w-4 h-4 mr-2" />
                      {isImporting ? 'Importing...' : 'Import'}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Clear Database</p>
                    <p className="text-gray-600 text-sm">Permanently delete all your data</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center justify-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Clear Database
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Are you sure you want to clear all data? This action cannot be undone.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 text-sm">
                            ⚠️ This will permanently delete:
                          </p>
                          <ul className="mt-2 text-yellow-700 text-sm space-y-1">
                            <li>• All inventory items</li>
                            <li>• All recipes</li>
                            <li>• All user settings</li>
                            <li>• All user data</li>
                          </ul>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <DialogTrigger asChild>
                            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                          </DialogTrigger>
                          <DialogTrigger asChild>
                            <button
                              onClick={clearDatabase}
                              disabled={isClearing}
                              className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {isClearing ? 'Clearing...' : 'Clear All Data'}
                            </button>
                          </DialogTrigger>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account</h2>
            <div className="space-y-4">
              {isGuestMode ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="font-medium text-yellow-800">Guest Mode</p>
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    You're currently using guest mode. Your data is stored locally.
                  </p>
                  <button
                    onClick={exitGuestMode}
                    className="flex items-center justify-center px-4 py-2 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
                  >
                    Exit Guest Mode
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-medium text-green-800">Account Connected</p>
                  </div>
                  <p className="text-green-700 text-sm">
                    Your data is synchronized across devices.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Smart Fridge</span> - AI-powered food management
              </p>
              <p className="text-gray-600">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
