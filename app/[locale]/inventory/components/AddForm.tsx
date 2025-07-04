import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { categories, units } from '@/shared/constants/constants';

type AddInventoryProps = {
    onAdd: (item: any) => void;
};

const AddInventoryForm: React.FC<AddInventoryProps> = ({ onAdd }) => {
    const t = useTranslations();
    const [form, setForm] = useState({
        name: '',
        category: 'vegetable',
        quantity: 1,
        unit: 'pcs',
        expirationDate: '',
        img: ''
    });
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
        onAdd({ ...form, dateFrom: new Date().toISOString() });
        setForm({ name: '', category: 'vegetable', quantity: 1, unit: 'pcs', expirationDate: '', img: '' });
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
                    <img src={form.img} alt="Preview" className="mt-2 max-h-32 object-contain border rounded" />
                )}
            </div>
            <button type="submit" className="btn-cute w-full mt-2">{t('inventory.addItem')}</button>
        </form>

    );
};

export default AddInventoryForm;