'use client';

import { FC, useEffect, useRef, useState, memo } from 'react';
import Navigation from '@/shared/components/Navigation';
import { useAuth } from '@/shared/services/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Inventory } from '@/shared/entities/inventory';
import { useTranslations } from 'next-intl';
import { ReduxProvider } from '@/shared/providers/ReduxProvider';
import { Plus as LucidePlus, ChefHat, MessageCircle, Search, XIcon } from 'lucide-react';
import { categories } from '@/shared/constants/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import AddInventoryForm from '@/app/[locale]/inventory/components/AddForm';
import ChatWindow from '@/shared/components/ChatWindow';
import Footer from '@/shared/components/Footer';
import { guestModeService } from '@/shared/services/GuestModeService';
import FoodCard from '../../inventory/components/FoodCard';
import { InventoryCreate } from '@/app/[locale]/inventory/types/interfaces';

type ChatMessage = { text: string; role: 'user' | 'bot' };

const convertInventoryCreateToInventory = (item: InventoryCreate): Omit<Inventory, 'id' | 'createTime' | 'updateTime'> => {
    return {
        name: item.name,
        img: item.img || '',
        expirationDate: item.expirationDate || '',
        quantity: item.quantity,
        originalQuantity: item.quantity,
        unit: item.unit,
        price: item.price,
        position: item.position,
        category: item.category,
        dateFrom: item.dateFrom || new Date().toISOString(),
        createdBy: 'guest',
        updatedBy: 'guest'
    };
};

const HomePageContainer: FC = memo(function HomePageContainer() {
    const { isGuestMode, enterGuestMode, isAuthenticated } = useAuth();
    const [inventorys, setInventorys] = useState<Inventory[]>([]);
    const t = useTranslations();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy] = useState('name');
    const [sortOrder] = useState<'asc' | 'desc'>('asc');
    const [isAddOpen, setIsAddOpen] = useState(false);

    const chatRef = useRef<HTMLDivElement>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const handleSendMessage = (msg: string) => {
        if (msg.trim()) {
            setChatMessages(prev => [...prev, { text: msg, role: 'user' }]);
            // Demo: auto-bot reply after 0.5s
            setTimeout(() => {
                setChatMessages(prev => [...prev, { text: `Echo: ${msg}`, role: 'bot' }]);
            }, 500);
        }
    };

    useEffect(() => {
        
        if (!isAuthenticated && !isGuestMode) {
            enterGuestMode();
        }
    }, [isGuestMode]);
    // 2. Fetch inventory when mode is ready
    useEffect(() => {
        if (isAuthenticated || isGuestMode) {
            getInventoryItems();
        }
    }, [isGuestMode]);
    const filteredItems = inventorys
        .filter((item: Inventory) => {
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
            guestModeService.deleteInventoryItem(id);
            getInventoryItems();
        }
    };

    const handleEdit = (updatedItem: Inventory) => {
        guestModeService.updateInventoryItem(updatedItem.id, updatedItem);
        getInventoryItems();
    };

    const getInventoryItems = async () => {
        if (isAuthenticated) {
            // TODO: get inventory items from cloud
            // const items = await guestModeService.getInventoryItems();
            // setInventory(items);
        } else {
            const items = await guestModeService.getInventoryItems();
            console.log('items', items);
            setInventorys(items);
        }
    };

    return (
        <div className="min-h-[calc(100vh-66px)] bg-pink-50 pb-12">
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
                {/* Side by side layout for items and chat */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="card-cute overflow-hidden min-h-[72vh]">
                            <div className="px-6 pt-4">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        {t('inventory.items')} ({filteredItems.length})
                                    </h3>

                                    <div className="flex items-center gap-3">
                                        {/* Search Icon & Input */}
                                        <div className="relative flex items-center">
                                            <button
                                                className="p-2 rounded-full hover:bg-pink-100 transition"
                                                onClick={() => setIsSearchOpen(v => !v)}
                                                aria-label="Search"
                                            >
                                                <Search className="w-5 h-5 text-pink-500" />
                                            </button>
                                            <input
                                                type="text"
                                                placeholder={t('common.search')}
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className={`ml-2 px-3 py-2 rounded-xl border border-pink-300 focus:border-pink-500 focus:outline-none ${isSearchOpen ? 'w-40 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
                                                style={{ minWidth: isSearchOpen ? '8rem' : 0 }}
                                            />
                                        </div>
                                        
                                        {/* Add Button */}
                                        {filteredItems.length > 0 && (
                                            <button onClick={() => setIsAddOpen(true)} className="btn-cute flex items-center">
                                                <LucidePlus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {filteredItems.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <ChefHat className="w-16 h-16 text-gray-400 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('inventory.noItems')}</h3>
                                    <p className="text-gray-500 mb-6">{t('inventory.tryAdjustingFilters')}</p>
                                    <button
                                        onClick={() => setIsAddOpen(true)}
                                        className="btn-cute flex-col items-center"
                                    >
                                        <span className="flex justify-center w-full">
                                            <LucidePlus className="w-6 h-6" />
                                        </span>
                                        {t('inventory.addFirstItem')}
                                    </button>
                                </div>
                            ) : (
                                categoryFilter === 'all' ? (
                                    <div className="flex flex-col gap-4 p-4">
                                        {categories.map(cat => {
                                            const itemsInCategory = filteredItems.filter(item => item.category === cat);
                                            if (itemsInCategory.length === 0) return null;
                                            return (
                                                <div key={cat} className="flex flex-col gap-2">
                                                    <div className="font-bold text-pink-600 text-lg">
                                                        {t(`inventory.categories.${cat}`)}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        {itemsInCategory.map((item: Inventory) => (
                                                            <FoodCard
                                                                key={item.id}
                                                                item={item}
                                                                onClick={(selectedItem) => {
                                                                    console.log('Selected item for recipe:', selectedItem.name);
                                                                }}
                                                                onDelete={handleDelete}
                                                                onEdit={handleEdit}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-4 p-4">
                                        {filteredItems.map((item: Inventory) => (
                                            <FoodCard
                                                key={item.id}
                                                item={item}
                                                onClick={(selectedItem) => {
                                                    console.log('Selected item for recipe:', selectedItem.name);
                                                }}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                            />
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    {isChatOpen && (
                        <div ref={chatRef} className="w-full lg:w-96 max-w-full">
                            <ChatWindow 
                                onClose={() => setIsChatOpen(false)}
                                messages={chatMessages}
                                onSend={handleSendMessage}
                            />
                        </div>
                    )}
                </div>
            </main>
            {/* Floating Chat Button */}
            {!isChatOpen && <button
                type="button"
                className="fixed bottom-18 right-[-20px] btn-cute shadow-2xl z-50"
                onClick={() => {
                    setIsChatOpen(true);
                    setTimeout(() => {
                        chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        //  focus on the chat input
                        chatRef.current?.querySelector('input')?.focus();
                    }, 100);
                }}
            >
                <MessageCircle className="w-5 h-5 mr-2" />
            </button>}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-md overflow-y-auto pb-6" showCloseButton={false}>
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
                            const convertedItem = convertInventoryCreateToInventory(item);
                            guestModeService.addInventoryItem(convertedItem);
                            setIsAddOpen(false);
                            getInventoryItems();
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
            <Footer/>
        </ReduxProvider>
    );
}
