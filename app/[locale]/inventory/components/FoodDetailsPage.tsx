import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Inventory, InventoryDetail } from '@/shared/entities/inventory';
import { 
  Calendar, 
  Package, 
  Info, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  Tag,
  ImageIcon,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { calculateDaysLeft } from '@/shared/utils/date_util';
import { FoodIconKey, getIconByKey } from '@/shared/constants/food-icons';
import ChatImage from '@/shared/components/ChatImage';

interface FoodDetailsPageProps {
  item: InventoryDetail;
  onEdit: (item: Inventory) => void;
  onDelete: () => void;
}

const FoodDetailsPage: React.FC<FoodDetailsPageProps> = ({ item, onEdit, onDelete }) => {
  const t = useTranslations();
  const router = useRouter();
  const localize = useLocalizedPath();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { daysLeft, status } = calculateDaysLeft(item.dateFrom || item.createTime, item.expirationDays);

  const handleEdit = (updatedItem: Inventory) => {
    onEdit(updatedItem);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderImage = () => {
    if (item.img?.mimeType === 'image/icon') {
      const iconKey = item.img.data as FoodIconKey;
      const iconData = getIconByKey(iconKey);
      if (iconData) {
          const IconComponent = iconData.icon;
          return (
              <div className="flex items-center justify-center w-48 h-48 bg-pink-100 rounded-lg border-2 border-pink-200">
                  <IconComponent className="w-full h-full" style={{ color: item.iconColor }} />
              </div>
          );
      }
    } else if (item.img?.mimeType === 'image/jpeg') {
        return (
            <ChatImage
                src={item.img.data}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg border-2 border-pink-200"
            />
        );
    }
    return (
        <div className="flex items-center justify-center w-48 h-48 bg-gray-100 rounded-lg border-2 border-gray-200">
            <ImageIcon className="w-full h-full text-gray-400" />
        </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="card-cute mb-6">
        <div className="flex flex-col gap-6 p-6">
          {/* Image - Centered */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-gray-200">
              {renderImage()}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{item.name}</h1>
            </div>

            {/* Quantity and Category */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="w-5 h-5" />
                <span className="font-medium">{item.quantity} / {item.originalQuantity} {item.unit}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="w-5 h-5" />
                <span className="font-medium capitalize">{item.category.displayName}</span>
              </div>
            </div>

            {/* Expiration Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(status)}`}>
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                {status === 'no-date' ? t('inventory.noExpirationDate') : 
                 status === 'expired' ? t('inventory.expired') : 
                 status === 'warning' ? t('inventory.expiringSoon') : t('inventory.fresh')}
              </span>
              {status !== 'no-date' && (
                <span className="text-sm">({daysLeft})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="card-cute p-6 mb-6">
        <div className="space-y-4">
          {item.price !== undefined && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">{t('inventory.price')}</span>
              <span className="font-medium text-gray-800">${item.price.toFixed(2)}</span>
            </div>
          )}
          {item.position && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">{t('inventory.position')}</span>
              <span className="font-medium text-gray-800">{item.position}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">{t('inventory.startDate')}</span>
            <span className="font-medium text-gray-800">
              {new Date(item.dateFrom || item.createTime || '').toLocaleDateString()}
            </span>
          </div>
          {item.expirationDays && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('inventory.expiryDate')}</span>
              <span className="font-medium text-gray-800">
                {new Date(new Date(item.dateFrom || item.createTime || '').getTime() + item.expirationDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          )}
          
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            router.push(localize('/inventory/add') + `?id=${item.id}`);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Pencil className="w-4 h-4" />
          {t('common.edit')}
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          <Trash2 className="w-4 h-4" />
          {t('common.delete')}
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              {t('common.delete')} {item.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-red-200">
                <Image
                  src={item.img?.data || 'https://waapple.org/wp-content/uploads/2021/06/Variety_Cosmic-Crisp-transparent-658x677.png'}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.quantity} {item.unit} • {item.category.displayName}</p>
              </div>
            </div>
            <p className="text-gray-600 text-base leading-relaxed">
              Are you sure you want to delete this item? This action cannot be undone and will permanently remove "{item.name}" from your inventory.
            </p>
            <div className="flex gap-4 justify-end pt-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('common.delete')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodDetailsPage; 