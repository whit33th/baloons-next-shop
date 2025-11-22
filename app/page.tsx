import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// This page only renders when middleware doesn't catch the root path
// and will redirect them to the default locale
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}

