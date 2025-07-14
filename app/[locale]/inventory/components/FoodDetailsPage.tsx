import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Inventory } from '@/shared/entities/inventory';
import { 
  Calendar, 
  Package, 
  Info, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  MapPin,
  Tag,
  DollarSign,
  Clock,
  User,
  XIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import AddInventoryForm from './AddForm';
import Image from 'next/image';

interface FoodDetailsPageProps {
  item: Inventory;
  onEdit: (item: Inventory) => void;
  onDelete: () => void;
}

const FoodDetailsPage: React.FC<FoodDetailsPageProps> = ({ item, onEdit, onDelete }) => {
  const t = useTranslations();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const calculateDaysLeft = (expirationDate?: string) => {
    if (!expirationDate) return { daysLeft: '', daysNum: null, status: 'no-date' };
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) {
      return { daysLeft: 'Expired', daysNum: diff, status: 'expired' };
    } else if (diff <= 3) {
      return { daysLeft: `${diff} day${diff !== 1 ? 's' : ''}`, daysNum: diff, status: 'warning' };
    } else {
      return { daysLeft: `${diff} days`, daysNum: diff, status: 'good' };
    }
  };

  const { daysLeft, status } = calculateDaysLeft(item.expirationDate);

  const handleEdit = (updatedItem: Inventory) => {
    onEdit(updatedItem);
    setShowEditDialog(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="card-cute mb-6">
        <div className="flex flex-col gap-6 p-6">
          {/* Image - Centered */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-gray-200">
              <Image
                src={item.img || 'https://waapple.org/wp-content/uploads/2021/06/Variety_Cosmic-Crisp-transparent-658x677.png'}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
              />
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
                <span className="font-medium capitalize">{item.category}</span>
              </div>
            </div>

            {/* Expiration Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(status)}`}>
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                {status === 'no-date' ? 'No expiration date' : 
                 status === 'expired' ? 'Expired' : 
                 status === 'warning' ? 'Expiring soon' : 'Fresh'}
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Basic Information
        </h2>
        <div className="space-y-4">
          {item.price && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Price</span>
              <span className="font-medium text-gray-800">${item.price.toFixed(2)}</span>
            </div>
          )}
          {item.position && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Position</span>
              <span className="font-medium text-gray-800">{item.position}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Added Date</span>
            <span className="font-medium text-gray-800">
              {new Date(item.dateFrom).toLocaleDateString()}
            </span>
          </div>
          {item.expirationDate && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Expiration Date</span>
              <span className="font-medium text-gray-800">
                {new Date(item.expirationDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowEditDialog(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto pb-6">
          <DialogHeader className="sticky w-full top-0 bg-white z-10 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Pencil className="w-6 h-6 text-blue-500" />
                Edit {item.name}
              </DialogTitle>
              <button
                onClick={() => setShowEditDialog(false)}
                className="rounded-xs opacity-70 transition-opacity hover:opacity-100 p-1"
              >
                <XIcon className="w-4 h-4" />
              </button>
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
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-red-200">
                <Image
                  src={item.img || 'https://waapple.org/wp-content/uploads/2021/06/Variety_Cosmic-Crisp-transparent-658x677.png'}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.quantity} {item.unit} • {item.category}</p>
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
    </div>
  );
};

export default FoodDetailsPage; 