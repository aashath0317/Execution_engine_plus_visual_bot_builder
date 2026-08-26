// src/Dash_nav.jsx
import React, { useState, useEffect, useRef } from 'react'; // <-- Added useRef
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutGrid, PieChart, PenTool, Bot, Briefcase, MessageSquare,
    TerminalSquare, Users, UserPlus, GraduationCap, CreditCard,
    Grid, TrendingUp, Activity, Zap, ChevronDown, HandHeart, X, LogOut, Store
} from 'lucide-react';
import API_BASE_URL from '../../config';
import { getToken, removeToken } from '../../utils/token';
import { useTrading } from '../../context/TradingContext';
import CommunityModal from '../../components/dashboard/CommunityModal';
import UserDropdown from '../../components/dashboard/UserDropdown';

const Dash_nav = ({ isOpen, onClose, isExpanded, onToggle }) => {
    const { isPaperTrading } = useTrading();
    const navigate = useNavigate();
    const location = useLocation();
    const currentView = location.pathname;

    const [botSubItems, setBotSubItems] = useState([]);
    const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState({});

    // --- ADDED: Ref and state for scroll position ---
    const scrollContainerRef = useRef(null);

    // Restore scroll position when component mounts or location changes
    useEffect(() => {
        const savedScrollPos = sessionStorage.getItem('sidebarScrollPos');
        if (scrollContainerRef.current && savedScrollPos) {
            scrollContainerRef.current.scrollTop = parseInt(savedScrollPos, 10);
        }
    }, [location.pathname, isExpanded]);

    // Save scroll position as the user scrolls
    const handleScroll = (e) => {
        sessionStorage.setItem('sidebarScrollPos', e.target.scrollTop);
    };

    // Stop wheel events from bubbling to the main content area
    const handleWheel = (e) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        const atTop = scrollTop === 0 && e.deltaY < 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
        // Only stop propagation when there's room to scroll
        if (!atTop && !atBottom) {
            e.stopPropagation();
        }
    };
    // ------------------------------------------------

    const getBotIcon = (type) => {
        if (!type) return Bot;
        const lowerType = type.toLowerCase();
        if (lowerType.includes('grid')) return Grid;
        if (lowerType.includes('dca')) return TrendingUp;
        if (lowerType.includes('signal')) return Activity;
        return Zap;
    };

    useEffect(() => {
        const fetchBots = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/user/available-bots`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();

                    const dynamicBots = data
                        .filter(bot => !((bot.bot_type || bot.bot_name || '').toLowerCase().includes('dca')))
                        .map(bot => {
                        const botName = bot.bot_name || 'Unknown Bot';
                        const lowerType = (bot.bot_type || botName || '').toLowerCase();
                        const isSpotGrid = lowerType.includes('grid');
                        const isDCA = lowerType.includes('dca');

                        let displayName = botName;
                        if (lowerType === 'spot grid' || lowerType === 'grid') {
                            displayName = 'Grid Bot';
                        }

                        return {
                            name: displayName,
                            icon: getBotIcon(bot.bot_type || botName),
                            path: isSpotGrid
                                ? `/dashboard/deploy`
                                : `/configure-bot?type=${encodeURIComponent(bot.bot_type)}`,
                            comingSoon: isDCA
                        };
                    });

                    setBotSubItems(dynamicBots);
                }
            } catch (error) {
                console.error("Failed to fetch nav bots:", error);
                setBotSubItems([
                    { name: "Grid Bot", icon: Grid, path: "/dashboard/deploy" },
                    { name: "Signal Bot", icon: Activity, path: "/configure-bot?type=Signal Bot" }
                ]);
            }
        };

        fetchBots();
    }, []);

    // Fetch user email to control visibility of certain nav items
    useEffect(() => {
        const fetchUserEmail = async () => {
            const token = getToken();
            if (!token) return;
            try {
                const response = await fetch(`${API_BASE_URL}/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserEmail((data.user?.email || data.email || '').toLowerCase());
                }
            } catch (error) {
                console.error("Failed to fetch user email:", error);
            }
        };
        fetchUserEmail();
    }, []);


    const topLevelItems = [
        { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
        { name: "My Exchanges", icon: Briefcase, path: "/my-exchanges" },
        { name: "My Portfolio", icon: PieChart, path: "/dashboard/portfolio" },
    ];

    const manualTradingItems = [
        { name: "Terminal", icon: TerminalSquare, path: "/live-market" },
    ];

    const tradingBotsItems = [
        { name: "Bot Hub", icon: Store, path: "/bot-hub" },
        { name: "Visual Builder", icon: PenTool, path: "/visual-builder" },
        { name: "Built-in bots", icon: Grid, subItems: botSubItems }
    ];

    const otherItems = [
        { name: "Backtest Engine", icon: Zap, path: "/backtest-engine" },
    ];

    // --- PARTNER SIDEBAR ITEMS ---
    const partnerItems = [
        { name: "Dashboard", icon: LayoutGrid, path: "/invite/dashboard" },
        { name: "Clients", icon: Users, path: "/invite/clients" },
        { name: "Payouts", icon: CreditCard, path: "/invite/payouts" },
        { name: "Marketing assets", icon: Briefcase, path: "/invite/marketing" }
    ];
    const isPartnerMode = location.pathname.startsWith('/invite');
    const NavItem = ({ item, isSubItem = false }) => {
        if (item.isAction) {
            const baseClasses = `w-full flex items-center gap-3 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 mb-0 text-gray-400 hover:text-white hover:bg-[#00FF9D]/5 outline-none ${isExpanded ? 'md:justify-start md:pl-3' : 'md:justify-center md:px-0'}`;
            return (
                <button onClick={item.action} className={baseClasses}>
                    <div className="flex items-center justify-center md:flex-shrink-0 md:w-8 md:h-8 md:rounded-lg transition-all duration-300">
                        {item.icon && <item.icon size={isSubItem ? 16 : 18} className="text-gray-400 group-hover:text-white transition-colors" />}
                    </div>
                    <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis delay-100 ${isExpanded ? 'md:max-w-[200px] opacity-60 md:opacity-100' : 'md:max-w-0 md:opacity-0'}`}>{item.name}</span>
                </button>
            );
        }

        if (item.subItems) {
            const isAnySubActive = location.pathname.startsWith('/invite/');

            const isMenuOpen = openSubMenus[item.name] || false;

            const handleToggle = () => {
                if (!isExpanded) {
                    onToggle();
                    setTimeout(() => setOpenSubMenus(prev => ({ ...prev, [item.name]: true })), 300);
                } else {
                    setOpenSubMenus(prev => ({ ...prev, [item.name]: !isMenuOpen }));
                }
            };

            const baseClasses = `w-full flex flex-col transition-all duration-300 mb-0 relative overflow-hidden group outline-none border-none ring-0 shadow-none`;
            const parentClasses = `flex items-center gap-3 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 w-full ${isExpanded ? 'md:justify-start md:pl-3' : 'md:justify-center md:px-0'} ${isAnySubActive ? 'text-[#00FF9D]' : 'text-gray-400 hover:text-white hover:bg-[#00FF9D]/5'}`;

            return (
                <div className={baseClasses}>
                    <button onClick={handleToggle} className={parentClasses}>
                        <div className={`flex items-center justify-center md:flex-shrink-0 md:w-8 md:h-8 md:rounded-lg transition-all duration-300`}>
                            {item.icon && <item.icon size={isSubItem ? 16 : 18} className={isAnySubActive ? "text-[#00FF9D]" : "text-gray-400 group-hover:text-white transition-colors"} />}
                        </div>
                        <div className={`flex items-center justify-between flex-1 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden delay-100 ${isExpanded ? 'md:max-w-[200px] md:opacity-100' : 'md:opacity-0 md:max-w-0'}`}>
                            <span>{item.name}</span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen && isExpanded ? 'max-h-64 opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col gap-1 pl-4 md:pl-10 relative">
                            <div className="absolute left-6 md:left-8 top-0 bottom-4 w-px bg-white/10 hidden md:block"></div>
                            {item.subItems.map((sub, idx) => {
                                const isSubActive = currentView === sub.path;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            navigate(sub.path);
                                            onClose && onClose();
                                        }}
                                        className={`w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${isSubActive ? 'bg-[#00FF9D] text-black shadow-[0_0_10px_rgba(0,255,157,0.2)]' : 'text-gray-400 hover:text-white hover:bg-[#00FF9D]/5'}`}
                                    >
                                        <span className="truncate">{sub.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        if (item.comingSoon) {
            const baseClasses = "w-full flex items-center justify-between md:justify-start gap-3 md:pl-3 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0 opacity-50 cursor-not-allowed";
            const subItemClasses = "pl-12 py-1.5 text-sm";
            return (
                <div className={`${baseClasses} ${isSubItem ? subItemClasses : ''} text-gray-500`}>
                    <div className="flex items-center justify-start gap-3 flex-1 transition-all duration-300 min-w-0">
                        <div className="flex items-center justify-center md:flex-shrink-0 md:w-8 md:h-8 md:rounded-lg transition-all duration-300">
                            {item.icon && <item.icon size={isSubItem ? 16 : 18} className="text-gray-500" />}
                        </div>
                        <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis delay-100 ${isExpanded ? 'md:max-w-[200px] md:opacity-100' : 'md:opacity-0 md:max-w-0'}`}>{item.name}</span>
                    </div>
                    <span className={`text-[8px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full font-bold uppercase transition-all duration-300 ease-in-out overflow-hidden delay-150 flex-shrink-0 ${isExpanded ? 'md:max-w-[50px] md:opacity-100' : 'md:opacity-0 md:max-w-0'}`}>Soon</span>
                </div>
            );
        }

        const isActive = currentView === item.path || (
            item.path && item.path.includes('?') &&
            currentView === item.path.split('?')[0] &&
            location.search === `?${item.path.split('?')[1]}`
        );

        const baseClasses = `w-full flex items-center gap-3 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 mb-0 relative overflow-hidden group outline-none border-none ring-0 shadow-none ${isExpanded ? 'md:justify-start md:pl-3' : 'md:justify-center md:px-0'}`;
        const activeClasses = `bg-gradient-to-r from-[#00FF9D]/15 via-[#00FF9D]/5 to-transparent text-[#00FF9D] ${!isExpanded ? 'md:bg-none md:bg-transparent' : ''}`;
        const inactiveClasses = "text-gray-400 hover:text-white hover:bg-[#00FF9D]/5";
        const subItemClasses = "pl-12 py-1.5 text-sm";

        return (
            <button
                onClick={() => {
                    navigate(item.path);
                    onClose && onClose();
                }}
                className={`${baseClasses} ${isSubItem ? subItemClasses : ''} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <div className={`flex items-center justify-center md:flex-shrink-0 md:w-8 md:h-8 md:rounded-lg transition-all duration-300`}>
                    {item.icon && <item.icon size={isSubItem ? 16 : 18} className={isActive ? "text-[#00FF9D]" : "text-gray-400 group-hover:text-white transition-colors"} />}
                </div>
                <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis delay-100 ${isExpanded ? 'md:max-w-[200px] md:opacity-100' : 'md:opacity-0 md:max-w-0'}`}>{item.name}</span>
            </button>
        );
    };

    const renderNavItems = (items) => {
        return items.map((item, index) => <NavItem key={index} item={item} />);
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* 1. Added "overflow-hidden" to the aside parent so it doesn't bleed off screen */}
            <aside className={`group/sidebar w-64 md:w-20 ${isExpanded ? 'md:w-64' : ''} md:bg-[#000000] bg-[#000000] flex flex-col overflow-hidden h-[100dvh] md:h-[calc(100vh-64px)] fixed md:top-[64px] top-0 left-0 z-40 transition-all duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-white/20 hover:shadow-2xl`}>

                <div className="md:hidden px-6 py-6 flex-shrink-0 flex items-center justify-between relative z-50">
                    <div className="flex items-center gap-2 cursor-pointer relative" onClick={() => setIsAppSwitcherOpen(!isAppSwitcherOpen)}>
                        <img src="/logo.png" alt="FydBlock" className="h-8 object-contain" />
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isAppSwitcherOpen ? 'rotate-180' : ''}`} />
                        {isPartnerMode ? (
                            <div className="px-2.5 py-1 rounded-md bg-[#131517] border border-white/5 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm ml-1">
                                PARTNER
                            </div>
                        ) : isPaperTrading && (
                            <div className="px-1.5 py-0.5 rounded border border-[#00FF9D] bg-[#00FF9D]/10 text-[#00FF9D] text-[8px] font-bold uppercase tracking-wider">
                                PAPER
                            </div>
                        )}

                        {isAppSwitcherOpen && (
                            <div className="absolute top-12 left-0 w-56 bg-[#131517] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAppSwitcherOpen(false);
                                            navigate('/dashboard');
                                            onClose && onClose();
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${!isPartnerMode ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <span className="font-medium">User Dashboard</span>
                                        {!isPartnerMode && <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]"></div>}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAppSwitcherOpen(false);
                                            navigate('/invite/dashboard');
                                            onClose && onClose();
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${isPartnerMode ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <span className="font-medium">Partner Dashboard</span>
                                        {isPartnerMode && <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]"></div>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* 2. Added "min-h-0" and "overscroll-y-contain" here to force internal flex scrolling */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    onWheel={handleWheel}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain overflow-x-hidden px-4 pb-24 no-scrollbar flex flex-col pt-0 md:pt-6"
                >

                    <div className={`md:hidden flex flex-col w-full px-2 pt-2 pb-4 mb-4 rounded-xl border-b border-white/10 text-sm font-medium transition-all duration-300 overflow-visible ${isExpanded ? 'items-start' : 'items-center'}`}>
                        <div className="w-full min-w-0">
                            <UserDropdown
                                isOpen={isUserDropdownOpen}
                                onToggle={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                onClose={() => setIsUserDropdownOpen(false)}
                                inline={true}
                            />
                        </div>
                    </div>

                    {/* Toggle button common to both modes so partner mode can also be collapsed freely */}
                    <div className={`hidden md:flex px-4 md:pl-3 mb-2 transition-all duration-300 items-center ${isExpanded ? 'justify-end' : 'justify-center'}`}>
                        <button
                            onClick={onToggle}
                            className="hidden md:flex items-center justify-center w-5 h-5 text-gray-500 hover:text-[#00FF9D] transition-colors"
                        >
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : '-rotate-90'}`} />
                        </button>
                    </div>

                    {isPartnerMode ? (
                        /* --- PARTNER NAVIGATION --- */
                        <>
                            <div className="flex flex-col gap-0.5 mb-3 mt-1">
                                {renderNavItems(partnerItems)}
                            </div>
                        </>
                    ) : (
                        /* --- NORMAL NAVIGATION --- */
                        <>
                            <div className="flex flex-col gap-0.5 mb-3 mt-1">
                                {renderNavItems(topLevelItems)}
                            </div>

                            <div className="hidden md:block px-4 md:px-0 mb-1 transition-all duration-300">
                                <p className={`text-white/80 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden delay-100 ${isExpanded ? 'opacity-50 max-w-[200px] md:ml-3' : 'opacity-0 max-w-0'}`}>Manual Trading</p>
                            </div>
                            <div className="flex flex-col gap-0.5 mb-3">
                                {renderNavItems(manualTradingItems)}
                            </div>

                            <div className="hidden md:block px-4 md:px-0 mb-1 transition-all duration-300">
                                <p className={`text-white/80 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden delay-100 ${isExpanded ? 'opacity-50 max-w-[200px] md:ml-3' : 'opacity-0 max-w-0'}`}>Trading Bots</p>
                            </div>
                            <div className="flex flex-col gap-0.5 mb-3">
                                {renderNavItems(tradingBotsItems)}
                            </div>

                            <div className="hidden md:block px-4 md:px-0 mb-1 transition-all duration-300">
                                <p className={`text-white/80 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden delay-100 ${isExpanded ? 'opacity-50 max-w-[200px] md:ml-3' : 'opacity-0 max-w-0'}`}>Other</p>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {renderNavItems(otherItems)}
                            </div>
                        </>
                    )}

                    <div className="flex-1 min-h-[10px]"></div>

                </div>

                <div className="mt-auto px-4 pb-4 pt-2 border-t border-white/5 bg-[#000000]">
                    <div className="flex flex-col gap-1">

                        <button 
                            onClick={() => { removeToken(); window.location.href = '/'; }} 
                            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 text-red-500 hover:text-red-400 hover:bg-red-500/10 bg-white/[0.07] border border-red-500/30 outline-none ${isExpanded ? 'md:justify-start' : 'md:justify-center'}`}
                        >
                            <span className="md:flex-shrink-0 md:w-8 md:h-8 md:flex md:items-center md:justify-center">
                                <LogOut size={18} className="opacity-70" />
                            </span>
                            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis delay-100 ${isExpanded ? 'md:max-w-[200px] md:opacity-100' : 'md:max-w-0 md:opacity-0'}`}>Log out</span>
                        </button>
                    </div>
                </div>
            </aside>

            <CommunityModal isOpen={isCommunityModalOpen} onClose={() => setIsCommunityModalOpen(false)} />
        </>
    );
};

export default Dash_nav;