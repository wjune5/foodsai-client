'use client';

import React, { useState } from 'react';
import { ConsumptionHistory } from '@/shared/entities/inventory';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import {
  Trash2,
  Utensils,
  ChefHat,
  StickyNote,
  Clock,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

interface ConsumptionHistoryListProps {
  history: ConsumptionHistory[];
  onEdit?: (item: ConsumptionHistory) => void;
  onDelete: (item: ConsumptionHistory) => void;
}

const ConsumptionHistoryList: React.FC<ConsumptionHistoryListProps> = ({
  history,
  onDelete
}) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ConsumptionHistory | null>(null);

  const getFilteredHistory = () => {
    let filtered = history;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(item => item.consumedAt >= startDate);
    }

    return filtered.sort((a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime());
  };

  const filteredHistory = getFilteredHistory();

  const getTypeIcon = (type: 'recipe' | 'food') => {
    return type === 'recipe' ? (
      <ChefHat className="h-4 w-4" />
    ) : (
      <Utensils className="h-4 w-4" />
    );
  };

  const getTypeColor = (type: 'recipe' | 'food') => {
    return type === 'recipe' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateFilter('all');
  };

  const handleDeleteClick = (item: ConsumptionHistory) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {(searchTerm || typeFilter !== 'all' || dateFilter !== 'all') && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          {history.length === 0 ? (
            <>
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No consumption history</h3>
              <p className="text-muted-foreground">Start tracking your food and recipe consumption!</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">No consumption history matches your filters</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getTypeColor(item.type)}>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(item)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{item.itemName}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Quantity */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">
                    {item.quantity} {item.unit}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Consumed:</span>
                  <span className="font-medium">
                    {format(new Date(item.consumedAt), 'MMM dd, yyyy')}
                  </span>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <StickyNote className="h-3 w-3" />
                      <span>Notes:</span>
                    </div>
                    <p className="text-sm bg-gray-50 p-2 rounded text-gray-700 line-clamp-2">
                      {item.notes}
                    </p>
                  </div>
                )}

                {/* Created date */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Added: {format(new Date(item.createTime), 'MMM dd, yyyy HH:mm')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredHistory.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {filteredHistory.length === history.length 
            ? `${history.length} consumption record${history.length !== 1 ? 's' : ''} total`
            : `${filteredHistory.length} of ${history.length} consumption record${history.length !== 1 ? 's' : ''}`
          }
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Consumption Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this consumption record? This action cannot be undone.
            </p>
            {itemToDelete && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{itemToDelete.itemName}</p>
                <p className="text-sm text-gray-600">
                  {itemToDelete.quantity} {itemToDelete.unit} - {format(new Date(itemToDelete.consumedAt), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsumptionHistoryList;
