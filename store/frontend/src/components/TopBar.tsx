import React from 'react';
import { usePreferences, countryFlags, countryNames, allCurrencies } from '../context/PreferencesContext';

const countries = Object.entries(countryNames).map(([code, name]) => ({ code, name }));

const TopBar: React.FC = () => {
    const { country, setCountry, currency, setCurrency } = usePreferences();

    return (
        <div className="bg-[#1a1a1a] text-[#999] text-xs py-1.5 px-4">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center gap-4">
                {/* Left links */}
                <div className="hidden sm:flex items-center gap-4">
                    <span className="hover:text-white cursor-pointer transition-colors">Buyer Protection</span>
                    <span className="text-gray-700">|</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Help Center</span>
                    <span className="text-gray-700">|</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Disputes &amp; Reports</span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 ml-auto">
                    <span className="hover:text-white cursor-pointer transition-colors hidden md:block">Save More on App</span>

                    {/* Ship to */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-base leading-none">{countryFlags[country] ?? '🌐'}</span>
                        <span className="text-gray-600 hidden sm:block">Ship to:</span>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="bg-transparent border-none outline-none text-[#ccc] hover:text-white cursor-pointer text-xs"
                            style={{ WebkitAppearance: 'none' }}
                        >
                            {countries.map(({ code, name }) => (
                                <option key={code} value={code} className="bg-[#1a1a1a] text-white">
                                    {countryFlags[code]} {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <span className="text-gray-700">|</span>

                    {/* Currency */}
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-transparent border-none outline-none text-[#ccc] hover:text-white cursor-pointer text-xs"
                        style={{ WebkitAppearance: 'none' }}
                    >
                        {allCurrencies.map((cur) => (
                            <option key={cur} value={cur} className="bg-[#1a1a1a] text-white">{cur}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
