import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, X, Clock, Search, Bell, ChevronDown, User, LogOut, Settings, Wallet } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import { Skeleton } from '../ui/skeleton';
import { useLocation } from 'react-router-dom';

const GlobalHeader = ({
    headerSlot,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    onOpenCreateBot,
    isLoading,
    isSidebarExpanded
}) => {
    const { isPaperTrading, searchQuery, setSearchQuery } = useTrading();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    // Timer for clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear().toString().slice(-2);
        const t = date.toLocaleTimeString('en-GB', { hour12: false });
        return `${d}/${m}/${20 + y} ${t}`;
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-[#000000] z-50 flex border-b border-white/20">
            <div className="w-full flex h-full">
                {/* Left: Logo Section (Aligned with Sidebar) */}
                <div className={`h-full flex items-center px-4 md:px-6 border-r border-white/20 shrink-0 transition-all duration-300 ease-in-out w-auto md:w-64 ${isSidebarExpanded ? 'md:w-64' : 'md:w-20'}`}>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-400 hover:text-white transition-colors mr-3 md:mr-4 shrink-0">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div className={`relative flex items-center shrink-0 transition-all duration-300 ease-in-out w-24 sm:w-auto ${isSidebarExpanded ? '' : 'md:justify-center md:w-full'}`}>
                        {/* App Switcher Dropdown Toggle */}
                        <div
                            className="flex items-center gap-2 cursor-pointer relative"
                            onClick={() => isSidebarExpanded ? setActiveDropdown(activeDropdown === 'appSwitcher' ? null : 'appSwitcher') : navigate('/dashboard')}
                        >
                            <img
                                src={isSidebarExpanded ? "/logo.png" : "/favicon.png"}
                                alt="FydBlock"
                                className={`transition-all duration-300 ${isSidebarExpanded ? 'h-10' : 'h-8 md:h-8'}`}
                            />
                            {/* Only show Chevron on Desktop when sidebar is expanded */}
                            {isSidebarExpanded && (
                                <div className="flex items-center gap-2">
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${activeDropdown === 'appSwitcher' ? 'rotate-180' : ''}`} />
                                    {location.pathname.startsWith('/invite') && (
                                        <div className="px-2.5 py-1 rounded-md bg-[#131517] border border-white/5 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                            PARTNER
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* App Switcher Dropdown Menu */}
                            {activeDropdown === 'appSwitcher' && isSidebarExpanded && (
                                <div className="absolute top-12 left-0 w-48 bg-[#131517] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in-up">
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(null);
                                                navigate('/dashboard');
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${!location.pathname.startsWith('/invite') ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <span className="font-medium">User Dashboard</span>
                                            {!location.pathname.startsWith('/invite') && <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]"></div>}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(null);
                                                navigate('/invite/dashboard');
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname.startsWith('/invite') ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <span className="font-medium">Partner Dashboard</span>
                                            {location.pathname.startsWith('/invite') && <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]"></div>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isPaperTrading && !location.pathname.startsWith('/invite') && (
                            <div className={`absolute left-full ml-4 px-1.5 py-0.5 rounded border border-[#00FF9D] bg-[#00FF9D]/10 text-[#00FF9D] text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'md:opacity-0'}`}>
                                PAPER
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Time, Filter & Controls */}
                <div className="flex-1 flex items-center justify-between px-4 md:px-8 xl:px-12 min-w-0">
                    {/* LEFT: Time & Custom Slot */}
                    <div className="flex items-center gap-6">
                        {/* Clock/Time */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#131517] border border-white/5 rounded-lg">
                            <Clock size={14} className="text-[#00FF9D]" />
                            {isLoading ? (
                                <Skeleton width="100px" height="16px" className="opacity-50" />
                            ) : (
                                <span className="font-mono text-xs font-bold text-white tracking-wider">{formatDateTime(currentDateTime)}</span>
                            )}
                        </div>

                        {headerSlot && <div className="hidden lg:block h-6 w-px bg-white/20"></div>}

                        {headerSlot && (
                            <div className="shrink-0 max-w-[130px] sm:max-w-none ml-1 md:ml-0">{headerSlot}</div>
                        )}
                    </div>

                    {/* RIGHT: Buttons */}
                    <div className="flex items-center gap-2 md:gap-4 shrink-0 relative bg-[#000000] md:bg-transparent pl-3 md:pl-6 h-10 my-auto">

                        {/* Affiliate Button removed per request */}
                        {/* New Bot Button removed per request */}

                        {/* Divider between New Bot and Profile */}
                        {!location.pathname.startsWith('/invite') && (
                            <div className="h-full py-2">
                                <div className="h-full w-px bg-white/20 mx-2 hidden md:block"></div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 md:gap-4 pl-0">
                            <NotificationDropdown
                                isOpen={activeDropdown === 'notif'}
                                onToggle={() => setActiveDropdown(activeDropdown === 'notif' ? null : 'notif')}
                                onClose={() => setActiveDropdown(null)}
                            />
                            <UserDropdown
                                isOpen={activeDropdown === 'user'}
                                onToggle={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                                onClose={() => setActiveDropdown(null)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalHeader;
