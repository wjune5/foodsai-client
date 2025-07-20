'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import AddInventoryForm from '../components/AddForm';
import { InventoryCreate } from '../types/interfaces';
import { useAuth } from '@/shared/services/AuthContext';
import { guestModeService } from '@/shared/services/GuestModeService';

export default function AddInventoryPage() {
  const router = useRouter();
  const t = useTranslations();
  const localize = useLocalizedPath();
  const { isAuthenticated, isGuestMode } = useAuth();

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
      router.push(localize('/inventory'));
    } catch (error) {
      console.error('Error adding item:', error);
      // TODO: Show error toast/notification
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
          <div className="p-6 md:p-8">
            {/* The Form Component */}
            <AddInventoryForm
              onAdd={handleAddItem}
              mode="add"
            />
          </div>
        </div>
      </main>
    </div>
  );
} 