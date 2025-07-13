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
            {t('settings.title')}
          </h1>
          <p className="text-gray-600">{t('settings.description')}</p>
        </div>

        <div className="grid gap-6">
          {/* Language Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('settings.language')}</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">{t('settings.chooseLanguage')}</p>
              </div>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Database Management */}
          {isGuestMode && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-500" />
                {t('settings.databaseManagement')}
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{t('settings.databaseSize')}</p>
                    <p className="text-gray-600 text-sm">
                      {dbSize !== null ? `${dbSize} records` : t('settings.clickToRefresh')}
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
                    <p className="font-medium text-gray-800">{t('settings.exportData')}</p>
                    <p className="text-gray-600 text-sm">{t('settings.exportDataDescription')}</p>
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
                    <p className="font-medium text-gray-800">{t('settings.importData')}</p>
                    <p className="text-gray-600 text-sm">{t('settings.importDataDescription')}</p>
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
                    <p className="font-medium text-gray-800">{t('settings.clearDatabase')}</p>
                    <p className="text-gray-600 text-sm">{t('settings.clearDatabaseDescription')}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center justify-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('settings.clearAll')}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="p-6">
                      <DialogHeader className="mb-6">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                          {t('settings.clearDatabase')}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <p className="text-gray-600 text-base leading-relaxed">
                          {t('settings.clearDataWarning')}
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                          <p className="text-yellow-800 text-sm mb-3">
                            ⚠️ {t('settings.clearDataWarningDescription')}
                          </p>
                          <ul className="text-yellow-700 text-sm space-y-2">
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                              {t('settings.allInventoryItems')}
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                              {t('settings.allRecipes')}
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                              {t('settings.allUserSettings')}
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                              {t('settings.allUserData')}
                            </li>
                          </ul>
                        </div>
                        <div className="flex gap-4 justify-end pt-4">
                          <DialogTrigger asChild>
                            <button className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                              Cancel
                            </button>
                          </DialogTrigger>
                          <DialogTrigger asChild>
                            <button
                              onClick={clearDatabase}
                              disabled={isClearing}
                              className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap font-medium"
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
                    <p className="font-medium text-yellow-800">{t('settings.guestMode')}</p>
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    {t('settings.guestModeDescription')}
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
