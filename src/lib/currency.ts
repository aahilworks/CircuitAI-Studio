export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate from INR
  locale: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

export const currencies: Record<string, Currency> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rate: 1,
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 0.012, // 1 INR = 0.012 USD
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 0.011, // 1 INR = 0.011 EUR
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rate: 0.0095, // 1 INR = 0.0095 GBP
    locale: 'en-GB',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    rate: 0.018, // 1 INR = 0.018 AUD
    locale: 'en-AU',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    rate: 0.016, // 1 INR = 0.016 CAD
    locale: 'en-CA',
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    rate: 0.016, // 1 INR = 0.016 SGD
    locale: 'en-SG',
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    rate: 0.044, // 1 INR = 0.044 AED
    locale: 'ar-AE',
  },
};

export const countries: Country[] = [
  { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
  { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
  { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪' },
];

export function convertPrice(inrPrice: number, toCurrency: string): number {
  const currency = currencies[toCurrency];
  if (!currency) return inrPrice;
  
  const converted = inrPrice * currency.rate;
  return Math.round(converted * 100) / 100; // Round to 2 decimal places
}

export function formatPrice(price: number, currency: string): string {
  const currencyData = currencies[currency];
  if (!currencyData) return `${price}`;

  return new Intl.NumberFormat(currencyData.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getCurrencyByCountry(countryCode: string): string {
  const country = countries.find(c => c.code === countryCode);
  return country?.currency || 'INR';
}

export function detectCurrencyFromLocale(): string {
  if (typeof window === 'undefined') return 'INR';
  
  const locale = navigator.language || 'en-IN';
  const currencyCode = locale.split('-')[1];
  
  if (currencyCode && currencies[currencyCode]) {
    return currencyCode;
  }
  
  return 'INR';
}
