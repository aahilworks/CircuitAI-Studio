'use client';

import { Currency, getCurrencyList } from '../currency';

interface CurrencySelectorProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export default function CurrencySelector({ currency, onCurrencyChange }: CurrencySelectorProps) {
  const currencyList = getCurrencyList();

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value as Currency)}
        className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-lg px-3 py-2 pr-8 hover:border-teal-700 focus:outline-none focus:border-teal-600 cursor-pointer"
        aria-label="Select currency"
      >
        {currencyList.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.flag} {curr.code} - {curr.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
