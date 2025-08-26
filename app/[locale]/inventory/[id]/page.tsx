'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Inventory } from '@/shared/entities/inventory';
import { databaseService } from '@/shared/services/DatabaseService';
import { useAuth } from '@/shared/context/AuthContext';
import FoodDetailsPage from '../components/FoodDetailsPage';
import Navigation from '@/shared/components/Navigation';
import Link from 'next/link';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';

export default function FoodItemPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const localize = useLocalizedPath();
  const { isAuthenticated, isGuestMode } = useAuth();
  const [item, setItem] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemId = params.id as string;

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isAuthenticated) {
          // TODO: Fetch from cloud API
          setError('Cloud API not implemented yet');
        } else if (isGuestMode) {
          const items = await databaseService.getInventoryItems();
          const foundItem = items.find((item: Inventory) => item.id === itemId);
          if (foundItem) {
            setItem(foundItem);
          } else {
            setError('Item not found');
          }
        } else {
          setError('Authentication required');
        }
      } catch (err) {
        setError('Failed to load item');
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId, isAuthenticated, isGuestMode]);

  const handleEdit = (updatedItem: Inventory) => {
    if (isGuestMode) {
      databaseService.updateInventoryItem(updatedItem.id, updatedItem);
      setItem(updatedItem);
    }
    // TODO: Handle cloud API update
  };

  const handleDelete = () => {
    if (isGuestMode) {
      databaseService.deleteInventoryItem(itemId);
      router.push(localize('/'));
    }
    // TODO: Handle cloud API delete
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {error || 'Item not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The item you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              href={localize('/')}
              className="btn-cute"
            >
              {t('common.backToInventory')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FoodDetailsPage
          item={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
} 