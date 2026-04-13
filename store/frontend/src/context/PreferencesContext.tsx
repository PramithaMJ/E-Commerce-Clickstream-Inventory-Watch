import React, { createContext, useContext, useState, ReactNode } from 'react';

// Exchange rates against USD
const exchangeRates: Record<string, number> = {
    USD: 1,
    LKR: 320.50,
    EUR: 0.92,
    GBP: 0.79,
    AUD: 1.53,
    INR: 83.20,
    JPY: 149.50,
    CAD: 1.36,
    SGD: 1.34,
    CNY: 7.24,
    AED: 3.67,
    SAR: 3.75,
};

export const currencySymbols: Record<string, string> = {
    USD: '$',
    LKR: 'Rs.',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    SGD: 'S$',
    CNY: '¥',
    AED: 'AED ',
    SAR: 'SAR ',
};

// Country → currency auto-mapping
const countryCurrencyMap: Record<string, string> = {
    US: 'USD',
    LK: 'LKR',
    GB: 'GBP',
    AU: 'AUD',
    EU: 'EUR',
    IN: 'INR',
    JP: 'JPY',
    CA: 'CAD',
    SG: 'SGD',
    CN: 'CNY',
    AE: 'AED',
    SA: 'SAR',
};

export const countryFlags: Record<string, string> = {
    US: '🇺🇸',
    LK: '🇱🇰',
    GB: '🇬🇧',
    AU: '🇦🇺',
    EU: '🇪🇺',
    IN: '🇮🇳',
    JP: '🇯🇵',
    CA: '🇨🇦',
    SG: '🇸🇬',
    CN: '🇨🇳',
    AE: '🇦🇪',
    SA: '🇸🇦',
};

export const countryNames: Record<string, string> = {
    US: 'United States',
    LK: 'Sri Lanka',
    GB: 'United Kingdom',
    AU: 'Australia',
    EU: 'European Union',
    IN: 'India',
    JP: 'Japan',
    CA: 'Canada',
    SG: 'Singapore',
    CN: 'China',
    AE: 'UAE',
    SA: 'Saudi Arabia',
};

export const allCurrencies = Object.keys(currencySymbols);

interface PreferencesContextType {
    country: string;
    setCountry: (country: string) => void;
    currency: string;
    setCurrency: (currency: string) => void;
    formatPrice: (priceInUSD: number) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [country, setCountryState] = useState('US');
    const [currency, setCurrencyState] = useState('USD');

    const setCountry = (newCountry: string) => {
        setCountryState(newCountry);
        const mapped = countryCurrencyMap[newCountry];
        if (mapped) setCurrencyState(mapped);
    };

    const setCurrency = (c: string) => setCurrencyState(c);

    const formatPrice = (priceInUSD: number): string => {
        const rate = exchangeRates[currency] ?? 1;
        const converted = priceInUSD * rate;
        const symbol = currencySymbols[currency] ?? currency + ' ';
        if (currency === 'JPY') {
            return `${symbol}${Math.round(converted).toLocaleString()}`;
        }
        return `${symbol}${converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <PreferencesContext.Provider value={{ country, setCountry, currency, setCurrency, formatPrice }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const ctx = useContext(PreferencesContext);
    if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
    return ctx;
};
