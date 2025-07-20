import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { categories, units } from '@/shared/constants/constants';
import { Upload, ImageIcon, Palette, Camera, Edit3 } from 'lucide-react';
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
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import EditableTable from '@/shared/components/editable_table';
import { z } from 'zod';
import { Stepper } from '@/shared/components/stepper';
import { useSys } from '@/shared/hooks/useSys';

type ImageSelectionMode = 'icon' | 'upload';
type InputMode = 'photo' | 'manual';

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
    const isMobile = useSys();

    const [inputMode, setInputMode] = useState<InputMode>('photo');
    const [imageMode, setImageMode] = useState<ImageSelectionMode>('upload'); // Start with upload for photo mode
    const [selectedIconKey, setSelectedIconKey] = useState<FoodIconKey>('carrot');
    const [recognizedItems, setRecognizedItems] = useState<Array<{
        action: string;
        table: string;
        entity: string;
        quantity?: number;
        unit?: string;
        description?: string;
        expirationDate?: string;
    }>>([]);

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            category: 'vegetable',
            quantity: 1,
            unit: 'pcs',
            expirationDate: '',
            img: '', // Start with empty image for photo mode
            price: 0,
            position: '',
        }
    });

    // Initialize form with initial data when editing
    useEffect(() => {
        if (initialData && mode === 'edit') {
            // When editing, always start with manual mode to show all fields
            setInputMode('manual');
            
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

    const handleInputModeChange = (newMode: string) => {
        const mode = newMode as InputMode;
        setInputMode(mode);
        if (mode === 'photo') {
            // Reset form to minimal state for photo mode
            form.reset({
                name: '',
                category: 'vegetable',
                quantity: 1,
                unit: 'pcs',
                expirationDate: '',
                img: '',
                price: 0,
                position: '',
            });
            setImageMode('upload');
            setRecognizedItems([]); // Clear recognized items
        } else if (mode === 'manual') {
            // Set default icon for manual mode if no image is set
            const currentImg = form.getValues('img');
            if (!currentImg) {
                form.setValue('img', `icon:${DEFAULT_CATEGORY_ICONS.vegetable}`);
                setImageMode('icon');
            }
        }
    };

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

        // Same handling for both camera capture and gallery upload
        const result = await uploadImage(file);
        if (result.success && result.imageUrl) {
            form.setValue('img', result.imageUrl);
            
            // If in photo mode, populate recognized items
            // This applies to both camera and gallery images
            if (inputMode === 'photo') {
                // TODO: Replace with actual AI service integration
                // Mock recognized items for demonstration
                const mockRecognizedItems = [
                    {
                        action: 'add',
                        table: 'Inventory',
                        entity: 'Apple',
                        quantity: 3,
                        unit: 'pcs',
                        description: 'Fresh red apples',
                        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
                    },
                    {
                        action: 'add',
                        table: 'Inventory', 
                        entity: 'Banana',
                        quantity: 2,
                        unit: 'pcs',
                        description: 'Yellow bananas',
                        expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 days from now
                    },
                    {
                        action: 'add',
                        table: 'Inventory',
                        entity: 'Milk',
                        quantity: 1,
                        unit: 'liter',
                        description: 'Fresh dairy milk',
                        expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 10 days from now
                    }
                ];
                setRecognizedItems(mockRecognizedItems);
            }
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
            if (inputMode === 'photo') {
                // Handle multiple items from photo recognition
                // Since action column is hidden, treat all items as items to add
                recognizedItems.forEach(item => {
                    const inventoryItem: InventoryCreate = {
                        name: item.entity,
                        category: 'other', // TODO: Map from description or add category field to table
                        quantity: item.quantity || 1,
                        unit: item.unit || 'pcs',
                        expirationDate: item.expirationDate || '',
                        img: form.getValues('img'),
                        price: 0, // TODO: Add price field to table if needed
                        position: '',
                        dateFrom: new Date().toISOString()
                    };
                    onAdd(inventoryItem);
                });
                // Reset photo mode
                form.reset({
                    name: '',
                    category: 'vegetable',
                    quantity: 1,
                    unit: 'pcs',
                    expirationDate: '',
                    img: '',
                    price: 0,
                    position: ''
                });
                setRecognizedItems([]);
            } else {
                // Handle single item from manual mode
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
        }
    };

    const renderPhotoMode = () => {
        const currentImg = form.watch('img');
        
        return (
            <div className="space-y-6">
                {/* Photo Upload Section */}
                <div className="text-center flex-shrink-0">
                    <div className="flex flex-col items-center gap-4">
                        {currentImg ? (
                            <ChatImage
                                src={currentImg}
                                alt="Uploaded food item"
                                className="w-48 h-48 object-cover rounded-xl border-4 border-pink-200 shadow-lg"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-48 h-48 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-4 border-pink-200 border-dashed">
                                <div className="text-center">
                                    <Camera className="w-12 h-12 text-pink-400 mx-auto mb-2" />
                                    <p className="text-pink-600 font-medium">{t('inventory.addPhotoToStart')}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            {/* Camera button - only show on mobile devices */}
                            {isMobile && (
                                <label className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors cursor-pointer">
                                    <Camera className="w-4 h-4" />
                                    <span className="text-sm font-medium">{t('inventory.takePhoto')}</span>
                                    <Input 
                                        type="file" 
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                    />
                                </label>
                            )}
                            {/* Upload button - primary on desktop, secondary on mobile */}
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                isMobile 
                                    ? 'bg-white text-pink-600 border border-pink-300 hover:bg-pink-50' 
                                    : 'bg-pink-500 text-white hover:bg-pink-600'
                            }`}>
                                <Upload className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('inventory.uploadFromGallery')}</span>
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        
                        {isUploading && (
                            <p className="text-pink-600 text-sm animate-pulse">{t('chat.uploading')}</p>
                        )}
                    </div>
                </div>

                {/* Recognized Items Table */}
                {currentImg && (
                    <div className="space-y-4 pt-4 border-t border-pink-100">
                        <div className="text-center">
                            <p className="text-gray-600 text-sm">
                                {t('inventory.reviewRecognizedItems')}
                            </p>
                        </div>
                        <EditableTable 
                            data={recognizedItems}
                            onDataChange={setRecognizedItems}
                            showActionColumn={false}
                        />               
                    </div>
                )}
            </div>
        );
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

    const renderManualMode = () => (
        <div className="space-y-4">
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
                        
                        {/* Icon Selection - Select Component */}
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

                        {/* Image Upload */}
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
                                <Stepper
                                    value={field.value}
                                    onChange={field.onChange}
                                    min={1}
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
        </div>
    );

    const selectedIconData = getIconByKey(selectedIconKey);

    return (
        <Form {...form}>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                {/* Input Mode Selection - Only show for add mode */}
                {mode === 'add' ? (
                    <Tabs value={inputMode} onValueChange={handleInputModeChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="photo" className="flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                {t('inventory.photoMode')}
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="flex items-center gap-2">
                                <Edit3 className="w-4 h-4" />
                                {t('inventory.manualMode')}
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="photo" className="mt-6 space-y-6">
                            {renderPhotoMode()}
                        </TabsContent>
                        
                        <TabsContent value="manual" className="mt-6 space-y-6">
                            {renderManualMode()}
                        </TabsContent>
                        <button 
                                type="submit" 
                                disabled={isUploading || (inputMode === 'photo' && recognizedItems.length === 0)}
                                className={`btn-cute w-full disabled:opacity-50 disabled:cursor-not-allowed ${inputMode === 'photo' && !form.watch('img') ? 'hidden' : ''}`}
                            >
                            {isUploading 
                                ? t('chat.uploading') 
                                : t('inventory.addItem')
                            }
                        </button>
                    </Tabs>
                ) : (
                    <div className="space-y-6">
                        {/* Edit mode - always manual */}
                        {renderManualMode()}
                        
                        <button 
                            type="submit" 
                            disabled={isUploading}
                            className="btn-cute w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? t('chat.uploading') : t('common.save')}
                        </button>
                    </div>
                )}
            </form>
        </Form>
    );
};

export default AddInventoryForm;