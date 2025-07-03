'use client';

import { useState, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { Plus, Edit, Trash2, Filter, Search, ChefHat, Sparkles } from 'lucide-react';
import { RootState } from '../../store/store';
import { InventoryItem, removeInventoryItem } from '../../store/slices/foodItemsSlice';
import { format, isBefore, addDays } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { ReduxProvider } from '@/app/providers/ReduxProvider';

const InventoryPageContent: React.FC = memo(() => {
  const locale = useLocale();
  const t = useTranslations();
  const dispatch = useDispatch();
  const inventoryItems = useSelector((state: RootState) => state.inventoryItems.items);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const categories = ['all', 'vegetable', 'dairy', 'meat', 'fruit', 'grain', 'other'];

  // Filter and sort items
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
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="icon-cute">
                <ChefHat className="w-5 h-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">{t('inventory.title')}</h1>
            </div>
            <p className="text-gray-300">{t('inventory.description')}</p>
          </div>
          <div className="flex space-x-4">
            <Link 
              href={`/${locale}/inventory/add`}
              className="btn-cute"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('inventory.addItem')}
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card-cute mb-8">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="icon-cute">
                <Filter className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{t('common.filter')} & {t('common.search')}</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="all">{t('inventory.categories.all')}</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>
                      {t(`inventory.categories.${category}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="name">{t('common.sort')} {t('inventory.itemName')}</option>
                  <option value="category">{t('common.sort')} {t('inventory.category')}</option>
                  <option value="expirationDate">{t('common.sort')} {t('inventory.expiryDate')}</option>
                  <option value="dateFrom">{t('common.sort')} {t('inventory.dateAdded')}</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 font-medium"
                >
                  {sortOrder === 'asc' ? '↑ ' + t('common.ascending') : '↓ ' + t('common.descending')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="card-cute overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {t('inventory.items')} ({filteredItems.length})
              </h3>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-gray-600">{t('inventory.smartOrganization')}</span>
              </div>
            </div>
          </div>
          
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="card-cute p-8 max-w-md mx-auto">
                <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('inventory.noItems')}</h3>
                <p className="text-gray-500 mb-6">{t('inventory.tryAdjustingFilters')}</p>
                <Link href={`/${locale}/inventory/add`} className="btn-cute">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('inventory.addFirstItem')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('inventory.item')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('inventory.category')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('inventory.quantity')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('inventory.dateAdded')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('inventory.expiryDate')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item: InventoryItem) => {
                    const expirationStatus = getExpirationStatus(item.expirationDate);
                    return (
                      <tr key={item.id} className="hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                src={item.img || '/placeholder-food.jpg'}
                                alt={item.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expirationStatus.bgColor} ${expirationStatus.color}`}>
                            {t(`inventory.categories.${item.category}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(item.dateFrom), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expirationStatus.bgColor} ${expirationStatus.color}`}>
                            {item.expirationDate ? format(new Date(item.expirationDate), 'MMM dd, yyyy') : t('inventory.noDate')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {/* Handle edit */}}
                              className="text-pink-600 hover:text-pink-900 transition-colors duration-200"
                              title={t('common.edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              title={t('common.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
});

export default function InventoryPage() {
  return (
    <ReduxProvider>
      <InventoryPageContent />
    </ReduxProvider>
  );
} 