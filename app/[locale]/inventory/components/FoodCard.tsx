import React from 'react';
import { differenceInDays } from 'date-fns';
import { Clock, AlertTriangle } from 'lucide-react';

type FoodCardProps = {
  imageUrl: string;
  name: string;
  expirationDate: string; // in ISO format or any string
};

const FoodCard: React.FC<FoodCardProps> = ({ imageUrl, name, expirationDate }) => {
  const daysLeft = differenceInDays(new Date(expirationDate), new Date());
  
  const getStatusColor = (days: number) => {
    if (days < 0) return 'bg-red-500 text-white';
    if (days <= 2) return 'bg-orange-500 text-white';
    if (days <= 7) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getStatusIcon = (days: number) => {
    if (days < 0) return <AlertTriangle className="w-4 h-4" />;
    if (days <= 7) return <Clock className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getStatusText = (days: number) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days left`;
  };

  return (
    <div className="card-cute group relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-4 flex items-center space-x-4">
        {/* Food Image */}
        <div className="relative">
          <img
            src={imageUrl}
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white/50 group-hover:border-pink-300 transition-all duration-300"
          />
          {/* Status badge */}
          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${getStatusColor(daysLeft)} flex items-center justify-center shadow-lg`}>
            {getStatusIcon(daysLeft)}
          </div>
        </div>

        {/* Food Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-200 truncate">
            {name}
          </h3>
          <p className={`text-sm font-medium ${getStatusColor(daysLeft).replace('bg-', 'text-').replace(' text-white', '')} transition-colors duration-200`}>
            {getStatusText(daysLeft)}
          </p>
        </div>

        {/* Days indicator */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(daysLeft)} shadow-md`}>
          {daysLeft < 0 ? '!' : `${daysLeft}d`}
        </div>
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-pink-300/50 transition-all duration-300" />
    </div>
  );
};

export default FoodCard;
