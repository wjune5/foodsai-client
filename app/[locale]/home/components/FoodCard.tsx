import React from 'react';
import { addDays, isBefore } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Inventory } from '@/shared/entities/inventory';

interface FoodCardProps {
  item: Inventory;
  onClick?: (item: Inventory) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, onClick }) => {
  const t = useTranslations();

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

  const calculateDaysLeft = (expirationDate?: string) => {
    if (!expirationDate) return { daysLeft: '', daysNum: null, dotColor: 'bg-gray-400' };
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) {
      return { daysLeft: '!', daysNum: null, dotColor: 'bg-red-500' };
    } else if (diff <= 3) {
      return { daysLeft: diff.toString(), daysNum: diff, dotColor: 'bg-yellow-400' };
    } else {
      return { daysLeft: diff.toString(), daysNum: diff, dotColor: 'bg-green-400' };
    }
  };

  const { daysLeft, daysNum, dotColor } = calculateDaysLeft(item.expirationDate);

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-2 py-1 rounded-full shadow bg-white min-w-[80px] max-w-xs relative hover:bg-pink-100 transition-all duration-200 cursor-pointer`}
      onClick={handleClick}
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
      <div 
        className={`flex items-center justify-center ml-2 rounded-full text-white font-bold text-sm h-6 w-6 ${dotColor}`}
        title={daysNum == null 
          ? t('inventory.noDate') 
          : daysNum <= 0 
            ? t('inventory.expired') 
            : t('inventory.daysLeft', { days: daysNum })}
      >
        {daysLeft}
      </div>
    </div>
  );
};

export default FoodCard; 