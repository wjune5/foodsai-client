'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, X, Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { FOOD_ICONS } from '@/shared/constants/food-icons';
import { databaseService } from '@/shared/services/DatabaseService';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

function AddIconPageContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get('id');
  const isEditing = !!editingId;
  
  const [formData, setFormData] = useState({
    name: '',
    svgContent: '',
    category: 'other'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load icon data for editing
  useEffect(() => {
    if (isEditing && editingId) {
      loadIconData();
    }
  }, [isEditing, editingId]);

  const loadIconData = async () => {
    try {
      setIsLoading(true);
      const icon = await databaseService.getCustomIcon(editingId!);
      if (icon) {
        setFormData({
          name: icon.name,
          svgContent: icon.svgContent,
          category: icon.category
        });
      } else {
        toast.error(t('errors.notFound'));
        router.push('/icons');
      }
    } catch (error) {
      console.error('Failed to load icon:', error);
      toast.error(t('errors.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Validate SVG content
  const validateSVG = (svgContent: string): boolean => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      return !parseError && doc.documentElement.tagName.toLowerCase() === 'svg';
    } catch {
      return false;
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/svg+xml') {
      toast.error(t('icons.selectSvgFile'));
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      toast.error(t('icons.svgTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target?.result as string;
      if (validateSVG(svgContent)) {
        setFormData(prev => ({ ...prev, svgContent }));
      } else {
        toast.error(t('icons.invalidSvgFormat'));
      }
    };
    reader.readAsText(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.svgContent) {
      toast.error(t('icons.fillAllFields'));
      return;
    }

    if (!validateSVG(formData.svgContent)) {
      toast.error(t('icons.invalidSvg'));
      return;
    }

    try {
      setIsSaving(true);
      
      if (isEditing) {
        await databaseService.updateCustomIcon(editingId!, {
          name: formData.name,
          svgContent: formData.svgContent,
          category: formData.category
        });
        toast.success(t('icons.updated'));
      } else {
        await databaseService.addCustomIcon({
          id: '',
          name: formData.name,
          svgContent: formData.svgContent,
          category: formData.category,
          builtIn: false,
          isActive: true
        });
        toast.success(t('icons.created'));
      }
      
      router.push('/icons');
    } catch (error) {
      console.error('Failed to save icon:', error);
      toast.error(t('errors.serverError'));
    } finally {
      setIsSaving(false);
    }
  };

  // Render SVG preview
  const renderSvgPreview = (svg: string) => {
    return (
      <div className="w-16 h-16 flex items-center justify-center border rounded-lg bg-gray-50 overflow-hidden">
        <div 
          className="w-full h-full flex items-center justify-center svg-container"
          dangerouslySetInnerHTML={{ 
            __html: svg.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"')
          }} 
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <div className="text-lg">{t('common.loading')}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <style jsx>{`
        .svg-container svg {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
        }
      `}</style>
      <Toaster position="top-right" />
      
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/icons')}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? t('icons.editIcon') : t('icons.addIcon')}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? t('icons.editIcon') : t('icons.addIcon')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="icon-name">{t('icons.iconLabel')} *</Label>
              <Input
                id="icon-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('icons.enterIconName')}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="icon-category">{t('icons.iconCategory')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(FOOD_ICONS).map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="svg-upload">{t('icons.svgFile')} *</Label>
              <div className="mt-1 space-y-2">
                <input
                  id="svg-upload"
                  type="file"
                  accept=".svg"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500">
                  {t('icons.uploadSvg')}
                </p>
              </div>
            </div>

            {formData.svgContent && (
              <div>
                <Label>{t('icons.preview')}</Label>
                <div className="mt-2 p-4 border rounded-lg flex items-center justify-center bg-gray-50">
                  {renderSvgPreview(formData.svgContent)}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/icons')}
                disabled={isSaving}
              >
                {t('icons.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || !formData.name || !formData.svgContent}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving 
                  ? t('common.saving') 
                  : isEditing 
                    ? t('icons.update') 
                    : t('icons.create')
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AddIconPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    }>
      <AddIconPageContent />
    </Suspense>
  );
}
