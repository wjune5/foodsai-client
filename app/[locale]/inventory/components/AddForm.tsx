import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { categories, units } from '@/shared/constants/constants';
import { Upload, ImageIcon, Palette } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InventoryCreate } from '../types/interfaces'
import { Inventory } from '@/shared/entities/inventory';
import { ALL_FOOD_ICONS, getIconByKey, DEFAULT_CATEGORY_ICONS, FoodIconKey } from '@/shared/constants/food-icons';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import ChatImage from '@/shared/components/ChatImage';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/Select';
import { Input } from '@/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { z } from 'zod';

type ImageSelectionMode = 'icon' | 'upload';

type AddInventoryProps = {
    onAdd: (item: InventoryCreate) => void;
    onEdit?: (item: Inventory) => void;
    initialData?: Inventory;
    mode?: 'add' | 'edit';
};

const FormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    unit: z.string().min(1, 'Unit is required'),
    expirationDate: z.string().optional(),
    img: z.string().optional(),
    price: z.coerce.number().min(0, 'Price must be 0 or greater').optional(),
    position: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

const AddInventoryForm: React.FC<AddInventoryProps> = ({ onAdd, onEdit, initialData, mode = 'add' }) => {
    const t = useTranslations();
    const { uploadImage, isUploading } = useImageUpload();

    const [imageMode, setImageMode] = useState<ImageSelectionMode>('icon');
    const [selectedIconKey, setSelectedIconKey] = useState<FoodIconKey>('carrot');

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            category: 'vegetable',
            quantity: 1,
            unit: 'pcs',
            expirationDate: '',
            img: `icon:${DEFAULT_CATEGORY_ICONS.vegetable}`,
            price: 0,
            position: '',
        }
    });

    // Initialize form with initial data when editing
    useEffect(() => {
        if (initialData && mode === 'edit') {
            form.reset({
                name: initialData.name,
                category: initialData.category,
                quantity: initialData.quantity,
                unit: initialData.unit,
                expirationDate: initialData.expirationDate || '',
                img: initialData.img || '',
                price: initialData.price || 0,
                position: initialData.position || ''
            });

            // Determine if initial data has a custom image or icon
            if (initialData.img) {
                if (initialData.img.startsWith('icon:')) {
                    setImageMode('icon');
                    setSelectedIconKey(initialData.img.replace('icon:', '') as FoodIconKey);
                } else {
                    setImageMode('upload');
                }
            }
        }
    }, [initialData, mode, form]);

    // Update selected icon when category changes
    useEffect(() => {
        const currentCategory = form.watch('category');
        if (imageMode === 'icon') {
            const defaultIcon = DEFAULT_CATEGORY_ICONS[currentCategory];
            setSelectedIconKey(defaultIcon);
            form.setValue('img', `icon:${defaultIcon}`);
        }
    }, [form.watch('category'), imageMode, form]);

    const handleImageModeChange = (mode: ImageSelectionMode) => {
        setImageMode(mode);
        if (mode === 'icon') {
            const currentCategory = form.getValues('category');
            const defaultIcon = DEFAULT_CATEGORY_ICONS[currentCategory];
            setSelectedIconKey(defaultIcon);
            form.setValue('img', `icon:${defaultIcon}`);
        } else {
            form.setValue('img', '');
        }
    };

    const handleIconSelect = (iconKey: FoodIconKey) => {
        setSelectedIconKey(iconKey);
        form.setValue('img', `icon:${iconKey}`);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const result = await uploadImage(file);
        if (result.success && result.imageUrl) {
            form.setValue('img', result.imageUrl);
        } else {
            alert(result.error || t('chat.uploadError'));
        }

        // Reset file input
        e.target.value = '';
    };

    const onSubmit = (data: FormData) => {
        if (mode === 'edit' && onEdit && initialData) {
            onEdit({ ...initialData, ...data });
        } else {
            onAdd({ ...data, dateFrom: new Date().toISOString() });
            form.reset({
                name: '',
                category: 'vegetable',
                quantity: 1,
                unit: 'pcs',
                expirationDate: '',
                img: `icon:${DEFAULT_CATEGORY_ICONS.vegetable}`,
                price: 0,
                position: ''
            });
            setSelectedIconKey(DEFAULT_CATEGORY_ICONS.vegetable);
            setImageMode('icon');
        }
    };

    const renderIconPreview = () => {
        const currentImg = form.watch('img');
        
        if (imageMode === 'icon' && currentImg?.startsWith('icon:')) {
            const iconKey = currentImg.replace('icon:', '') as FoodIconKey;
            const iconData = getIconByKey(iconKey);
            if (iconData) {
                const IconComponent = iconData.icon;
                return (
                    <div className="flex items-center justify-center w-16 h-16 bg-pink-100 rounded-lg border-2 border-pink-200">
                        <IconComponent className="w-8 h-8 text-pink-600" />
                    </div>
                );
            }
        } else if (currentImg && !currentImg.startsWith('icon:')) {
            return (
                <ChatImage
                    src={currentImg}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border-2 border-pink-200"
                />
            );
        }
        return (
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200">
                <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
        );
    };

    const selectedIconData = getIconByKey(selectedIconKey);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('inventory.itemName')}</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('inventory.category')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('inventory.category')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>
                                            {t(`inventory.categories.${cat}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Image Selection Section */}
                <div>
                    <label className="block mb-3 font-medium">{t('inventory.image')}</label>
                    
                    {/* Mode Selection Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => handleImageModeChange('icon')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                imageMode === 'icon' 
                                    ? 'bg-pink-100 border-pink-300 text-pink-700' 
                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Palette className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('inventory.systemIcons')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleImageModeChange('upload')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                imageMode === 'upload' 
                                    ? 'bg-pink-100 border-pink-300 text-pink-700' 
                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Upload className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('inventory.uploadImage')}</span>
                        </button>
                    </div>

                    {/* Image Preview and Icon Selection */}
                    <div className="flex items-center gap-4 mb-4">
                        {renderIconPreview()}
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">
                                {imageMode === 'icon' 
                                    ? t('inventory.chooseIcon')
                                    : t('inventory.uploadCustom')
                                }
                            </p>
                            
                            {/* Icon Selection - Select Component (inline with preview) */}
                            {imageMode === 'icon' && (
                                <Select value={selectedIconKey} onValueChange={handleIconSelect}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue>
                                            <div className="flex items-center gap-2">
                                                {selectedIconData && (
                                                    <selectedIconData.icon className="w-4 h-4 text-pink-600" />
                                                )}
                                                <span>{selectedIconData?.label}</span>
                                            </div>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ALL_FOOD_ICONS.map((iconData) => {
                                            const IconComponent = iconData.icon;
                                            return (
                                                <SelectItem key={iconData.key} value={iconData.key}>
                                                    <div className="flex items-center gap-2">
                                                        <IconComponent className="w-4 h-4 text-pink-600" />
                                                        <span>{iconData.label}</span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Image Upload (inline with preview) */}
                            {imageMode === 'upload' && (
                                <div>
                                    <Input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                    {isUploading && (
                                        <p className="text-sm text-pink-600 mt-2">{t('chat.uploading')}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('inventory.quantity')}</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        min="1" 
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('inventory.unit')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('inventory.unit')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {units.map(u => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <div className="flex gap-2">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('inventory.price')}</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        min="0" 
                                        step="0.01" 
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('inventory.position')}</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder={t('inventory.positionPlaceholder')}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <FormField
                    control={form.control}
                    name="expirationDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('inventory.expiryDate')}</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <button 
                    type="submit" 
                    disabled={isUploading}
                    className="btn-cute w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? t('chat.uploading') : (mode === 'edit' ? t('common.save') : t('inventory.addItem'))}
                </button>
            </form>
        </Form>
    );
};

export default AddInventoryForm;