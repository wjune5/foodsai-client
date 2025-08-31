'use client';

import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import AddInventoryForm from '../components/AddForm';
import { InventoryCreate } from '../types/interfaces';
import { useAuth } from '@/shared/context/AuthContext';
import { databaseService } from '@/shared/services/DatabaseService';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Inventory } from '@/shared/entities/inventory';

function AddInventoryPageInner() {
  const router = useRouter();
  const localize = useLocalizedPath();
  const { isGuestMode } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  const [initialData, setInitialData] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (id && isGuestMode) {
        setLoading(true);
        const found = await databaseService.getInventoryItem(id);
        setInitialData(found || null);
        setLoading(false);
      } else if (category) {
        setInitialData({
          id: '',
          name: '',
          category: category,
          quantity: 1,
          originalQuantity: 1,
          unit: 'pcs',
          createdBy: 'guest',
          updatedBy: 'guest',
          createTime: new Date(),
          updateTime: new Date()
        });
      }
      // TODO: Add cloud API fetch for authenticated users
    };
    fetchItem();
  }, [id, isGuestMode, category]);

  const handleAddItem = async (item: InventoryCreate) => {
    try {
      if (isGuestMode) {
        // Handle guest mode storage
        await databaseService.addInventoryItem({
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
        await databaseService.updateInventoryItem(item.id, item);
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
              key={initialData?.category || 'default'}
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
  return (
    <Suspense fallback={<div>{'loading...'}</div>}>
      <AddInventoryPageInner />
    </Suspense>
  );
} 