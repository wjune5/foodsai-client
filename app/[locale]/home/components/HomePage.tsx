'use client';

import { FC, useEffect, useRef, useState, memo, useMemo } from 'react';
import Navigation from '@/shared/components/Navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Category, Inventory } from '@/shared/entities/inventory';
import { useTranslations } from 'next-intl';
import { ReduxProvider } from '@/shared/providers/ReduxProvider';
import { Plus as LucidePlus, ChefHat, MessageCircle, Search, Minus } from 'lucide-react';
import ChatWindow from '@/shared/components/ChatWindow';
import Footer from '@/shared/components/Footer';
import { guestModeService } from '@/shared/services/GuestModeService';
import FoodCard from '../../inventory/components/FoodCard';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { Switch } from '@/shared/components/ui/switch';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { categories as defaultCategories } from '@/shared/constants/constants';

type ChatMessage = { text?: string; imageUrl?: string; role: 'user' | 'bot' };

const HomePageContainer: FC = memo(function HomePageContainer() {
    const { isGuestMode, isAuthenticated } = useAuth();
    const [inventorys, setInventorys] = useState<Inventory[]>([]);
    const t = useTranslations();
    const router = useRouter();
    const localize = useLocalizedPath();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy] = useState('name');
    const [sortOrder] = useState<'asc' | 'desc'>('asc');
    const [consumeEnabled, setConsumeEnabled] = useState(false)
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

    const handleSendImage = (imageUrl: string) => {
        setChatMessages(prev => [...prev, { imageUrl, role: 'user' }]);
        // Demo: auto-bot reply after 0.5s
        setTimeout(() => {
            setChatMessages(prev => [...prev, { text: `I can see your image! That looks interesting.`, role: 'bot' }]);
        }, 500);
    };
    const [categories, setCategories] = useState<Category[]>([]);

    // 2. Fetch inventory when mode is ready
    useEffect(() => {
        if (isGuestMode) {
            guestModeService.getCategories().then(cats => {
                if (cats.length === 0) {
                    defaultCategories.forEach((cat, index) => {
                        const newCat: Category = {
                            name: cat,
                            displayName: t(`inventory.categories.${cat}`),
                            sortValue: index
                        };
                        guestModeService.addCategory(newCat);
                        cats.push(newCat);
                    });
                } 
                setCategories(cats);
            });
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
                    if (!a.expirationDays && !b.expirationDays) comparison = 0;
                    else if (!a.expirationDays) comparison = 1;
                    else if (!b.expirationDays) comparison = -1;
                    else comparison = new Date(a.expirationDays).getTime() - new Date(b.expirationDays).getTime();
                    break;
                case 'dateFrom':
                    if (!a.dateFrom && !b.dateFrom) comparison = 0;
                    else if (!a.dateFrom) comparison = 1;
                    else if (!b.dateFrom) comparison = -1;
                    else comparison = new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime();
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const handleDelete = (id: string) => {
        guestModeService.deleteInventoryItem(id);
        getInventoryItems();
    };

    const handleConsume = async () => {
        setConsumeEnabled(!consumeEnabled)
    };

    const handleEdit = async (item: Inventory) => {
        const updated = { ...item, quantity: (item.quantity || 1) - 1 };
        if (updated.quantity > 0) {
            await guestModeService.updateInventoryItem(item.id, updated);
        } else {
            await guestModeService.deleteInventoryItem(item.id);
        }
        getInventoryItems();
    };

    const getInventoryItems = async () => {
        if (isAuthenticated) {
            // TODO: get inventory items from cloud
            // const items = await guestModeService.getInventoryItems();
            // setInventory(items);
        } else {
            const items = await guestModeService.getInventoryItems();
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
                                key={cat.id}
                                className={`px-4 py-2 rounded-full border-pink-400 text-sm font-medium transition ${categoryFilter === cat.name ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-pink-100'}`}
                                onClick={() => setCategoryFilter(cat.name)}
                            >
                                {cat.displayName}
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
                                            <Input
                                                type="text"
                                                placeholder={t('common.search')}
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className={`ml-2 px-3 py-2 rounded-xl border border-pink-300 focus:border-pink-500 focus:outline-none ${isSearchOpen ? 'w-40 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
                                                style={{ minWidth: isSearchOpen ? '8rem' : 0 }}
                                            />
                                        </div>
                                        {/* Consume Button */}
                                        <Switch
                                            checked={consumeEnabled}
                                            onCheckedChange={handleConsume}
                                        />
                                        {/* Add Button */}
                                        {filteredItems.length > 0 && (
                                            <button onClick={() => router.push(localize(`/inventory/add?category=${categoryFilter}`))} className="btn-cute flex items-center">
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
                                    <Button
                                        size="xl"
                                        onClick={() => router.push(localize(`/inventory/add?category=${categoryFilter}`))}
                                        className="btn-cute flex-col items-center"
                                    >
                                        <span className="flex justify-center w-full">
                                            <LucidePlus className="w-6 h-6" />
                                        </span>
                                        {t('inventory.addFirstItem')}
                                    </Button>
                                </div>
                            ) : (
                                categoryFilter === 'all' ? (
                                    <div className="flex flex-col gap-4 p-4">
                                        {categories.map(cat => {
                                            const itemsInCategory = filteredItems.filter(item => item.category === cat.name);
                                            if (itemsInCategory.length === 0) return null;
                                            return (
                                                <div key={cat.id} className="flex flex-col gap-2">
                                                    <div className="font-bold text-pink-600 text-lg">
                                                        {cat.displayName}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        {itemsInCategory.map((item: Inventory) => (
                                                            <div key={item.id} className="flex items-center">
                                                                <FoodCard
                                                                    item={item}
                                                                    onClick={(selectedItem) => {
                                                                        console.log('Selected item for recipe:', selectedItem.name);
                                                                    }}
                                                                    onDelete={handleDelete}
                                                                    onEdit={consumeEnabled?handleEdit:undefined}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-4 p-4">
                                        {filteredItems.map((item: Inventory) => (
                                            <div key={item.id} className="flex items-center">
                                                <FoodCard
                                                    item={item}
                                                    onClick={(selectedItem) => {
                                                        console.log('Selected item for recipe:', selectedItem.name);
                                                    }}
                                                    onDelete={handleDelete}
                                                    onEdit={consumeEnabled?handleEdit:undefined}
                                                />
                                            </div>
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
                                onSendImage={handleSendImage}
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
