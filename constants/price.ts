export type DeliveryCityPricing = {
  id: string;
  label: string;
  price: number;
  postalCodes?: string[];
  aliases?: string[];
  isDefault?: boolean;
};

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export const DELIVERY_CITY_PRICES: DeliveryCityPricing[] = [
  {
    id: "knittelfeld",
    label: "Knittelfeld",
    postalCodes: ["8720"],
    price: 16,
    isDefault: true,
  },
];

const CITY_LOOKUP = new Map<string, DeliveryCityPricing>();
for (const city of DELIVERY_CITY_PRICES) {
  CITY_LOOKUP.set(normalize(city.label), city);
  city.aliases?.forEach((alias) => CITY_LOOKUP.set(normalize(alias), city));
  city.postalCodes?.forEach((postal) => {
    const key = postal.trim();
    if (key) {
      CITY_LOOKUP.set(key.toLowerCase(), city);
    }
  });
}

export const DEFAULT_DELIVERY_CITY: DeliveryCityPricing | null =
  DELIVERY_CITY_PRICES.find((city) => city.isDefault) ??
  DELIVERY_CITY_PRICES[0] ??
  null;

export const DEFAULT_DELIVERY_PRICE = DEFAULT_DELIVERY_CITY?.price;

export function matchDeliveryCity(
  cityName?: string | null,
): DeliveryCityPricing | undefined {
  if (!cityName) {
    return undefined;
  }
  const normalized = normalize(cityName);
  if (!normalized) {
    return undefined;
  }
  return CITY_LOOKUP.get(normalized);
}

export function getDeliveryPriceForCity(
  cityName?: string | null,
): number | undefined {
  return matchDeliveryCity(cityName)?.price;
}
