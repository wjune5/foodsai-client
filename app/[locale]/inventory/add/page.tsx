'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X, Save, Plus, ChefHat } from 'lucide-react';
import { addInventoryItem } from '../../../store/slices/foodItemsSlice';
import { InventoryItem } from '../../../store/slices/foodItemsSlice';
import { ReduxProvider } from '@/shared/providers/ReduxProvider';

export default function AddInventoryItem() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'other' as InventoryItem['category'],
    expirationDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: InventoryItem['category'][] = ['vegetable', 'dairy', 'meat', 'fruit', 'grain', 'other'];
  const units = ['pieces', 'grams', 'kilograms', 'liters', 'milliliters', 'cups', 'tablespoons', 'teaspoons'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.expirationDate && new Date(formData.expirationDate) < new Date()) {
      newErrors.expirationDate = 'Expiration date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      quantity: formData.quantity,
      unit: formData.unit,
      category: formData.category,
      dateFrom: new Date().toISOString(),
      expirationDate: formData.expirationDate || undefined,
    };

    dispatch(addInventoryItem(newItem));
    router.push('/food');
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ReduxProvider>
    <div className="min-h-screen">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link 
            href="/food"
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="icon-cute">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Add Food Item</h1>
              <p className="text-gray-300">Add a new item to your inventory ✨</p>
            </div>
          </div>
        </div>

        <div className="card-cute">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm transition-all duration-200 ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="e.g., Milk, Apples, Chicken Breast"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-3">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as InventoryItem['category'])}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-3">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="0.1"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm transition-all duration-200 ${
                    errors.quantity ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.quantity && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.quantity}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-semibold text-gray-700 mb-3">
                  Unit
                </label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expiration Date */}
            <div>
              <label htmlFor="expirationDate" className="block text-sm font-semibold text-gray-700 mb-3">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                id="expirationDate"
                value={formData.expirationDate}
                onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm transition-all duration-200 ${
                  errors.expirationDate ? 'border-red-300' : 'border-gray-200'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.expirationDate && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.expirationDate}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500 flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                Leave empty if the item doesn't expire
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link
                href="/food"
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn-cute"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
    </ReduxProvider>
  );
} 