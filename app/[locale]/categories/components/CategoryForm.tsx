'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CategoryFormData } from '../type/interface';

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const t = useTranslations();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || '',
    displayName: initialData?.displayName || '',
    color: initialData?.color || '#10B981',
    icon: initialData?.icon || ''
  });
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});

  const predefinedColors = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
    '#EF4444', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F87171'
  ];

  const handleChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate name from displayName if it's empty
    if (field === 'displayName' && !initialData?.name) {
      const generatedName = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      setFormData(prev => ({ ...prev, name: generatedName }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('categories.errors.nameRequired');
    } else if (!/^[a-z0-9_]+$/.test(formData.name)) {
      newErrors.name = t('categories.errors.nameInvalid');
    }
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = t('categories.errors.displayNameRequired');
    }
    
    if (!formData.color) {
      newErrors.color = t('categories.errors.colorRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('categories.displayName')}
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => handleChange('displayName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
            errors.displayName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('categories.displayNamePlaceholder')}
        />
        {errors.displayName && (
          <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
        )}
      </div>

      {/* Internal Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('categories.internalName')}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('categories.internalNamePlaceholder')}
          disabled={!!initialData?.name} // Don't allow changing name for existing categories
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {t('categories.internalNameHelp')}
        </p>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('categories.color')}
        </label>
        <div className="space-y-3">
          {/* Predefined Colors */}
          <div className="flex flex-wrap gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange('color', color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color 
                    ? 'border-gray-800 scale-110' 
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          {/* Custom Color Input */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              placeholder="#10B981"
            />
          </div>
        </div>
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color}</p>
        )}
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('categories.preview')}
        </label>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: formData.color }}
          />
          <span className="font-medium text-gray-800">
            {formData.displayName || t('categories.displayNamePlaceholder')}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          {t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm; 