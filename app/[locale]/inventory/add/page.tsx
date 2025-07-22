'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import AddInventoryForm from '../components/AddForm';
import { InventoryCreate } from '../types/interfaces';
import { useAuth } from '@/shared/context/AuthContext';
import { guestModeService } from '@/shared/services/GuestModeService';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Inventory } from '@/shared/entities/inventory';

function AddInventoryPageInner() {
  const router = useRouter();
  const t = useTranslations();
  const localize = useLocalizedPath();
  const { isGuestMode } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [initialData, setInitialData] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (id && isGuestMode) {
        setLoading(true);
        const found = await guestModeService.getInventoryItem(id);
        setInitialData(found || null);
        setLoading(false);
      }
      // TODO: Add cloud API fetch for authenticated users
    };
    fetchItem();
  }, [id, isGuestMode]);

  const handleAddItem = async (item: InventoryCreate) => {
    try {
      if (isGuestMode) {
        // Handle guest mode storage
        await guestModeService.addInventoryItem({
          ...item,
          originalQuantity: item.quantity,
          createdBy: 'guest',
          updatedBy: 'guest'
        });
      } else {
        // Handle authenticated user API call
        const response = await fetch('/api/inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });
        if (!response.ok) {
          throw new Error('Failed to add item');
        }
      }
      // Navigate back to inventory list
      router.push(localize('/'));
    } catch (error) {
      console.error('Error adding item:', error);
      // TODO: Show error toast/notification
    }
  };

  const handleEditItem = async (item: Inventory) => {
    try {
      if (isGuestMode) {
        await guestModeService.updateInventoryItem(item.id, item);
      } else {
        // TODO: Handle authenticated user API call for update
      }
      router.push(localize('/inventory'));
    } catch (error) {
      console.error('Error editing item:', error);
    }
  };

  if (id && loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
          <div className="p-6 md:p-8">
            {/* The Form Component */}
            <AddInventoryForm
              onAdd={handleAddItem}
              onEdit={handleEditItem}
              mode={id ? 'edit' : 'add'}
              initialData={initialData || undefined}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AddInventoryPage() {
  const t = useTranslations();
  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <AddInventoryPageInner />
    </Suspense>
  );
} 