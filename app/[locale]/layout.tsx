import { Inter, Poppins } from "next/font/google";
import "../globals.css";
import Navigation from "@/shared/components/Navigation";
import { AuthProvider } from "@/shared/context/AuthContext";
import {Locale, hasLocale, NextIntlClientProvider} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import { notFound } from "next/navigation";
import { routing } from "@/shared/i18n/routing";
import { ReactNode } from "react";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/AppSidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

type Props = {
  children: ReactNode;
  params: Promise<{locale: Locale}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata(props: Omit<Props, 'children'>) {
  const {locale} = await props.params;

  const t = await getTranslations({locale, namespace: 'LocaleLayout'});

  return {
    title: t('title')
  };
}

export default async function LocaleLayout({children, params}: Props) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);
  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased min-h-screen`}
      >
        <NextIntlClientProvider>
          <AuthProvider>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <div className="w-full">
                <Navigation />
                <div className="pt-16">
                  {children}
                </div>
              </div>
            </SidebarProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 