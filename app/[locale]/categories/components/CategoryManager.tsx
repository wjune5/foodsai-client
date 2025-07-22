'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Edit2, Trash2, GripVertical, Tag, AlertTriangle, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import CategoryForm from './CategoryForm';
import { categories as defaultCategories } from '@/shared/constants/constants';

interface Category {
    id: string;
    name: string;
    displayName: string;
    color: string;
    icon?: string;
    isDefault: boolean;
    itemCount: number;
}

const CategoryManager: React.FC = () => {
    const t = useTranslations();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Initialize categories from localStorage or defaults
    useEffect(() => {
        const savedCategories = localStorage.getItem('customCategories');
        if (savedCategories) {
            setCategories(JSON.parse(savedCategories));
        } else {
            // Initialize with default categories
            const initialCategories: Category[] = defaultCategories.map((cat, index) => ({
                id: cat,
                name: cat,
                displayName: t(`inventory.categories.${cat}`),
                color: getDefaultColor(index),
                isDefault: true,
                itemCount: 0 // TODO: Get actual count from inventory
            }));
            setCategories(initialCategories);
            localStorage.setItem('customCategories', JSON.stringify(initialCategories));
        }
    }, [t]);

    const getDefaultColor = (index: number) => {
        const colors = [
            '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
            '#EF4444', '#06B6D4', '#84CC16', '#F97316'
        ];
        return colors[index % colors.length];
    };

    const saveCategories = (newCategories: Category[]) => {
        setCategories(newCategories);
        localStorage.setItem('customCategories', JSON.stringify(newCategories));
        // TODO: Also update the constants file or global state
    };

    const handleAddCategory = (categoryData: Omit<Category, 'id' | 'isDefault' | 'itemCount'>) => {
        const newCategory: Category = {
            ...categoryData,
            id: `custom_${Date.now()}`,
            isDefault: false,
            itemCount: 0
        };
        const newCategories = [...categories, newCategory];
        saveCategories(newCategories);
        setIsAddDialogOpen(false);
    };

    const handleEditCategory = (categoryData: Omit<Category, 'id' | 'isDefault' | 'itemCount'>) => {
        if (!selectedCategory) return;

        const newCategories = categories.map(cat =>
            cat.id === selectedCategory.id
                ? { ...cat, ...categoryData }
                : cat
        );
        saveCategories(newCategories);
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
    };

    const handleDeleteCategory = () => {
        if (!selectedCategory) return;

        const newCategories = categories.filter(cat => cat.id !== selectedCategory.id);
        saveCategories(newCategories);
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null) return;

        const newCategories = [...categories];
        const draggedItem = newCategories[draggedIndex];
        newCategories.splice(draggedIndex, 1);
        newCategories.splice(index, 0, draggedItem);

        setCategories(newCategories);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null) {
            localStorage.setItem('customCategories', JSON.stringify(categories));
        }
        setDraggedIndex(null);
    };

    return (
        <div className="space-y-6">
            {/* Categories List */}
            <div className="card-cute">
                <div className="p-6">
                    {/* Add Category Button */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {t('categories.manageCategories')}
                            </h2>
                        </div>
                        <button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="btn-cute flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {categories.map((category, index) => (
                            <div
                                key={category.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-transparent hover:border-pink-200 transition-all cursor-move ${draggedIndex === index ? 'opacity-50' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-800">
                                                {category.displayName}
                                            </span>
                                            {category.isDefault && (
                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                    {t('categories.default')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {t('categories.itemCount', { count: category.itemCount })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setIsEditDialogOpen(true);
                                        }}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title={t('common.edit')}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    {!category.isDefault && (
                                        <button
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title={t('common.delete')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Category Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto pb-6 px-6">
                    <DialogHeader className="sticky w-50 top-0 bg-white z-10 pb-4 pt-6">
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-green-600" />
                            {t('common.add')}
                        </DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        onSubmit={handleAddCategory}
                        onCancel={() => setIsAddDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md p-8">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-blue-600" />
                            {t('common.edit')}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedCategory && (
                        <CategoryForm
                            initialData={selectedCategory}
                            onSubmit={handleEditCategory}
                            onCancel={() => {
                                setIsEditDialogOpen(false);
                                setSelectedCategory(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto pb-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            {t('common.delete')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-6">
                        <p className="text-gray-600">
                            {t('categories.deleteConfirmation', {
                                name: selectedCategory?.displayName || ''
                            })}
                        </p>
                        {selectedCategory && selectedCategory.itemCount > 0 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    {t('categories.deleteWarning', {
                                        count: selectedCategory.itemCount
                                    })}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setSelectedCategory(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDeleteCategory}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoryManager; 