import React from 'react';
import { usePreferences } from '../context/PreferencesContext';

const TopBar: React.FC = () => {
    const { country, setCountry, currency, setCurrency } = usePreferences();

    return (
        <div className="bg-gray-100 border-b border-gray-200 text-xs py-1.5 px-4 z-50">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center text-gray-500">
                <div className="flex space-x-4">
                    <span className="hover:text-red-500 cursor-pointer">Buyer Protection</span>
                    <span className="hover:text-red-500 cursor-pointer">Help</span>
                </div>
                <div className="flex space-x-6 items-center">
                    <span className="hover:text-red-500 cursor-pointer">Save More on App</span>
                    <div className="flex items-center space-x-1 cursor-pointer group">
                        <span className="text-gray-600">Ship to:</span>
                        <select 
                            value={country} 
                            onChange={(e) => setCountry(e.target.value)}
                            className="bg-transparent border-none appearance-none outline-none font-medium group-hover:text-red-500 cursor-pointer"
                        >
                            <option value="LK">Sri Lanka</option>
                            <option value="US">United States</option>
                            <option value="GB">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="EU">European Union</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-1 cursor-pointer group">
                        <span className="text-gray-600">Currency:</span>
                        <select 
                            value={currency} 
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-transparent border-none appearance-none outline-none font-medium group-hover:text-red-500 cursor-pointer"
                        >
                            <option value="LKR">LKR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="AUD">AUD</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
