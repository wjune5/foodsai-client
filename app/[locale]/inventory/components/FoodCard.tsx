import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Inventory } from '@/shared/entities/inventory';
import { Trash2, Dot, AlertTriangle, Calendar, Package, Info, Pencil, XIcon, Minus, Plus, Check } from 'lucide-react';
import { Stepper } from '@/shared/components/stepper';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { calculateDaysLeft } from '@/shared/utils/date_util';
import { getIconByKey, DEFAULT_CATEGORY_ICONS, FoodIconKey } from '@/shared/constants/food-icons';
import ChatImage from '@/shared/components/ChatImage';

interface FoodCardProps {
  item: Inventory;
  onClick?: (item: Inventory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (item: Inventory, quantity: number) => void;
  consumeEnabled?: boolean;
  onConsume?: (id: string, quantity: number) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, onClick, onDelete, onEdit, consumeEnabled, onConsume }) => {
  const t = useTranslations();
  const router = useRouter();
  const localize = useLocalizedPath();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const { daysLeft, dotColor, status } = calculateDaysLeft(item.dateFrom || item.createTime, item.expirationDays);

  const handleClick = () => {
    if (onEdit && !consumeEnabled) {
      // Only handle click for navigation when not in consume mode
      return;
    }
    // Navigate to the details page instead of showing modal
    router.push(localize(`/inventory/${item.id}`));
    if (onClick) {
      onClick(item);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the onClick
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    }
    setShowDeleteDialog(false);
  };


  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    onConsume?.(item.id, value);
  }
  const handleConfirm = () => {
    if (onEdit) {
      onEdit(item, quantity);
    }
    setQuantity(0);
  };

  // Render image or icon
  const renderItemImage = () => {
    if (item.img) {
      if (item.img.mimeType === 'image/icon') {
        // System icon
        const iconKey = item.img.fileName.replace('icon:', '') as FoodIconKey;
        const iconData = getIconByKey(iconKey);
        if (iconData) {
          const IconComponent = iconData.icon;
          return (
            <div className="w-10 h-10 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-pink-600" />
            </div>
          );
        }
      } else {
        // Custom uploaded image
        return (
          <ChatImage
            src={item.img.data}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        );
      }
    }

    // Fallback to default category icon
    const defaultIconKey = DEFAULT_CATEGORY_ICONS[item.category] || DEFAULT_CATEGORY_ICONS.other;
    const iconData = getIconByKey(defaultIconKey);
    if (iconData) {
      const IconComponent = iconData.icon;
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-gray-600" />
        </div>
      );
    }

    // Final fallback - empty placeholder
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
        <Package className="w-5 h-5 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="group relative">
      {/* Card - Normal or Stepper mode */}
      {consumeEnabled ? (
                /* Stepper Mode */
        <div className="bg-white rounded-2xl shadow-md border border-pink-200 p-4 min-w-[280px] relative">
          {/* Check Button - Top Right */}
          {/* <button
            onClick={handleConfirm}
            className="absolute top-3 right-3 w-8 h-8 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
          </button> */}

          {/* Item Info */}
          <div className="flex items-center gap-3 mb-4 pr-10">
            {renderItemImage()}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
              <p className="text-xs text-gray-600">
                {t('inventory.available')}: {item.quantity} {item.unit}
              </p>
            </div>
          </div>
          
                     {/* Quantity Stepper */}
           <div className="flex items-center justify-center gap-3">
             <div className="text-center text-sm font-medium text-gray-800">{t('inventory.consume')}</div>
             <div className="flex items-center gap-1">
               <Stepper
                 value={quantity}
                 onChange={handleQuantityChange}
                 min={0}
                 max={item.quantity}
                 step={item.quantity < item.perOptQuantity? item.quantity : item.perOptQuantity || 1}
                 precision={1}
                 className="w-24"
               />
               <span className="text-xs text-gray-600">{item.unit}</span>
             </div>
           </div>
        </div>
      ) : (
        <div
          className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer max-w-xs"
          onClick={handleClick}
          title={onEdit ? `${t('inventory.consume')} ${item.name}` : `Select ${item.name} for recipe generation`}
        >
          {/* Image or Icon */}
          {renderItemImage()}
          
          {/* Name */}
          <span className="font-medium text-sm text-gray-800 truncate flex-1">
            {item.name}
          </span>
          
          {/* Quantity */}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Dot className="w-3 h-3" />
            <span>{item.quantity}{item.unit}</span>
          </div>
          
          {/* Days Left Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${dotColor} shadow-sm`}>
            {status === 'no-date' ? ' ' : daysLeft}
          </div>
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 shadow-sm transition-opacity"
              title={`${t('common.delete')} ${item.name}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              {t('common.delete')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-gray-600 text-base leading-relaxed">
              {t('message.deleteConfirmation', { name: item.name })}
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

export default FoodCard; 