'use client';

import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { currencies, countries, formatPrice, convertPrice } from '@/lib/currency';

interface CurrencySelectorProps {
  selectedCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
  showPrice?: number; // INR price to display in selected currency
  className?: string;
}

export default function CurrencySelector({
  selectedCurrency = 'INR',
  onCurrencyChange,
  showPrice,
  className = '',
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencySelect = (currencyCode: string) => {
    onCurrencyChange?.(currencyCode);
    setIsOpen(false);
  };

  const currentCurrency = currencies[selectedCurrency] || currencies.INR;
  const displayedPrice = showPrice !== undefined 
    ? formatPrice(convertPrice(showPrice, selectedCurrency), selectedCurrency)
    : null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-teal-800 transition text-sm"
      >
        <Globe className="h-4 w-4 text-zinc-400" />
        <span className="text-zinc-300">{currentCurrency.symbol}</span>
        <span className="text-zinc-400">{selectedCurrency}</span>
        {displayedPrice && (
          <span className="text-zinc-300 font-bold">{displayedPrice}</span>
        )}
        <ChevronDown className="h-4 w-4 text-zinc-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-zinc-500 px-3 py-2 font-bold uppercase">
                Select Currency
              </div>
              {Object.entries(currencies).map(([code, currency]) => (
                <button
                  key={code}
                  onClick={() => handleCurrencySelect(code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-sm ${
                    selectedCurrency === code
                      ? 'bg-teal-900/30 text-teal-300 border border-teal-800'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{currency.symbol}</span>
                    <div className="text-left">
                      <div className="font-medium">{currency.name}</div>
                      <div className="text-xs text-zinc-500">{code}</div>
                    </div>
                  </div>
                  {selectedCurrency === code && (
                    <div className="w-2 h-2 bg-teal-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
