'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import IconForm from '../components/IconForm';

function AddIconPageContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get('id');
  const isEditing = !!editingId;

  const handleSubmit = async () => {
    router.push('/icons');
  };

  const handleCancel = () => {
    router.push('/icons');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
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

      <IconForm
        editingId={editingId}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        showCard={true}
      />
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
