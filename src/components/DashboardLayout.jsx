import React, { useState, useEffect } from 'react';
import Dash_nav from '../pages/dashboard/Dash_nav';
import { useNavigate } from 'react-router-dom';
import CreateBotModal from '../pages/dashboard/CreateBotModal';
import LiveTicker from './LiveTicker';
import GlobalHeader from './dashboard/GlobalHeader';
import MobileGlobalHeader from './dashboard/MobileGlobalHeader';

import LoadingScreen from './LoadingScreen';
import API_BASE_URL from '../config';
import { getToken } from '../utils/token';

const DashboardLayout = ({ children, headerSlot, isLoading, fullWidth = false }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
        const saved = localStorage.getItem('sidebar_expanded');
        if (saved === null) return true;
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebar_expanded', isSidebarExpanded);
    }, [isSidebarExpanded]);
    const [isCreateBotModalOpen, setIsCreateBotModalOpen] = useState(false);
    const navigate = useNavigate();

    // Mobile View Logic
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Global Data State
    const [tickerData, setTickerData] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchGlobalData = async () => {
            // 1. Fetch Ticker Data
            try {
                const token = getToken();
                if (token) {
                    const marketRes = await fetch(`${API_BASE_URL}/user/market-top-gainers`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (marketRes.ok) {
                        const marketData = await marketRes.json();
                        if (Array.isArray(marketData) && isMounted) {
                            const formattedTicker = marketData.slice(0, 15).map(item => ({
                                pair: item.pair || item.symbol,
                                price: `$${parseFloat(item.price).toLocaleString()}`,
                                change: `${parseFloat(item.change) >= 0 ? '+' : ''}${parseFloat(item.change).toFixed(2)}%`,
                                isPositive: parseFloat(item.change) >= 0
                            }));
                            setTickerData(formattedTicker);
                        }
                    }
                }
            } catch (e) {
                console.error("Layout data fetch error:", e);
            }
        };

        fetchGlobalData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleBotSelect = (botType) => {
        setIsCreateBotModalOpen(false);
        // Navigate to deploy page for SPOT GRID, otherwise handle other bot types
        if (botType === 'SPOT GRID' || botType.toLowerCase().includes('grid')) {
            navigate('/dashboard/deploy');
        } else {
            navigate(`/configure-bot?type=${encodeURIComponent(botType)}`);
        }
    };

    return (
        <>
            <div className="flex min-h-screen bg-[#000000] font-sans text-white selection:bg-[#00FF9D] selection:text-black relative">
                {/* Background Glows Removed */}

                {/* --- GLOBAL TOP HEADER --- */}
                {isMobileView ? (
                    <MobileGlobalHeader
                        headerSlot={headerSlot}
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        onOpenCreateBot={() => setIsCreateBotModalOpen(true)}
                        isLoading={isLoading}
                        isSidebarExpanded={isSidebarExpanded}
                    />
                ) : (
                    <GlobalHeader
                        headerSlot={headerSlot}
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        onOpenCreateBot={() => setIsCreateBotModalOpen(true)}
                        isLoading={isLoading}
                        isSidebarExpanded={isSidebarExpanded}
                    />
                )}

                {/* Sidebar (Drawer on Mobile, Fixed Below Header on Desktop) */}
                <div
                    className="fixed md:top-16 top-0 left-0 bottom-0 z-40 overflow-hidden"
                >
                    <Dash_nav
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                        isExpanded={isSidebarExpanded}
                        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    />
                </div>

                {/* Main Content (Pushed down by Header, Pushed right by Sidebar) */}
                <div
                    className={`flex-1 relative z-10 w-full overflow-y-auto overflow-x-hidden pb-20 pt-20 md:pt-24 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'}`}
                >
                    <main className={fullWidth ? "w-full min-h-full" : "w-full max-w-[1920px] mx-auto p-4 md:p-8 xl:p-12 2xl:p-16"}>
                        <div className={`opacity-100 ${fullWidth ? 'min-h-full flex flex-col' : ''}`}>
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Create Bot Modal */}
            <CreateBotModal
                isOpen={isCreateBotModalOpen}
                onClose={() => setIsCreateBotModalOpen(false)}
                onSelect={handleBotSelect}
            />

            <LiveTicker data={tickerData} isSidebarExpanded={isSidebarExpanded} />
        </>
    );
};

export default DashboardLayout;
