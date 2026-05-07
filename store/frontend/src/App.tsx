import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import { PreferencesProvider } from './context/PreferencesContext';
import './index.css';

/**
 * Main Application Component.
 * 
 * Configures routing and global providers.
 */
const App: React.FC = () => {
    return (
        <PreferencesProvider>
            <Router>
                <div className="app bg-gray-50 min-h-screen">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#ffffff',
                            color: '#111827',
                            border: '1px solid #e5e7eb',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                </Routes>
            </div>
        </Router>
        </PreferencesProvider>
    );
};

export default App;