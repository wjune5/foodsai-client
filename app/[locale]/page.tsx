import { Suspense } from 'react';
import { Locale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import HomePageContainer from './home/components/HomePage';
import { ReduxProvider } from '../providers/ReduxProvider';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function IndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <ReduxProvider>
      <Suspense fallback={<div>{t('loading')}</div>}>
        <HomePageContainer />
      </Suspense>
    </ReduxProvider>
  );
} 