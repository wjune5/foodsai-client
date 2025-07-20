import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Inventory } from '@/shared/entities/inventory';
import { Trash2, Dot, AlertTriangle, Calendar, Package, Info, Pencil, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import AddInventoryForm from './AddForm';
import { DialogClose } from '@/shared/components/Dialog';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { calculateDaysLeft } from '@/shared/utils/date_util';
import { getIconByKey, DEFAULT_CATEGORY_ICONS, FoodIconKey } from '@/shared/constants/food-icons';
import ChatImage from '@/shared/components/ChatImage';

interface FoodCardProps {
  item: Inventory;
  onClick?: (item: Inventory) => void;
  onDelete?: (id: string) => void;
  onEdit?: (item: Inventory) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, onClick, onDelete, onEdit }) => {
  const t = useTranslations();
  const router = useRouter();
  const localize = useLocalizedPath();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { daysLeft, dotColor, status } = calculateDaysLeft(item.expirationDate);

  const handleClick = () => {
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

  const handleEdit = (updatedItem: Inventory) => {
    if (onEdit) {
      onEdit(updatedItem);
    }
    setShowEditDialog(false);
  };

  // Render image or icon
  const renderItemImage = () => {
    if (item.img) {
      if (item.img.startsWith('icon:')) {
        // System icon
        const iconKey = item.img.replace('icon:', '') as FoodIconKey;
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
            src={item.img}
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
    <div
      className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group max-w-xs relative"
      onClick={handleClick}
      title={`Select ${item.name} for recipe generation`}
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
        {status === 'no-date' ? 'No Date' : daysLeft}
      </div>
      
      {/* Delete Button - Absolute positioned overlay */}
      {onDelete && (
        <button
          onClick={handleDeleteClick}
          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-sm"
          title={`Delete ${item.name}`}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Delete Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-gray-600 text-base leading-relaxed">
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end pt-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Item
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Info className="w-6 h-6 text-blue-500" />
                Item Details
              </DialogTitle>
              <DialogClose className="rounded-xs opacity-70 transition-opacity hover:opacity-100 p-1">
                <XIcon className="w-4 h-4" />
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            {/* Item Image and Basic Info */}
            <div className="flex items-start gap-4">
              <img
                src={item.img || 'https://waapple.org/wp-content/uploads/2021/06/Variety_Cosmic-Crisp-transparent-658x677.png'}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Package className="w-4 h-4" />
                  <span>{item.quantity} {item.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{item.category}</span>
                </div>
              </div>
            </div>

            {/* Expiration Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Expiration Status</h4>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${dotColor}`} />
                <span className={`font-medium ${
                  status === 'expired' ? 'text-red-600' : 
                  status === 'warning' ? 'text-yellow-600' : 
                  status === 'good' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {status === 'expired' ? 'Expired' : 
                   status === 'warning' ? 'Expiring soon' : 
                   status === 'good' ? 'Fresh' : 'No expiration date'}
                </span>
                {status !== 'no-date' && (
                  <span className="text-sm text-gray-600">
                    {daysLeft}
                  </span>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Added Date</span>
                <span className="text-sm font-medium text-gray-800">
                  {item.dateFrom ? new Date(item.dateFrom).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              {item.expirationDate && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Expiration Date</span>
                  <span className="text-sm font-medium text-gray-800">
                    {new Date(item.expirationDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Category</span>
                <span className="text-sm font-medium text-gray-800 capitalize">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              {onEdit && (
                <button
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setShowEditDialog(true);
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setShowDeleteDialog(true);
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog using AddForm */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto pb-6">
          <DialogHeader className="sticky w-full top-0 bg-white z-10 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Pencil className="w-6 h-6 text-blue-500" />
                  Edit Item
                </DialogTitle>
              </div>
              <DialogClose className="rounded-xs opacity-70 transition-opacity hover:opacity-100 p-1">
                <XIcon className="w-4 h-4" />
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="px-6">
            <AddInventoryForm 
              mode="edit"
              initialData={item}
              onEdit={handleEdit}
              onAdd={() => {}} // Required prop but not used in edit mode
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodCard; 