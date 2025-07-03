'use client';

import { FC, useEffect, useRef, useState, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/shared/components/Navigation';
import { Plus, ChefHat, MessageCircle } from 'lucide-react';
import FoodCard from '@/app/[locale]/inventory/components/FoodCard';
import { useAuth } from '@/shared/services/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Inventory } from '@/app/[locale]/inventory/types/interfaces';
import { useTranslations, useLocale } from 'next-intl';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { welcomes } from '@/shared/constants/constants';
import { ReduxProvider } from '@/app/providers/ReduxProvider';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store/store';
import { InventoryItem, removeInventoryItem, addInventoryItem } from '@/app/store/slices/foodItemsSlice';
import Link from 'next/link';
import { format, isBefore, addDays } from 'date-fns';
import { Plus as LucidePlus, Edit, Trash2, Filter, Search, Sparkles, XIcon } from 'lucide-react';
import { categories } from '@/shared/constants/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import AddInventoryForm from '@/app/[locale]/inventory/components/AddForm';
import { isAuthenticated } from '@/shared/auth/utils/auth_utils';

const HomePageContainer: FC = memo(() => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { completeAuth, isGuestMode, enterGuestMode } = useAuth();
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const t = useTranslations();
    const dispatch = useDispatch();
    const inventoryItems = useSelector((state: RootState) => state.inventoryItems.items);
    const localize = useLocalizedPath();
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isAddOpen, setIsAddOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated() && !isGuestMode) {
          enterGuestMode();
        }
      }, [isGuestMode]);

    const filteredItems = inventoryItems
        .filter((item: InventoryItem) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'category':
                    comparison = a.category.localeCompare(b.category);
                    break;
                case 'expirationDate':
                    if (!a.expirationDate && !b.expirationDate) comparison = 0;
                    else if (!a.expirationDate) comparison = 1;
                    else if (!b.expirationDate) comparison = -1;
                    else comparison = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
                    break;
                case 'dateFrom':
                    comparison = new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime();
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const handleDelete = (id: string) => {
        if (confirm(t('common.confirm'))) {
            dispatch(removeInventoryItem(id));
        }
    };

    const getExpirationStatus = (expirationDate?: string) => {
        if (!expirationDate) return { status: 'no-date', color: 'text-gray-500', bgColor: 'bg-gray-100' };
        const today = new Date();
        const expDate = new Date(expirationDate);
        const threeDaysFromNow = addDays(today, 3);
        if (isBefore(expDate, today)) {
            return { status: 'expired', color: 'text-red-600', bgColor: 'bg-red-100' };
        } else if (isBefore(expDate, threeDaysFromNow)) {
            return { status: 'expiring-soon', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        } else {
            return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' };
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 pb-24">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Integrated Category Picker & Search */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    {/* Category Picker */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-4 py-2 rounded-full border-pink-400 text-sm font-medium transition ${categoryFilter === 'all' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-pink-100'}`}
                            onClick={() => setCategoryFilter('all')}
                        >
                            {t('inventory.categories.all')}
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`px-4 py-2 rounded-full border-pink-400 text-sm font-medium transition ${categoryFilter === cat ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-pink-100'}`}
                                onClick={() => setCategoryFilter(cat)}
                            >
                                {t(`inventory.categories.${cat}`)}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Items Table */}
                <div className="card-cute overflow-hidden min-h-[66.67vh]">
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-9">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {t('inventory.items')} ({filteredItems.length})
                                </h3>
                                {/* Search Icon & Input */}
                                <div className="relative flex items-center">
                                    <button
                                        className="p-2 rounded-full hover:bg-pink-100 transition"
                                        onClick={() => setIsChatOpen(v => !v)}
                                        aria-label="Search"
                                    >
                                        <Search className="w-5 h-5 text-pink-500" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder={t('common.search')}
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className={`ml-2 px-3 py-2 rounded-xl border border-pink-300 focus:border-pink-500 focus:outline-none ${isChatOpen ? 'w-40 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
                                        style={{ minWidth: isChatOpen ? '8rem' : 0 }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {filteredItems.length > 0 ? (
                                    <button onClick={() => setIsAddOpen(true)} className="btn-cute flex items-center">
                                        <LucidePlus className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <span className="text-sm text-gray-600 font-medium">
                                        {t('inventory.smartOrganization')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {filteredItems.length === 0 ? (
                        <div className="p-12 text-center">
                            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('inventory.noItems')}</h3>
                            <p className="text-gray-500 mb-6">{t('inventory.tryAdjustingFilters')}</p>
                            <button onClick={() => setIsAddOpen(true)} className="btn-cute flex-col items-center">
                                <LucidePlus className="w-6 h-6" />
                                {t('inventory.addFirstItem')}
                            </button>
                        </div>
                    ) : (
                        categoryFilter === 'all' ? (
                            <div className="flex flex-col gap-6 p-4">
                                {categories.map(cat => {
                                    const itemsInCategory = filteredItems.filter(item => item.category === cat);
                                    if (itemsInCategory.length === 0) return null;
                                    return (
                                        <div key={cat} className="flex flex-col gap-2">
                                            <div className="font-bold text-pink-600 mb-1 text-lg">
                                                {t(`inventory.categories.${cat}`)}
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                {itemsInCategory.map((item: InventoryItem) => {
                                                    const expirationStatus = getExpirationStatus(item.expirationDate);
                                                    let daysLeft = '';
                                                    let daysNum: number | null = null;
                                                    let dotColor = 'bg-green-400';
                                                    if (item.expirationDate) {
                                                        const today = new Date();
                                                        const expDate = new Date(item.expirationDate);
                                                        const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                                        if (diff < 0) {
                                                            daysLeft = '!';
                                                            dotColor = 'bg-red-500';
                                                        } else if (diff <= 3) {
                                                            daysLeft = diff.toString();
                                                            dotColor = 'bg-yellow-400';
                                                            daysNum = diff;
                                                        } else {
                                                            daysLeft = diff.toString();
                                                            dotColor = 'bg-green-400';
                                                            daysNum = diff;
                                                        }
                                                    } else {
                                                        daysLeft = '';
                                                        dotColor = 'bg-gray-400';
                                                    }
                                                    return (
                                                        <div 
                                                            key={item.id} 
                                                            className={`flex items-center gap-3 px-4 py-2 rounded-full shadow bg-white min-w-[80px] max-w-xs relative hover:bg-pink-100 transition-all duration-200 cursor-pointer`}
                                                            onClick={() => {
                                                                // Add item to recipe generation selection
                                                                // This could open a modal or add to a selected items array
                                                                console.log('Selected item for recipe:', item.name);
                                                            }}
                                                            title={`Select ${item.name} for recipe generation`}
                                                        >
                                                            <img
                                                                src={item.img || 'https://waapple.org/wp-content/uploads/2021/06/Variety_Cosmic-Crisp-transparent-658x677.png'}
                                                                alt={item.name}
                                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold truncate">{item.name}</div>
                                                            </div>
                                                            <div className={`flex items-center justify-center ml-2 rounded-full text-white font-bold text-sm h-6 w-6 ${dotColor}`}
                                                                title={daysLeft === '!' ? t('inventory.expired') : daysLeft === '' ? t('inventory.noDate') : t('inventory.daysLeft', { days: daysNum ?? 0 })}>
                                                                {daysLeft}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4 p-4">
                                {filteredItems.map((item: InventoryItem) => {
                                    const expirationStatus = getExpirationStatus(item.expirationDate);
                                    let daysLeft = '';
                                    let daysNum: number | null = null;
                                    let dotColor = 'bg-green-400';
                                    if (item.expirationDate) {
                                        const today = new Date();
                                        const expDate = new Date(item.expirationDate);
                                        const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                        if (diff < 0) {
                                            daysLeft = '!';
                                            dotColor = 'bg-red-500';
                                        } else if (diff <= 3) {
                                            daysLeft = diff.toString();
                                            dotColor = 'bg-yellow-400';
                                            daysNum = diff;
                                        } else {
                                            daysLeft = diff.toString();
                                            dotColor = 'bg-green-400';
                                            daysNum = diff;
                                        }
                                    } else {
                                        daysLeft = '';
                                        dotColor = 'bg-gray-400';
                                    }
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`flex items-center gap-3 px-4 py-2 rounded-full shadow bg-white min-w-[80px] max-w-xs relative hover:bg-pink-100 transition-all duration-200 cursor-pointer`}
                                            onClick={() => {
                                                // Add item to recipe generation selection
                                                // This could open a modal or add to a selected items array
                                                console.log('Selected item for recipe:', item.name);
                                            }}
                                            title={`Select ${item.name} for recipe generation`}
                                        >
                                            <img
                                                src={item.img || 'https://waapple.org/wp-content/uploads/2021/06/Variety_Cosmic-Crisp-transparent-658x677.png'}
                                                alt={item.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold truncate">{item.name}</div>
                                            </div>
                                            <div className={`flex items-center justify-center ml-2 rounded-full text-white font-bold text-sm h-6 w-6 ${dotColor}`}
                                                title={daysLeft === '!' ? t('inventory.expired') : daysLeft === '' ? t('inventory.noDate') : t('inventory.daysLeft', { days: daysNum ?? 0 })}>
                                                {daysLeft}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </main>
            {/* Floating Chat Button */}
            <button
                type="button"
                className="fixed btn-cute shadow-2xl z-50"
                onClick={() => alert('Open chat!')}
            >
                <MessageCircle className="w-5 h-5" />
            </button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto pb-6" showCloseButton={false}>
                    <DialogHeader className="sticky w-full top-0 bg-white z-10 pb-4 px-6 pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle>Add New Item</DialogTitle>
                            </div>
                            <button
                                onClick={() => setIsAddOpen(false)}
                                className="rounded-xs opacity-70 transition-opacity hover:opacity-100 p-1"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </DialogHeader>
                    <div className="px-6">
                        <AddInventoryForm onAdd={item => {
                            dispatch(addInventoryItem(item));
                            setIsAddOpen(false);
                        }} />
                    </div>
                </DialogContent>
            </Dialog>
            <Toaster position="top-right" />
        </div>
    );
});

export default function HomePage() {
    return (
        <ReduxProvider>
            <HomePageContainer />
        </ReduxProvider>
    );
}
