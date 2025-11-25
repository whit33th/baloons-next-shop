const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number) =>
  currencyFormatter.format(value);

const currencyFormatters = new Map<string, Intl.NumberFormat>();

export const formatCurrencyDynamic = (value: number, currency?: string) => {
  const code = (currency ?? "EUR").toUpperCase();
  let formatter = currencyFormatters.get(code);
  if (!formatter) {
    formatter = new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
    });
    currencyFormatters.set(code, formatter);
  }

  return formatter.format(value);
};

/**
 * Converts next-intl locale code to Intl locale code
 */
export const getIntlLocale = (locale: string): string => {
  const localeMap: Record<string, string> = {
    de: "de-AT",
    ru: "ru-RU",
    uk: "uk-UA",
    en: "en-US",
  };
  return localeMap[locale] || locale || "en-US";
};

export const formatDateTime = (timestamp: number, locale: string = "en-US") => {
  const localeCode = getIntlLocale(locale);

  return new Date(timestamp).toLocaleString(localeCode, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
