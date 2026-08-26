import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';

const CACHE_KEY = 'top_gainers_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const TopGainers = () => {
    const [gainers, setGainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGainers = async () => {
            // 1. Check Cache
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        setGainers(data);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    sessionStorage.removeItem(CACHE_KEY);
                }
            }

            try {
                const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
                const res = await fetch(`${baseUrl}/user/market-top-gainers`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    // Take top 15 to ensure plenty of items for the loop
                    const slicedData = data.slice(0, 15);
                    setGainers(slicedData);

                    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                        data: slicedData,
                        timestamp: Date.now()
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch top gainers:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGainers();

        // Poll every 5 minutes
        const interval = setInterval(fetchGainers, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    if (loading) return null;
    if (gainers.length === 0) return null;

    return (
        <div className="hidden md:flex flex-1 items-center h-full ml-36 mr-44 overflow-hidden mask-image-linear min-w-0">
            {/* Fixed Label */}
            <h2 className="text-xs font-bold text-gray-400 whitespace-nowrap shrink-0 mr-4 uppercase tracking-wider">
                Top Gainers (24h):
            </h2>

            {/* Scrolling Container */}
            <div className="flex-1 relative h-full overflow-hidden group">
                <style>
                    {`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-10%); }
                    }
                    .animate-marquee {
                        animation: marquee 10s linear infinite;
                    }
                    .group:hover .animate-marquee {
                        animation-play-state: paused;
                    }
                    `}
                </style>

                {/* Fade Masks Removed for Solid Black Aesthetic */}

                <div className="flex items-center h-full animate-marquee whitespace-nowrap will-change-transform">
                    {/* Duplicate list 10x to ensure no gaps even on huge screens */}
                    {Array(10).fill(gainers).flat().map((g, i) => {
                        const coinSymbol = g.pair ? g.pair.split('/')[0].toLowerCase() : g.symbol?.replace('USDT', '').toLowerCase();

                        return (
                            <div key={`${g.symbol}-${i}`} className="flex items-center gap-3 mx-6">
                                <img
                                    src={`/icons/${coinSymbol}.png`}
                                    alt={coinSymbol}
                                    className="w-6 h-6 rounded-full bg-white p-0.5"
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.src = '/icons/btc.png'; // Fallback to BTC
                                    }}
                                />
                                <div className="flex flex-col justify-center">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">
                                        {g.pair ? g.pair.replace('/USDT', '') : g.symbol?.replace('USDT', '')}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white leading-none">
                                            ${parseFloat(g.price).toLocaleString()}
                                        </span>
                                        <span className={`text-[10px] font-bold leading-none ${g.change >= 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                            {g.change >= 0 ? '+' : ''}{parseFloat(g.change).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TopGainers;
