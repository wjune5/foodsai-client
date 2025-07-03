'use client';

import { FC, memo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { AppDispatch } from '../../store/store';
import Navigation from '@/shared/components/Navigation';
import { storage } from '@/shared/utils/storage';
import { ReduxProvider } from '@/app/providers/ReduxProvider';
import { 
  setStorageType, 
  setCloudSubscription, 
  setAutoBackup, 
  setBackupFrequency,
  StorageType 
} from '../../store/slices/settingsSlice';
import { storageService } from '@/shared/services/StorageService';

const SettingsPageContainer: FC = memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const [showModal, setShowModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [upgradeStatus, setUpgradeStatus] = useState<string | null>(null);
  
  const inventoryItems = useSelector((state: RootState) => state.inventoryItems.items);
  const recipes = useSelector((state: RootState) => state.recipes.recipes);
  const settings = useSelector((state: RootState) => state.settings.settings);

  const handleLocalBackup = () => {
    try {
      storage.setLocalStorageWithTTL('foodsai_backup', { inventoryItems, recipes });
      setBackupStatus('Backup to local storage complete!');
    } catch (e) {
      setBackupStatus('Failed to backup to local storage.');
    }
    setShowModal(false);
  };

  const handleCloudBackup = async () => {
    try {
      const success = await storageService.saveData({
        inventoryItems,
        recipes,
        timestamp: Date.now(),
      });
      
      if (success) {
        setBackupStatus('Backup to cloud complete!');
      } else {
        setBackupStatus('Failed to backup to cloud.');
      }
    } catch (e) {
      setBackupStatus('Failed to backup to cloud.');
    }
    setShowModal(false);
  };

  const handleStorageTypeChange = async (newStorageType: StorageType) => {
    if (newStorageType === 'cloud' && !settings.isCloudSubscriptionActive) {
      setShowUpgradeModal(true);
      return;
    }
    
    dispatch(setStorageType(newStorageType));
    storageService.setStorageType(newStorageType);
    
    // Save settings to localStorage
    storage.setLocalStorageWithTTL('foodsai_settings', {
      ...settings,
      storageType: newStorageType,
    });
  };

  const handleUpgradeToCloud = async (tier: 'basic' | 'premium') => {
    try {
      const success = await storageService.upgradeToCloud(tier);
      if (success) {
        dispatch(setCloudSubscription({ active: true, tier }));
        dispatch(setStorageType('cloud'));
        storageService.setStorageType('cloud');
        setUpgradeStatus(`Successfully upgraded to ${tier} cloud storage!`);
        setShowUpgradeModal(false);
      } else {
        setUpgradeStatus('Failed to upgrade to cloud storage.');
      }
    } catch (error) {
      setUpgradeStatus('Failed to upgrade to cloud storage.');
    }
  };

  // Load settings on component mount
  useEffect(() => {
    const savedSettings = storage.getLocalStorage('foodsai_settings');
    if (savedSettings) {
      dispatch(setStorageType(savedSettings.storageType || 'localStorage'));
      if (savedSettings.isCloudSubscriptionActive) {
        dispatch(setCloudSubscription({ 
          active: true, 
          tier: savedSettings.cloudSubscriptionTier 
        }));
      }
    }
  }, [dispatch]);
  return (
  <div className="min-h-screen bg-pink-50 pb-24">
    <Navigation />
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-pink-700">Settings</h1>
      
      {/* Storage Choice Section */}
      <section className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-pink-600">Storage Settings</h2>
        <p className="mb-6 text-gray-500">Choose where to store your data. Local storage is free, cloud storage requires a subscription.</p>
        
        <div className="space-y-4">
          {/* Local Storage Option */}
          <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            settings.storageType === 'localStorage' 
              ? 'border-pink-500 bg-pink-50' 
              : 'border-gray-200 hover:border-pink-300'
          }`} onClick={() => handleStorageTypeChange('localStorage')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Local Storage (Free)</h3>
                <p className="text-sm text-gray-600">Store data on your device</p>
                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                  <li>• No monthly fees</li>
                  <li>• Data stays on your device</li>
                  <li>• Limited by device storage</li>
                </ul>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">$0</div>
                <div className="text-xs text-gray-500">per month</div>
              </div>
            </div>
          </div>

          {/* Cloud Storage Option */}
          <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            settings.storageType === 'cloud' 
              ? 'border-pink-500 bg-pink-50' 
              : 'border-gray-200 hover:border-pink-300'
          }`} onClick={() => handleStorageTypeChange('cloud')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Cloud Storage</h3>
                <p className="text-sm text-gray-600">Store data securely in the cloud</p>
                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                  <li>• Access from any device</li>
                  <li>• Automatic backups</li>
                  <li>• Unlimited storage</li>
                </ul>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">$4.99</div>
                <div className="text-xs text-gray-500">per month</div>
                {settings.isCloudSubscriptionActive && (
                  <div className="text-xs text-green-600 font-semibold">
                    {settings.cloudSubscriptionTier === 'premium' ? 'Premium' : 'Basic'} Active
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {settings.storageType === 'cloud' && !settings.isCloudSubscriptionActive && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Cloud storage requires a subscription. Click to upgrade.
            </p>
          </div>
        )}

        {upgradeStatus && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{upgradeStatus}</p>
          </div>
        )}
      </section>

      {/* Backup Section */}
      <section className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-pink-600">Backup your data</h2>
        <p className="mb-4 text-gray-500">Keep your inventory and recipes safe by backing them up.</p>
        <button
          className="btn-cute px-6 py-2"
          onClick={() => setShowModal(true)}
        >
          Backup Now
        </button>
        {backupStatus && <div className="mt-4 text-green-600">{backupStatus}</div>}
      </section>

      {/* Modal for backup options */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xs text-center">
            <h3 className="text-lg font-bold mb-4 text-pink-600">Choose backup method</h3>
            <button
              className="btn-cute w-full mb-3"
              onClick={handleCloudBackup}
            >
              Backup to Cloud
            </button>
            <button
              className="btn-cute w-full mb-3"
              onClick={handleLocalBackup}
            >
              Backup to Local Storage
            </button>
            <button
              className="mt-2 text-gray-400 hover:text-pink-500"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal for cloud upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
            <h3 className="text-xl font-bold mb-4 text-pink-600">Upgrade to Cloud Storage</h3>
            <p className="text-gray-600 mb-6">Choose a plan to unlock cloud storage features</p>
            
            <div className="space-y-4 mb-6">
              {/* Basic Plan */}
              <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-pink-300 cursor-pointer"
                   onClick={() => handleUpgradeToCloud('basic')}>
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800">Basic Plan</h4>
                    <p className="text-sm text-gray-600">Perfect for individual users</p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>• 10GB cloud storage</li>
                      <li>• Daily automatic backups</li>
                      <li>• Access from any device</li>
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">$4.99</div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-pink-300 cursor-pointer"
                   onClick={() => handleUpgradeToCloud('premium')}>
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800">Premium Plan</h4>
                    <p className="text-sm text-gray-600">For power users and families</p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>• Unlimited cloud storage</li>
                      <li>• Hourly automatic backups</li>
                      <li>• Advanced analytics</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">$9.99</div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="text-gray-400 hover:text-pink-500"
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  </div>
  )
});

export default function SettingsPage() {
 

  return (
    <ReduxProvider>
      <SettingsPageContainer />
    </ReduxProvider>
  );
}
