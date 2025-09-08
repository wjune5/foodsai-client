import { useState, useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { units } from '@/shared/constants/constants';
import { Upload, ImageIcon, Palette, Camera, Edit3, CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InventoryCreate } from '../types/interfaces'
import { Category, Inventory } from '@/shared/entities/inventory';
import { getAllIcons, getIconDataByKey, getIconsByCategory, DEFAULT_CATEGORY_ICONS, DEFAULT_FOOD_ICONS, FoodIconKey, IconData } from '@/shared/constants/food-icons';
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
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import EditableTable from '@/shared/components/editable_table';
import { z } from 'zod';
import { Stepper } from '@/shared/components/stepper';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { useSys } from '@/shared/hooks/useSys';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { format } from 'date-fns';
import { toast, Toaster } from 'sonner';
import { databaseService } from '@/shared/services/DatabaseService';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/components/ui/collapsible';

type ImageSelectionMode = 'icon' | 'upload';
type InputMode = 'photo' | 'manual';

type AddInventoryProps = {
    onAdd: (item: InventoryCreate) => void;
    onEdit?: (item: Inventory) => void;
    initialData?: Inventory;
    mode?: 'add' | 'edit';
};

const AddInventoryForm: React.FC<AddInventoryProps> = ({ onAdd, onEdit, initialData, mode = 'add' }) => {
    const t = useTranslations();
    const { uploadImage, isUploading } = useImageUpload();
    const isMobile = useSys();
    const locale = useLocale();
    const [inputMode, setInputMode] = useState<InputMode>('manual');
    const [imageMode, setImageMode] = useState<ImageSelectionMode>('icon');
    const [selectedIconKey, setSelectedIconKey] = useState<FoodIconKey>('carrot');
    const [recognizedItems, setRecognizedItems] = useState<Array<{
        action: string;
        table: string;
        entity: string;
        quantity?: number;
        perOptQuantity?: number;
        unit?: string;
        description?: string;
        expirationDays?: number;
    }>>([]);
    const [iconColor, setIconColor] = useState<string>('#db2777');
    const [allIcons, setAllIcons] = useState<IconData[]>([]);
    const [previewIconData, setPreviewIconData] = useState<IconData | undefined>(undefined);

    const FormSchema = z.object({
        name: z.string().min(1, t('inventory.nameRequired')),
        category: z.string().min(1, t('inventory.categoryRequired')),
        quantity: z.coerce.number().min(0, t('inventory.quantityRequired')),
        perOptQuantity: z.coerce.number(),
        unit: z.string().min(1, t('inventory.unitRequired')),
        expirationDays: z.number().min(-365).optional(),
        img: z.object({
            id: z.string(),
            fileName: z.string(),
            mimeType: z.string(),
            size: z.number(),
            data: z.string()
        }).optional(),
        price: z.coerce.number().min(0, t('inventory.priceRequired')).optional(),
        position: z.string().optional(),
        iconColor: z.string().optional(),
        dateFrom: z.date().optional(),
    });

    type FormData = z.infer<typeof FormSchema>;
    const [categories, setCategories] = useState<Category[]>([]);

    const defaultImg = useMemo(() => {
        return {
            id: '',
            fileName: `icon:${DEFAULT_CATEGORY_ICONS.vegetable}`,
            mimeType: 'image/icon',
            size: 0,
            data: `${DEFAULT_CATEGORY_ICONS.vegetable}`
        };
    }, []);

    const defaultFormData = useMemo(() => {
        const category = initialData?.category != 'all' ? initialData?.category : categories[0]?.id;

        return {
            name: '',
            category: category,
            quantity: 1,
            perOptQuantity: 1,
            unit: 'pcs',
            expirationDays: 0,
            img: defaultImg,
            price: undefined,
            position: '',
            dateFrom: new Date(),
            iconColor: '#db2777',
        };
    }, [initialData?.category, categories]);

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: defaultFormData,
        mode: 'onSubmit'
    });

    useEffect(() => {
        databaseService.getCategories(locale).then(cats => {
            setCategories(cats);
            // Set initial category and load icons for that category
            const initialCategory = cats[0].id || '';
            loadIconsByCategory(initialCategory);
            form.setValue('category', initialCategory);
        });
    }, [locale]);

    const loadIconsByCategory = async (category: string) => {
        try {
            const icons = await getIconsByCategory(category);
            setAllIcons(icons);
            if (icons && icons.length > 0 && icons[0]) {
                setSelectedIconKey(icons[0].key as FoodIconKey);
            } else {
                setSelectedIconKey(DEFAULT_CATEGORY_ICONS.vegetable);
            }
        } catch (error) {
            console.error('Failed to load icons for category:', category, error);
            // Fallback to all icons
            const allIcons = await getAllIcons();
            setAllIcons(allIcons);
            if (allIcons && allIcons.length > 0 && allIcons[0]) {
                setSelectedIconKey(allIcons[0].key as FoodIconKey);
            } else {
                setSelectedIconKey(DEFAULT_CATEGORY_ICONS.vegetable);
            }
        }
    };

    const loadAllIcons = async () => {
        try {
            const icons = await getAllIcons();
            setAllIcons(icons);
        } catch (error) {
            console.error('Failed to load icons:', error);
            // Fallback to base icons only
            const fallbackIcons: IconData[] = DEFAULT_FOOD_ICONS.map((icon: any) => ({
                key: icon.id,
                label: icon.name,
                icon: () => <div>Icon</div>,
                isCustom: false,
                svg: icon.svgContent
            }));
            setAllIcons(fallbackIcons);
        }
    };

    // Initialize selectedIconKey
    useEffect(() => {
        setSelectedIconKey(DEFAULT_CATEGORY_ICONS.vegetable);
    }, []);
    // Load preview icon data when image mode or selected icon changes
    useEffect(() => {
        const loadPreviewIcon = async () => {
            const currentImg = form.watch('img');
            if (imageMode === 'icon' && currentImg?.mimeType === 'image/icon') {
                const iconKey = currentImg.fileName.replace('icon:', '') as FoodIconKey;
                const icon = await getIconDataByKey(iconKey);
                if (icon) {
                    setPreviewIconData(icon);
                }
            } else {
                setPreviewIconData(undefined);
            }
        };
        loadPreviewIcon();
    }, [imageMode, form.watch('img')]);
    const [open, setOpen] = useState(false)

    // Initialize form with initial data when editing
    useEffect(() => {
        if (initialData) {
            if (mode === 'edit') {
                // When editing, always start with manual mode to show all fields
                setInputMode('manual');
                form.reset({
                    name: initialData.name,
                    category: initialData.category,
                    quantity: initialData.quantity,
                    perOptQuantity: initialData.perOptQuantity || 1,
                    unit: initialData.unit,
                    expirationDays: initialData.expirationDays || 1,
                    img: initialData.img || defaultImg,
                    price: initialData.price || 0,
                    position: initialData.position || '',
                    dateFrom: initialData.dateFrom || new Date(),
                    iconColor: (initialData as any).iconColor || '#db2777',
                });

                // Determine if initial data has a custom image or icon
                if (initialData.img) {
                    if (initialData.img.mimeType === 'image/icon') {
                        setImageMode('icon');
                        setSelectedIconKey(initialData.img.fileName.replace('icon:', '') as FoodIconKey);
                        setIconColor(initialData.iconColor || '#db2777');
                    } else {
                        setImageMode('upload');
                    }
                }
                // Set icon color if present in initialData (optional: expects initialData.iconColor)
                if ((initialData as any).iconColor) {
                    setIconColor((initialData as any).iconColor);
                } else {
                    setIconColor('#db2777');
                }
            }
        }
    }, [initialData, mode, form]);

    const handleInputModeChange = (newMode: string) => {
        const mode = newMode as InputMode;
        setInputMode(mode);
        if (mode === 'photo') {
            form.reset(defaultFormData);
            setImageMode('upload');
            setRecognizedItems([]);
        } else if (mode === 'manual') {
            const currentImg = form.getValues('img');
            if (!currentImg) {
                form.setValue('img', defaultImg);
                setImageMode('icon');
                setIconColor('#db2777');
            }
        }
    };

    const handleImageModeChange = (mode: ImageSelectionMode) => {
        setImageMode(mode);
        if (mode === 'icon') {
            form.setValue('img', defaultImg);
            // setSelectedIconKey(DEFAULT_CATEGORY_ICONS.vegetable);
            setIconColor('#db2777');
        } else {
            form.setValue('img', {
                id: '',
                fileName: '',
                mimeType: '',
                size: 0,
                data: ''
            });
        }
    };

    const handleIconSelect = (iconKey: FoodIconKey) => {
        setSelectedIconKey(iconKey);
        form.setValue('img', {
            id: '',
            fileName: `icon:${iconKey}`,
            mimeType: 'image/icon',
            size: 0,
            data: `${iconKey}`
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create a local preview URL so the image shows immediately
        const localPreviewUrl = URL.createObjectURL(file);

        const result = await uploadImage(file);
        if (result.success) {
            form.setValue('img', {
                id: 'local',
                fileName: result.imageUrl || file.name,
                mimeType: file.type || 'image/jpeg',
                size: file.size || 0,
                data: localPreviewUrl
            });

            if (result.inventoryItems && result.inventoryItems.length > 0) {
                const processedItems = result.inventoryItems.map(item => ({
                    action: 'add',
                    table: 'inventory',
                    entity: item.name,
                    quantity: item.quantity || 1,
                    perOptQuantity: item.perOptQuantity || 1,
                    unit: item.unit || 'pcs',
                    description: item.category || 'other',
                    expirationDays: item.expiration_days || 0
                }));
                setRecognizedItems(processedItems);
            } else {
                setRecognizedItems([]);
                alert(t('inventory.noItemsRecognized') || 'No items were recognized in the image. Please try again or add items manually.');
            }
        } else {
            alert(result.error || t('chat.uploadError'));
        }

        e.target.value = '';
    };

    const onSubmit = (data: FormData) => {
        if (mode === 'edit' && onEdit && initialData) {
            onEdit({ ...initialData, ...data, iconColor });
            toast.success(t('common.success'));
        } else {
            if (inputMode === 'photo') {
                recognizedItems.forEach(item => {
                    const inventoryItem: InventoryCreate = {
                        name: item.entity,
                        category: categories[0].id || '',
                        quantity: item.quantity || 1,
                        perOptQuantity: item.perOptQuantity || 1,
                        unit: item.unit || 'pcs',
                        expirationDays: item.expirationDays || 0,
                        img: form.getValues('img') || {
                            id: '',
                            fileName: '',
                            mimeType: '',
                            size: 0,
                            data: ''
                        },
                        price: 0,
                        position: '',
                        dateFrom: data.dateFrom || new Date(),
                        iconColor,
                    };
                    onAdd(inventoryItem);
                });
                form.reset(defaultFormData);
                setRecognizedItems([]);
                toast.success(t('common.success'));
            } else {
                onAdd({ ...data, dateFrom: data.dateFrom, iconColor });
                form.reset(defaultFormData);
                setSelectedIconKey(DEFAULT_CATEGORY_ICONS.vegetable);
                setImageMode('icon');
                toast.success(t('common.success'));
            }
        }
    };

    const handlePhotoSubmit = () => {
        // Bypass form schema validation in photo mode
        const currentValues = form.getValues() as FormData;
        onSubmit(currentValues);
    };

    const renderPhotoMode = () => {
        const currentImg = form.watch('img');

        return (
            <div className="space-y-6">
                <div className="text-center flex-shrink-0">
                    <div className="flex flex-col items-center gap-4">
                        {(currentImg && currentImg.mimeType && currentImg.mimeType !== 'image/icon' && currentImg.data) ? (
                            <ChatImage
                                src={currentImg.data}
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
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${isMobile
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
                    </div>
                </div>

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

        if (imageMode === 'icon' && currentImg?.mimeType === 'image/icon') {
            if (previewIconData) {
                const IconComponent = previewIconData.icon;
                return (
                    <div className="flex items-center justify-center w-16 h-16 bg-pink-100 rounded-lg border-2 border-pink-200">
                        <IconComponent className="w-8 h-8" style={{ color: iconColor }} />
                    </div>
                );
            }
        } else if (
            currentImg &&
            currentImg.mimeType &&
            currentImg.mimeType.startsWith('image/') &&
            currentImg.mimeType !== 'image/icon'
        ) {
            return (
                <ChatImage
                    src={currentImg.data}
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
                        <FormLabel>{t('inventory.name')}</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
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
                                    min={0}
                                    step={1}
                                    precision={1}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>{t('inventory.category')}</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                loadIconsByCategory(value);
                            }} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('inventory.category')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id || ''}>
                                            {cat.displayName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
            </div>

            <div>
                <FormField
                    control={form.control}
                    name="img"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>{t('inventory.image')}</FormLabel>
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => handleImageModeChange('icon')}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${imageMode === 'icon'
                                        ? 'bg-pink-100 border-pink-300 text-pink-700'
                                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Palette className="w-4 h-4" />
                                    <span className="text-sm font-medium">{t('navigation.icons')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleImageModeChange('upload')}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${imageMode === 'upload'
                                        ? 'bg-pink-100 border-pink-300 text-pink-700'
                                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm font-medium">{t('inventory.uploadImage')}</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                {renderIconPreview()}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">
                                        {imageMode === 'icon'
                                            ? t('inventory.chooseIcon')
                                            : t('inventory.uploadCustom')
                                        }
                                    </p>

                                    {imageMode === 'icon' && (
                                        <div className="flex items-center gap-2">
                                            <Select value={selectedIconKey} onValueChange={handleIconSelect}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue>
                                                        <div className="flex items-center gap-2">
                                                            {selectedIconData && renderIcon(selectedIconData, "w-4 h-4", iconColor)}
                                                            <span>{selectedIconData?.label}</span>
                                                        </div>
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allIcons.map((iconData) => {
                                                        return (
                                                            <SelectItem key={iconData.key} value={iconData.key}>
                                                                <div className="flex items-center gap-2">
                                                                    {renderIcon(iconData, "w-4 h-4", iconColor)}
                                                                    <span>{iconData.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <div className="mt-2 flex items-center gap-2">
                                                <label htmlFor="icon-color-picker" className="text-sm text-gray-600">{t('inventory.iconColor') || 'Icon Color'}:</label>
                                                <input
                                                    id="icon-color-picker"
                                                    type="color"
                                                    value={iconColor}
                                                    onChange={e => setIconColor(e.target.value)}
                                                    className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer"
                                                    style={{ background: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    )}

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
                        </FormItem>
                    )}
                />


            </div>

            <div className="flex gap-2">
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>{t('inventory.unit')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('inventory.unit')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {units.map(u => (
                                        <SelectItem key={u} value={u}>{u}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
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
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex gap-2">
                <FormField
                    control={form.control}
                    name="dateFrom"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>{t('inventory.startDate')}</FormLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "MM-dd-yyyy")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            field.onChange(date)
                                            setOpen(false)
                                        }}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="expirationDays"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>{t('inventory.expiryDays')}</FormLabel>
                            <FormControl>
                                <Stepper value={field.value} onChange={field.onChange} min={-1} max={1000} step={1} precision={0} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

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
                    </FormItem>
                )}
            />
            <Collapsible>
                <CollapsibleTrigger>
                    <FormLabel>{t('common.more')}</FormLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <FormField
                        control={form.control}
                        name="perOptQuantity"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>{t('inventory.perOptQuantity')}</FormLabel>
                                <FormControl>
                                    <Stepper
                                        value={field.value}
                                        onChange={field.onChange}
                                        min={0}
                                        step={1}
                                        precision={2}
                                    />
                                </FormControl>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('inventory.perOptQuantityDesc')}
                                </p>
                            </FormItem>
                        )}
                    />
                </CollapsibleContent>
            </Collapsible>
        </div >
    );

    const selectedIconData = allIcons.find(icon => icon.key === selectedIconKey);

    // Refresh icons when this component receives focus (in case icons were added from another tab)
    useEffect(() => {
        const handleFocus = () => {
            loadAllIcons();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Helper component to render icon (custom SVG or Lucide React icon)
    const renderIcon = (iconData: IconData, className: string = "w-4 h-4", color?: string) => {
        if (iconData.isCustom && iconData.svg) {
            // For custom SVG icons
            let modifiedSvg = iconData.svg;
            if (color && color !== '#000000') {
                modifiedSvg = iconData.svg.replace(/fill="[^"]*"/g, `fill="${color}"`);
                modifiedSvg = modifiedSvg.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
            }
            return (
                <div
                    className={className}
                    dangerouslySetInnerHTML={{ __html: modifiedSvg }}
                />
            );
        } else {
            // console.log(iconData)
            // For Lucide React icons
            const IconComponent = iconData.icon;
            return <IconComponent className={className} style={{ color }} />;
        }
    };

    return (
        <>
            <Toaster />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    Object.entries(errors).forEach(([fieldName, error]) => {
                        toast.error(`${error?.message}`, {
                            duration: 4000,
                            position: 'top-right',
                        });
                    });
                })} onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                      e.preventDefault();
                    }
                  }} className="flex flex-col">
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
                            {inputMode === 'photo' ? (
                                <Button
                                    type="button"
                                    onClick={handlePhotoSubmit}
                                    disabled={isUploading || recognizedItems.length === 0}
                                    className={`btn-cute flex-col mt-4 items-center ${!form.watch('img') ? 'hidden' : ''}`}
                                >
                                    {isUploading ? t('chat.uploading') : t('common.save')}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isUploading}
                                    className="btn-cute flex-col mt-4 items-center"
                                >
                                    {isUploading ? t('chat.uploading') : t('common.save')}
                                </Button>
                            )}
                        </Tabs>
                    ) : (
                        <div className="space-y-6">
                            {renderManualMode()}

                            <Button
                                type="submit"
                                disabled={isUploading}
                                className="btn-cute bg-pink-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                variant={isUploading ? 'default' : 'outline'}>
                                {isUploading ? t('chat.uploading') : t('common.save')}
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </>
    );
};

export default AddInventoryForm;