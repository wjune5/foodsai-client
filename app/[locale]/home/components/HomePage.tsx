'use client';

import { FC, useEffect, useRef, useState, memo, useMemo } from 'react';
import Navigation from '@/shared/components/Navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { toast, Toaster } from 'sonner';
import { Category, Inventory } from '@/shared/entities/inventory';
import { useLocale, useTranslations } from 'next-intl';
import { ReduxProvider } from '@/shared/providers/ReduxProvider';
import { Plus as LucidePlus, ChefHat, MessageCircle, Search, Globe, CheckCircle } from 'lucide-react';
import ChatWindow from '@/shared/components/ChatWindow';
import Footer from '@/shared/components/Footer';
import { databaseService } from '@/shared/services/DatabaseService';
import FoodCard from '../../inventory/components/FoodCard';
import { useRouter } from 'next/navigation';
import useLocalizedPath from '@/shared/hooks/useLocalizedPath';
import { Switch } from '@/shared/components/ui/switch';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/Dialog';

type ChatMessage = { text?: string; imageUrl?: string; role: 'user' | 'bot' };

const HomePageContainer: FC = memo(function HomePageContainer() {
    const { isAuthenticated } = useAuth();
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
    const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
    const chatRef = useRef<HTMLDivElement>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const locale = useLocale();
    // Check if user has already selected a language
    useEffect(() => {
        const hasSelectedLanguage = localStorage.getItem('language-selected');
        if (!hasSelectedLanguage) {
            setShowLanguageDialog(true);
        }
    }, []);

    const handleLanguageSelect = (locale: string) => {
        localStorage.setItem('language-selected', 'true');
        setShowLanguageDialog(false);

        // Redirect to the selected language
        const currentPath = window.location.pathname;
        const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, '');
        const newPath = `/${locale}${pathWithoutLocale}`;
        router.push(newPath);
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'zh', name: '中文' }
    ];

    const handleSendMessage = (msg: string) => {
        if (msg.trim()) {
            setChatMessages(prev => [...prev, { text: msg, role: 'user' }]);
            // TODO: auto-bot reply after 0.5s
            setTimeout(() => {
                setChatMessages(prev => [...prev, { text: `Echo: ${msg}`, role: 'bot' }]);
            }, 500);
        }
    };

    const handleSendImage = (imageUrl: string) => {
        setChatMessages(prev => [...prev, { imageUrl, role: 'user' }]);
        // TODO: auto-bot reply after 0.5s
        setTimeout(() => {
            setChatMessages(prev => [...prev, { text: `I can see your image! That looks interesting.`, role: 'bot' }]);
        }, 500);
    };

    // 2. Fetch inventory when mode is ready
    useEffect(() => {
        databaseService.getCategories(locale).then(cats => {
            setCategories(cats.sort((a, b) => a.sortValue - b.sortValue));
        }).catch(error => {
            console.error('Error fetching categories:', error);
        });
        getInventoryItems();
    }, []);
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
        databaseService.deleteInventoryItem(id);
        getInventoryItems();
    };

    const handleConsume = async () => {
        const newConsumeEnabled = !consumeEnabled;
        setConsumeEnabled(newConsumeEnabled);
        
        // If turning off consume mode and we have selected items, handle the consumption
        if (!newConsumeEnabled && selectedItems.size > 0) {
            await handleBulkConsume();
        }
    };
    
    const handleConsumeChange = async (id: string, quantity: number) => {
        setSelectedItems(prev => {
            const newMap = new Map(prev);
            if (quantity > 0) {
                newMap.set(id, quantity);
            } else {
                newMap.delete(id);
            }
            return newMap;
        });
    };

    const handleBulkConsume = async () => {
        const consumptionPromises: Promise<void>[] = [];
        const itemCount = selectedItems.size;
        
        for (const [itemId, quantity] of selectedItems) {
            const item = inventorys.find(inv => inv.id === itemId);
            if (item && quantity > 0) {
                consumptionPromises.push(handleEdit(item, quantity));
            }
        }
        
        try {
            await Promise.all(consumptionPromises);
            setSelectedItems(new Map());
        } catch (error) {
            console.error('Error during bulk consumption:', error);
            toast.error(t('message.bulkConsumeError'));
        }
    };

    const clearSelection = () => {
        setSelectedItems(new Map());
    };
    const handleEdit = async (item: Inventory, quantity: number) => {
        const updated = { ...item, quantity: (item.quantity || 1) - quantity };
        if (updated.quantity > 0) {
            await databaseService.updateInventoryItem(item.id, updated);
        } else {
            await databaseService.deleteInventoryItem(item.id);
        }
        databaseService.addConsumptionHistory({
            itemId: item.id,
            quantity: quantity,
            consumedAt: new Date(),
            type: 'food'
        });
        toast.success(t('message.consumeSuccess', { name: item.name, quantity: quantity }));
        getInventoryItems();
    };

    const getInventoryItems = async () => {
        if (isAuthenticated) {
            // TODO: get inventory items from cloud
            // const items = await databaseService.getInventoryItems();
            // setInventory(items);
        } else {
            const items = await databaseService.getInventoryItems();
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
                        <Button
                            variant={categoryFilter === 'all' ? 'cute' : 'cuteOutline'}
                            size="sm"
                            onClick={() => setCategoryFilter('all')}
                        >
                            {t('inventory.categories.all')}
                        </Button>
                        {categories.map(cat => (
                            <Button
                                key={cat.id}
                                variant={categoryFilter === cat.id ? 'cute' : 'cuteOutline'}
                                size="sm"
                                onClick={() => setCategoryFilter(cat.id || '')}
                            >
                                {cat.displayName}
                            </Button>
                        ))}
                    </div>
                </div>
                {/* Side by side layout for items and chat */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="card-cute overflow-hidden min-h-[72vh]">
                            <div className="px-6 pt-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className='flex items-center justify-start gap-2'>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {t('inventory.items')} ({filteredItems.length})
                                        </h3>
                                        {/* Search Icon & Input */}
                                        <div className="relative flex items-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsSearchOpen(v => !v)}
                                                aria-label="Search"
                                            >
                                                <Search className="w-5 h-5 text-pink-500" />
                                            </Button>
                                            <Input
                                                type="text"
                                                placeholder={t('common.search')}
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className={`ml-2 px-3 py-2 rounded-xl border border-pink-300 focus:border-pink-500 focus:outline-none ${isSearchOpen ? 'w-40 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
                                                style={{ minWidth: isSearchOpen ? '8rem' : 0 }}
                                            />
                                        </div>
                                    </div>

                                    {filteredItems.length > 0 && (
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={consumeEnabled}
                                                onCheckedChange={handleConsume}
                                                showCheckIcon={true}
                                                icon={CheckCircle}
                                            />
                                            <Button 
                                                variant="cute" 
                                                size="icon"
                                                onClick={() => router.push(localize(`/inventory/add?category=${categoryFilter}`))}
                                            >
                                                <LucidePlus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {filteredItems.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <ChefHat className="w-16 h-16 text-gray-400 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('inventory.noItems')}</h3>
                                    <p className="text-gray-500 mb-6">{t('inventory.tryAdjustingFilters')}</p>
                                    <Button
                                        variant="cute"
                                        size="xl"
                                        onClick={() => router.push(localize(`/inventory/add?category=${categoryFilter}`))}
                                        className="flex-col items-center"
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
                                            const itemsInCategory = filteredItems.filter(item => item.category === cat.id);
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
                                                                    onEdit={consumeEnabled ? handleEdit : undefined}
                                                                    consumeEnabled={consumeEnabled}
                                                                    onConsume={handleConsumeChange}
                                                                    selectedQuantity={selectedItems.get(item.id) || 0}
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
                                                    onEdit={consumeEnabled ? handleEdit : undefined}
                                                    consumeEnabled={consumeEnabled}
                                                    onConsume={handleConsumeChange}
                                                    selectedQuantity={selectedItems.get(item.id) || 0}
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
            {!isChatOpen && <Button
                type="button"
                variant="cute"
                size="cuteLg"
                className="fixed bottom-18 right-[-20px] shadow-2xl z-50"
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
            </Button>}

            <Toaster />

            {/* Language Selection Dialog */}
            <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
                <DialogContent 
                    className="sm:max-w-md px-8 py-8" 
                    showCloseButton={false}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-center">
                            <Globe className="h-6 w-6 text-pink-500" />
                            Choose Your Language
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Please select your preferred language to continue
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                        {languages.map((language) => (
                            <Button
                                key={language.code}
                                variant="outline"
                                onClick={() => handleLanguageSelect(language.code)}
                                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors"
                            >
                                <span className="font-medium text-gray-900">{language.name}</span>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
});

export default function HomePage() {
    return (
        <ReduxProvider>
            <HomePageContainer />
            <Footer />
        </ReduxProvider>
    );
}
