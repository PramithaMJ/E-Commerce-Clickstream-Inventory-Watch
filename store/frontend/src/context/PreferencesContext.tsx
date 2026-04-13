import React, { createContext, useContext, useState, ReactNode } from 'react';

// Hardcoded exchange rates against USD for demo
const exchangeRates: Record<string, number> = {
    USD: 1,
    LKR: 320.50,
    EUR: 0.92,
    GBP: 0.79,
    AUD: 1.53,
};

const currencySymbols: Record<string, string> = {
    USD: '$',
    LKR: 'Rs.',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
};

interface PreferencesContextType {
    country: string;
    setCountry: (country: string) => void;
    currency: string;
    setCurrency: (currency: string) => void;
    formatPrice: (priceInUSD: number) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [country, setCountry] = useState('LK');
    const [currency, setCurrency] = useState('LKR');

    const formatPrice = (priceInUSD: number) => {
        const rate = exchangeRates[currency] || 1;
        const convertedPrice = priceInUSD * rate;
        const symbol = currencySymbols[currency] || currency + ' ';
        
        return `${symbol}${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <PreferencesContext.Provider value={{ country, setCountry, currency, setCurrency, formatPrice }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
