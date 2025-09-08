'use client';

import React from 'react';
import { Recipe } from '@/shared/entities/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Clock, 
  Users, 
  ChefHat, 
  Edit, 
  Trash2, 
  Copy,
  ImageIcon 
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onDuplicate: (recipe: Recipe) => void;
  onView: (recipe: Recipe) => void;
}

export default function RecipeCard({ 
  recipe, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onView 
}: RecipeCardProps) {
  const t = useTranslations();

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => onView(recipe)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.name}
          </CardTitle>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto sm:pointer-events-none sm:group-hover:pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(recipe);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(recipe);
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {recipe.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Recipe Image */}
        {recipe.img ? (
          <div className="w-full h-32 rounded-md bg-gray-100 mb-3 overflow-hidden">
            <img 
              src={recipe.img.data} 
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-32 rounded-md bg-gray-100 mb-3 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}

        {/* Recipe Details */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          {recipe.cookingTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookingTime} {t('recipe.minutes')}</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings}</span>
            </div>
          )}
          {recipe.difficulty && (
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <Badge 
                variant="secondary" 
                className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}
              >
                {t(`recipe.difficultyLevels.${recipe.difficulty.toLowerCase()}`)}
              </Badge>
            </div>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Ingredients Count */}
        <div className="text-xs text-muted-foreground">
          {recipe.ingredients.length} {t('recipe.ingredients').toLowerCase()} • 
          {recipe.instructions.length} {t('recipe.instructions').toLowerCase()}
        </div>

        {/* Creation Date */}
        <div className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(recipe.createTime), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
}
