'use client';

import { FC, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/Separator';
import {
    BookOpen,
    Tag,
    Palette,
    Settings,
    ArrowRight,
    CheckCircle,
    Info,
    Lightbulb,
    Star,
    Zap,
    GripVertical,
    Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { Category } from '@/shared/entities/inventory';
import { databaseService } from '@/shared/services/DatabaseService';
import { DEFAULT_FOOD_ICONS } from '@/shared/constants/food-icons';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CategoryForm from '../categories/components/CategoryForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { CategoryFormData } from '../categories/type/interface';


const GuidePage: FC = () => {
    const t = useTranslations();
    const router = useRouter();
    const localize = useLocalizedPath();
    const locale = useLocale();
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Default icons available in the system
    const defaultIcons = DEFAULT_FOOD_ICONS.filter(icon => icon.builtIn && icon.isActive);

    // Fetch categories on component mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setIsLoading(true);
                const cats = await databaseService.getCategories(locale);
                setCategories(cats.sort((a, b) => a.sortValue - b.sortValue));
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
    }, [locale]);

    const navigateTo = (path: string) => {
        router.push(localize(path));
    };

    const handleAddCategory = async (categoryData: CategoryFormData) => {
        try {
            const newCategory = await databaseService.addCategory({
                ...categoryData,
                id: '',
                sortValue: categories.length,
                count: 0
            });
            setCategories(prev => [...prev, newCategory]);
        setIsAddDialogOpen(false);
        } catch (error) {
            console.error('Failed to add category:', error);
        }
    };

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setCategories((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Draggable Category Item Component
    const DraggableCategoryItem: FC<{ category: Category; onClick: () => void }> = ({ category, onClick }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: category.id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };

        return (
            <div
                ref={setNodeRef}
                style={style}
                className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:shadow-md transition-all group cursor-grab active:cursor-grabbing bg-white"
                {...attributes}
                {...listeners}
                onClick={onClick}
            >
                <div className="flex items-center gap-3">
                    <div>
                        <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate group-hover:text-pink-600 transition-colors">
                            {category.displayName}
                        </h4>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        {t('guide.title')}
                    </h1>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center" onClick={() => setCurrentStep(1)}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold ${currentStep >= 1 ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-300'
                                }`}>
                                1
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {t('categories.title')}
                                </p>
                            </div>
                        </div>

                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold ${currentStep >= 2 ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-300'
                                }`}>
                                2
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {t('icons.title')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {currentStep === 1 ? (
                            <div>
                                {/* Categories Overview */}
                                <Card className="mb-8">
                                    <CardHeader>
                                        <CardDescription>
                                            {t('guide.categories.overviewDescription')}
                                            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-dashed border-gray-400 rounded"></div>
                                                {t('guide.categories.dragToReorder')}
                                            </div>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                                            </div>
                                        ) : categories.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500 mb-4">{t('guide.categories.noCategories')}</p>
                                                <Button
                                                    onClick={() => navigateTo('/categories')}
                                                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                                >
                                                    {t('guide.categories.createFirstCategory')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <SortableContext
                                                    items={categories.map(cat => cat.id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="space-y-3">
                                                        {categories.map((category) => (
                                                            <DraggableCategoryItem
                                                                key={category.id}
                                                                category={category}
                                                                onClick={() => navigateTo('/categories')}
                                                            />
                                                        ))}
                                                        
                                                        {/* Add Category Button */}
                                                        <div className="flex justify-center mt-4">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setIsAddDialogOpen(true)}
                                                                className="border-dashed border-2 border-gray-300 hover:border-pink-400 hover:bg-pink-50 text-gray-600 hover:text-pink-700 transition-all group"
                                                            >
                                                                <div className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-pink-100 flex items-center justify-center mr-2 transition-colors">
                                                                    <Plus className="w-3 h-3" />
                                                                </div>
                                                                {t('guide.categories.addCategory')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </SortableContext>
                                            </DndContext>
                                        )}
                                        
                                    </CardContent>
                                </Card>

                                {/* Next Step Button */}
                                <div className="text-center mt-8">
                                    <Button
                                        onClick={() => setCurrentStep(2)}
                                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-500 hover:to-purple-700 text-white px-8 py-3 text-lg"
                                    >
                                        {t('common.next')}
                                        <ArrowRight className="w-5 h-5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* Default Icons Preview */}
                                <Card className="mb-8">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            {t('guide.icons.defaultIconsTitle')}
                                        </CardTitle>
                                        <CardDescription>
                                            {t('guide.icons.defaultIconsDescription')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                            {defaultIcons.map((icon, index) => (
                                                <div
                                                    key={icon.id}
                                                    className="flex flex-col items-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all cursor-pointer group"
                                                    onClick={() => navigateTo('/icons')}
                                                >
                                                    <div className="w-12 h-12 bg-white rounded-lg p-2 shadow-sm mb-2 group-hover:shadow-md transition-shadow flex items-center justify-center">
                                                        <div className="w-8 h-8 text-gray-600">
                                                            {icon.svgContent === 'apple' && '🍎'}
                                                            {icon.svgContent === 'banana' && '🍌'}
                                                            {icon.svgContent === 'cherry' && '🍒'}
                                                            {icon.svgContent === 'carrot' && '🥕'}
                                                            {icon.svgContent === 'salad' && '🥬'}
                                                            {icon.svgContent === 'milk' && '🥛'}
                                                            {icon.svgContent === 'egg' && '🥚'}
                                                            {icon.svgContent === 'beef' && '🥩'}
                                                            {icon.svgContent === 'fish' && '🐟'}
                                                            {icon.svgContent === 'wheat' && '🌾'}
                                                            {icon.svgContent === 'pizza' && '🍕'}
                                                            {icon.svgContent === 'coffee' && '☕'}
                                                            {icon.svgContent === 'wine' && '🍷'}
                                                            {icon.svgContent === 'cookie' && '🍪'}
                                                            {icon.svgContent === 'ice-cream' && '🍦'}
                                                            {icon.svgContent === 'sandwich' && '🥪'}
                                                            {icon.svgContent === 'soup' && '🍲'}
                                                            {!['apple', 'banana', 'cherry', 'carrot', 'salad', 'milk', 'egg', 'beef', 'fish', 'wheat', 'pizza', 'coffee', 'wine', 'cookie', 'ice-cream', 'sandwich', 'soup'].includes(icon.svgContent) && '🍽️'}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-600 text-center font-medium">
                                                        {icon.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            {t('guide.icons.featuresTitle')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <Palette className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800">
                                                        {t('guide.icons.feature1.title')}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {t('guide.icons.feature1.description')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                                                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                                    <Settings className="w-4 h-4 text-pink-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800">
                                                        {t('guide.icons.feature2.title')}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {t('guide.icons.feature2.description')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <Zap className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800">
                                                        {t('guide.icons.feature3.title')}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {t('guide.icons.feature3.description')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Icons Overview */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Palette className="w-5 h-5 text-purple-500" />
                                            {t('guide.icons.overviewTitle')}
                                        </CardTitle>
                                        <CardDescription>
                                            {t('guide.icons.overviewDescription')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Palette className="w-8 h-8 text-purple-600" />
                                            </div>

                                            <div className="flex gap-3 justify-center">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => navigateTo('/icons')}
                                                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                                                >
                                                    <Palette className="w-4 h-4 mr-2" />
                                                    {t('guide.icons.browseIcons')}
                                                </Button>
                                                <Button
                                                    onClick={() => navigateTo('/icons')}
                                                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                                >
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    {t('guide.icons.customizeIcons')}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Start Using App Button */}
                                <div className="text-center mt-8">
                                    <Button
                                        onClick={() => navigateTo('/inventory/add')}
                                        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 text-lg"
                                    >
                                        {t('guide.steps.startUsingApp')}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
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
            </div>
        </div>
    );
};

export default GuidePage;
