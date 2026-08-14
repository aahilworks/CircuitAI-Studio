'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';

const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'EU', name: 'Europe', currency: 'EUR', symbol: '€' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$' },
  { code: 'AE', name: 'UAE', currency: 'AED', symbol: 'د.إ' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$' },
];

interface CountrySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCountrySelect: (country: { code: string; name: string; currency: string; symbol: string }) => void;
  currentCountry?: string;
}

export default function CountrySelector({ isOpen, onClose, onCountrySelect, currentCountry }: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState(currentCountry || 'IN');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const country = COUNTRIES.find(c => c.code === selectedCountry);
    if (country) {
      onCountrySelect(country);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-teal-950/50 border border-teal-800 flex items-center justify-center">
            <Globe className="h-5 w-5 text-teal-300" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-100">Select Your Country</h2>
            <p className="text-xs text-zinc-400">Choose your location for pricing and payment options</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => setSelectedCountry(country.code)}
              className={`w-full p-4 rounded-lg border text-left transition ${
                selectedCountry === country.code
                  ? 'border-teal-700 bg-teal-950/50 text-teal-300'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{country.name}</span>
                <span className="text-xs opacity-70">{country.currency}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 px-4 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-bold uppercase hover:border-zinc-700 hover:text-zinc-300 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-11 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
