import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Inventory, InventoryDetail } from '@/shared/entities/inventory';
import {
  Calendar,
  Package,
  Pencil,
  Trash2,
  Tag,
  ImageIcon,
  Edit,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { calculateDaysLeft } from '@/shared/utils/date_util';
import { FoodIconKey, getIconDataByKey, IconData } from '@/shared/constants/food-icons';
import ChatImage from '@/shared/components/ChatImage';
import DeleteDialog from '@/shared/components/DeleteDialog';
import { Button } from '@/shared/components/ui/button';

interface FoodDetailsPageProps {
  item: InventoryDetail;
  onEdit?: (item: Inventory) => void;
  onDelete: () => void;
}

const FoodDetailsPage: React.FC<FoodDetailsPageProps> = ({ item, onEdit, onDelete }) => {
  const t = useTranslations();
  const router = useRouter();
  const localize = useLocalizedPath();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [iconData, setIconData] = useState<IconData | undefined>(undefined);

  const { daysLeft, status } = calculateDaysLeft(item.dateFrom || item.createTime, item.expirationDays);

  // Load icon data asynchronously
  useEffect(() => {
    const loadIconData = async () => {
      if (item.img?.mimeType === 'image/icon') {
        const iconKey = item.img.data as FoodIconKey;
        const icon = await getIconDataByKey(iconKey);
        setIconData(icon);
      }
    };
    loadIconData();
  }, [item.img]);

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
      if (iconData) {
        const IconComponent = iconData.icon;
        return (
          <div className="flex items-center justify-center w-48 h-48 bg-pink-100 rounded-lg">
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
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(localize('/inventory/add') + `?id=${item.id}`);
            }}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('common.edit')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        confirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default FoodDetailsPage; 