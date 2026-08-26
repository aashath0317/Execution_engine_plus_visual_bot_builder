import React, { createContext, useState, useContext, useEffect } from 'react';
import API_BASE_URL from '../config';
import { getToken } from '../utils/token';


const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
    // Default to false (Live Mode), but check localStorage first
    const [isPaperTrading, setIsPaperTrading] = useState(() => {
        const saved = localStorage.getItem('isPaperTrading');
        return saved === 'true';
    });

    // Toggle function
    const togglePaperTrading = (mode) => {
        setIsPaperTrading(mode);
        localStorage.setItem('isPaperTrading', mode);
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [exchangeFilter, setExchangeFilter] = useState(() => localStorage.getItem('globalExchangeFilter') || 'ALL');

    useEffect(() => {
        localStorage.setItem('globalExchangeFilter', exchangeFilter);
    }, [exchangeFilter]);

    // --- Connected Exchanges Logic ---
    const [connectedExchanges, setConnectedExchanges] = useState([]);

    const [hasFetchedExchanges, setHasFetchedExchanges] = useState(false);
    const location = typeof window !== 'undefined' ? window.location : null; // Safe check for location

    const fetchConnectedExchanges = async () => {
        try {
            const token = getToken();
            if (!token) return; // Skip if no token
            const res = await fetch(`${API_BASE_URL}/user/exchanges`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConnectedExchanges(data);
                setHasFetchedExchanges(true); // Mark as fetched successfully
            }
        } catch (error) {
            console.error("Failed to fetch connected exchanges:", error);
        }
    };

    // Initial fetch, also attempts to refetch on protected route transition if token is available
    useEffect(() => {
        if (!hasFetchedExchanges) {
            fetchConnectedExchanges();
        }
    }, [location?.pathname, hasFetchedExchanges]);


    return (
        <TradingContext.Provider value={{
            isPaperTrading,
            togglePaperTrading,
            searchQuery,
            setSearchQuery,
            exchangeFilter,
            setExchangeFilter,
            connectedExchanges,
            fetchConnectedExchanges
        }}>

            {children}
        </TradingContext.Provider>
    );
};

export const useTrading = () => useContext(TradingContext);