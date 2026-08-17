'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { detectCurrencyFromLocale } from '@/lib/currency';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState('INR');

  useEffect(() => {
    // Load from localStorage
    const savedCurrency = localStorage.getItem('circuitai-currency');
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    } else {
      // Detect from locale
      const detected = detectCurrencyFromLocale();
      setCurrencyState(detected);
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('circuitai-currency', newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
