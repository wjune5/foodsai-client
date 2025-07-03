'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from '@/shared/components/Footer';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import Link from 'next/link';
import { Plus, Utensils, Calendar, BarChart3, Save, Sparkles, ChefHat, Heart } from 'lucide-react';
import FoodCard from '@/app/[locale]/inventory/components/FoodCard';
import { useAuth } from '@/shared/services/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Inventory } from '@/app/[locale]/inventory/types/interfaces';
import { useTranslations, useLocale } from 'next-intl';

export default function HomePageContainer() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { completeAuth } = useAuth();
    const exchangedRef = useRef(false);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const locale = useLocale();
    const t = useTranslations();

    console.log("Calling:", process.env.NEXT_PUBLIC_API_BASE_URL + "/inventory");

    useEffect(() => {
        // fetch('/inventory')
        //     .then((res) => {
        //         if (!res.ok) {
        //             throw new Error(`HTTP error! status: ${res.status}`);
        //         }
        //         return res.json();
        //     })
        const state = searchParams.get('state');
        if (state && !exchangedRef.current) {
            exchangedRef.current = true;
            fetch(`/api/auth/exchange-token?state=${state}`)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(async (data) => {
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    const user = data.data.user;
                    console.log('Raw user from backend:', user);

                    // map to the frontend needed structure
                    const mappedUser = {
                        userId: user.id,
                        userName: user.username,
                        nickName: user.nickname,
                        email: user.email,
                        avatar: user.avatar,
                    };
                    console.log('Mapped user for setAuth:', mappedUser);
                    const authParams: Record<string, unknown> = {
                        token: data.data.token,
                        user: mappedUser,
                    };
                    const result = await completeAuth('token-exchange', authParams);
                    console.log('completeAuth result:', result);

                    const localUserInfo = localStorage.getItem('user_info');
                    const localToken = localStorage.getItem('token');
                    console.log('localStorage user_info:', localUserInfo);
                    console.log('localStorage token:', localToken);

                    if (result && result.success) {
                        toast(`Welcome, ${mappedUser.nickName || mappedUser.userName || mappedUser.email || 'User'}!`);
                    }
                    setTimeout(() => {
                        window.history.replaceState({}, '', window.location.pathname);
                    }, 1000);
                })
                .catch((err) => {
                    console.error('Failed to exchange token:', err);
                    toast('Login Failed');
                });
        }
    }, [searchParams, completeAuth]);

    return (
        <>
            <div className="min-h-screen">
                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center space-x-2 mb-4">
                            <div className="icon-cute float">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
                                {t('home.welcome')}
                            </h1>
                        </div>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            {t('home.description')}
                        </p>
                    </div>

                    {/* Food List */}
                    <div>
                        <h2 className="text-2xl font-semibold text-white flex items-center">
                            <ChefHat className="w-6 h-6 mr-2" />
                            {t('home.recentItems')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {inventory.length > 0 ? (
                                inventory.map((food) => (
                                    <FoodCard
                                        key={food.id}
                                        imageUrl={food.img}
                                        name={food.name}
                                        expirationDate={food.expirationDate}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <div className="card-cute p-8">
                                        <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('home.noItems')}</h3>
                                        <p className="text-gray-500 mb-6">{t('home.addFirstItem')}</p>
                                        <button
                                            onClick={() => router.push('/inventory/add')}
                                            className="btn-cute"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('home.addItem')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Food Inventory */}
                        <div className="card-cute group">
                            <div className="p-6 border-b border-white/20">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="icon-cute">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">{t('navigation.inventory')}</h3>
                                </div>
                                <p className="text-gray-600">{t('home.viewInventory')}</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <Link
                                        href="/food"
                                        className="group/item block w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-pink-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 group-hover/item:text-gray-900">{t('home.viewInventory')}</h4>
                                                <p className="text-sm text-gray-600">{t('home.viewInventory')}</p>
                                            </div>
                                            <div className="text-gray-400 group-hover/item:text-pink-500 transition-colors">
                                                <BarChart3 className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/food/add"
                                        className="group/item block w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-pink-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 group-hover/item:text-gray-900">{t('home.addItem')}</h4>
                                                <p className="text-sm text-gray-600">{t('home.addItem')}</p>
                                            </div>
                                            <div className="text-gray-400 group-hover/item:text-pink-500 transition-colors">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recipe Generator */}
                        <div className="card-cute group">
                            <div className="p-6 border-b border-white/20">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="icon-cute">
                                        <Utensils className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">{t('navigation.recipes')}</h3>
                                </div>
                                <p className="text-gray-600">{t('home.findRecipes')}</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <Link
                                        href="/recipes"
                                        className="group/item block w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-pink-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 group-hover/item:text-gray-900">{t('home.findRecipes')}</h4>
                                                <p className="text-sm text-gray-600">{t('home.findRecipes')}</p>
                                            </div>
                                            <div className="text-gray-400 group-hover/item:text-pink-500 transition-colors">
                                                <Utensils className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Floating Add Button */}
                <button
                    type="submit"
                    className="fixed bottom-6 right-6 btn-cute shadow-2xl z-50"
                    onClick={() => router.push('/inventory/add')}
                >
                    <Plus className="w-5 h-5" />
                </button>

                <Footer />
            </div>
            <Toaster />
        </>
    );
}
