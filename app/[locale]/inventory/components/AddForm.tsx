import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { categories, units } from '@/shared/constants/constants';
import Image from 'next/image';
import { InventoryCreate } from '../types/interfaces'
import { Inventory } from '@/shared/entities/inventory';

type AddInventoryProps = {
    onAdd: (item: InventoryCreate) => void;
    onEdit?: (item: Inventory) => void;
    initialData?: Inventory;
    mode?: 'add' | 'edit';
};

const AddInventoryForm: React.FC<AddInventoryProps> = ({ onAdd, onEdit, initialData, mode = 'add' }) => {
    const t = useTranslations();
    const [form, setForm] = useState({
        name: '',
        category: 'vegetable',
        quantity: 1,
        unit: 'pcs',
        expirationDate: '',
        img: '',
        price: 0,
        position: ''
    });

    // Initialize form with initial data when editing
    useEffect(() => {
        if (initialData && mode === 'edit') {
            setForm({
                name: initialData.name,
                category: initialData.category,
                quantity: initialData.quantity,
                unit: initialData.unit,
                expirationDate: initialData.expirationDate || '',
                img: initialData.img || '',
                price: initialData.price || 0,
                position: initialData.position || ''
            });
        }
    }, [initialData, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.target.name === 'img' && e.target instanceof HTMLInputElement && e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, img: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'edit' && onEdit && initialData) {
            onEdit({ ...initialData, ...form });
        } else {
            onAdd({ ...form, dateFrom: new Date().toISOString() });
            setForm({ name: '', category: 'vegetable', quantity: 1, unit: 'pcs', expirationDate: '', img: '', price: 0, position: '' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-1 font-medium">{t('inventory.itemName')}</label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>
            <div>
                <label className="block mb-1 font-medium">{t('inventory.category')}</label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2">
                    {categories.map(cat => <option key={cat} value={cat}>{t(`inventory.categories.${cat}`)}</option>)}
                </select>
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block mb-1 font-medium">{t('inventory.quantity')}</label>
                    <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex-1">
                    <label className="block mb-1 font-medium">{t('inventory.unit')}</label>
                    <select name="unit" value={form.unit} onChange={handleChange} className="w-full border rounded px-3 py-2">
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">{t('inventory.expiryDate')}</label>
                <input name="expirationDate" type="date" value={form.expirationDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block mb-1 font-medium">{t('inventory.price')}</label>
                    <input 
                        name="price" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={form.price} 
                        onChange={handleChange} 
                        className="w-full border rounded px-3 py-2" 
                        placeholder="0.00"
                    />
                </div>
                <div className="flex-1">
                    <label className="block mb-1 font-medium">{t('inventory.position')}</label>
                    <input 
                        name="position" 
                        type="text" 
                        value={form.position} 
                        onChange={handleChange} 
                        className="w-full border rounded px-3 py-2" 
                        placeholder={t('inventory.positionPlaceholder')}
                    />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">{t('inventory.image')}</label>
                <input
                    name="img"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                />
                {form.img && (
                    <Image 
                        src={form.img} 
                        alt="Preview" 
                        width={128}
                        height={128}
                        unoptimized
                        className="mt-2 max-h-32 object-contain border rounded" 
                    />
                )}
            </div>
            <button type="submit" className="btn-cute w-full mt-2">
                {mode === 'edit' ? t('common.save') : t('inventory.addItem')}
            </button>
        </form>

    );
};

export default AddInventoryForm;