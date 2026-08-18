export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'DKK' | 'AUD' | 'AED' | 'SGD' | 'CNY' | 'CHF' | 'SEK';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  flag: string;
}

export const currencies: Record<Currency, CurrencyInfo> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    flag: '🇮🇳',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    flag: '🇺🇸',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    flag: '🇬🇧',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    flag: '🇪🇺',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    flag: '🇨🇦',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    flag: '🇦🇺',
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    locale: 'da-DK',
    flag: '🇩🇰',
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    locale: 'ar-AE',
    flag: '🇦🇪',
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    locale: 'en-SG',
    flag: '🇸🇬',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    locale: 'zh-CN',
    flag: '🇨🇳',
  },
  CHF: {
    code: 'CHF',
    symbol: 'Fr',
    name: 'Swiss Franc',
    locale: 'de-CH',
    flag: '🇨🇭',
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    locale: 'sv-SE',
    flag: '🇸🇪',
  },
};

// Base prices in INR
const BASE_PRICES = {
  monthly: 699,
  yearly: 5999,
};

// Conversion rates (relative to INR)
const CONVERSION_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012, // 1 INR = 0.012 USD
  GBP: 0.0095, // 1 INR = 0.0095 GBP
  EUR: 0.011, // 1 INR = 0.011 EUR
  CAD: 0.016, // 1 INR = 0.016 CAD
  AUD: 0.018, // 1 INR = 0.018 AUD
  DKK: 0.082, // 1 INR = 0.082 DKK
  AED: 0.044, // 1 INR = 0.044 AED
  SGD: 0.016, // 1 INR = 0.016 SGD
  CNY: 0.087, // 1 INR = 0.087 CNY
  CHF: 0.0105, // 1 INR = 0.0105 CHF
  SEK: 0.125, // 1 INR = 0.125 SEK
};

export const convertPrice = (priceInINR: number, targetCurrency: Currency): number => {
  const rate = CONVERSION_RATES[targetCurrency];
  const converted = priceInINR * rate;
  // Round to 2 decimal places for most currencies, 0 for JPY-like currencies
  return targetCurrency === 'DKK' ? Math.round(converted) : Math.round(converted * 100) / 100;
};

export const formatPrice = (price: number, currency: Currency): string => {
  const currencyInfo = currencies[currency];
  // CNY, JPY, and similar currencies use 0 decimal places
  const noDecimals = ['CNY', 'JPY', 'DKK', 'SEK'].includes(currency);
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  }).format(price);
};

export const getPrice = (billingCycle: 'monthly' | 'yearly', currency: Currency): number => {
  const basePrice = BASE_PRICES[billingCycle];
  return convertPrice(basePrice, currency);
};

export const getFormattedPrice = (billingCycle: 'monthly' | 'yearly', currency: Currency): string => {
  const price = getPrice(billingCycle, currency);
  return formatPrice(price, currency);
};

// Detect currency from locale
export const detectCurrencyFromLocale = (locale: string): Currency => {
  const localeLower = locale.toLowerCase();
  
  if (localeLower.startsWith('en-in') || localeLower === 'hi-in') return 'INR';
  if (localeLower.startsWith('en-us')) return 'USD';
  if (localeLower.startsWith('en-gb')) return 'GBP';
  if (localeLower.startsWith('de') || localeLower.startsWith('fr') || localeLower.startsWith('it') || localeLower.startsWith('es')) return 'EUR';
  if (localeLower.startsWith('en-ca')) return 'CAD';
  if (localeLower.startsWith('en-au')) return 'AUD';
  if (localeLower.startsWith('da') || localeLower.startsWith('dk')) return 'DKK';
  if (localeLower.startsWith('ar-ae')) return 'AED';
  
  // Default to INR for unknown locales
  return 'INR';
};

// Get currency list for selector
export const getCurrencyList = (): CurrencyInfo[] => {
  return Object.values(currencies);
};
