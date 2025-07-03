import createMiddleware from 'next-intl/middleware';
import { routing } from '@/shared/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|health|static|_vercel).*)',
  ],
}; 