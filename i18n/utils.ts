import { routing } from './routing';

export function isSupportedLocale(
  value: string | null | undefined,
): value is (typeof routing)['locales'][number] {
  if (typeof value !== 'string') return false;
  const locales = routing.locales as readonly string[];
  return locales.includes(value);
}


