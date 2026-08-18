'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, currencies, detectCurrencyFromLocale } from '../currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencyInfo: typeof currencies[Currency];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Detect currency from browser locale on first load
    const detectedCurrency = detectCurrencyFromLocale(navigator.language);
    
    // Check localStorage for saved preference
    const savedCurrency = localStorage.getItem('circuitai-currency') as Currency;
    
    if (savedCurrency && currencies[savedCurrency]) {
      setCurrencyState(savedCurrency);
    } else {
      setCurrencyState(detectedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('circuitai-currency', newCurrency);
  };

  const value = {
    currency,
    setCurrency,
    currencyInfo: currencies[currency],
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <CurrencyContext.Provider value={value}>
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
