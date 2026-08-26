import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Plus, X, Clock, ChevronDown } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import { Skeleton } from '../ui/skeleton';

const MobileGlobalHeader = ({
    headerSlot,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    onOpenCreateBot,
    isLoading,
    isSidebarExpanded
}) => {
    const { isPaperTrading } = useTrading();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    const isPartnerMode = location.pathname.startsWith('/invite');

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
        <div className="fixed top-0 left-0 right-0 h-16 bg-[#000000] z-50 flex items-center justify-between px-4 md:px-0 border-b border-white/20">

            {/* --- 1. FAR LEFT: Mobile Menu OR Desktop Logo --- */}
            <div className={`flex items-center h-full z-10 md:border-r md:border-white/20 md:px-6 transition-all duration-300 ${isSidebarExpanded ? 'md:w-64' : 'md:w-20'}`}>

                {/* Mobile Menu Icon (Visible only on mobile, placed left) */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden text-gray-400 hover:text-white transition-colors"
                >
                    {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>

                {/* Desktop Logo (Hidden on mobile) */}
                <div className="hidden md:flex relative items-center w-full justify-center">
                    <img
                        src={isSidebarExpanded ? "/logo.png" : "/favicon.png"}
                        alt="FydBlock"
                        className={`cursor-pointer transition-all duration-300 h-8`}
                        onClick={() => navigate('/')}
                    />
                    {isPaperTrading && (
                        <div className="absolute left-full ml-2 px-1.5 py-0.5 rounded border border-[#00FF9D] bg-[#00FF9D]/10 text-[#00FF9D] text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                            PAPER
                        </div>
                    )}
                </div>
            </div>

            {/* --- 2. ABSOLUTE CENTER: Mobile Logo (Hidden on Desktop) --- */}
            <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 w-48">
                <div
                    className="flex items-center gap-1 cursor-pointer bg-black/50 px-2 py-1 rounded-lg"
                    onClick={() => setActiveDropdown(activeDropdown === 'appSwitcherCenter' ? null : 'appSwitcherCenter')}
                >
                    <img
                        src="/logo.png"
                        alt="FydBlock"
                        className="h-[1.65rem] object-contain"
                    />
                    <ChevronDown size={14} className={`text-gray-400 mt-1 transition-transform duration-200 ${activeDropdown === 'appSwitcherCenter' ? 'rotate-180' : ''}`} />
                    
                    {/* Paper text only shown if no space issues, otherwise can be skipped here since sidebar has it */}
                </div>

                {activeDropdown === 'appSwitcherCenter' && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-56 bg-[#131517] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 space-y-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(null);
                                    navigate('/dashboard');
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${!isPartnerMode ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className="font-medium">User Dashboard</span>
                                {!isPartnerMode && <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]"></div>}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(null);
                                    navigate('/invite/dashboard');
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

            {/* --- 3. FAR RIGHT: Controls, Notifications & Desktop Profile --- */}
            <div className="flex items-center justify-end h-full z-10 md:flex-1 md:justify-between md:px-8 xl:px-12 min-w-0">

                {/* Desktop Center Items (Time & Filter) - Hidden on Mobile */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#131517] border border-white/5 rounded-lg">
                        <Clock size={14} className="text-[#00FF9D]" />
                        {isLoading ? (
                            <Skeleton width="100px" height="16px" className="opacity-50" />
                        ) : (
                            <span className="font-mono text-xs font-bold text-white tracking-wider">{formatDateTime(currentDateTime)}</span>
                        )}
                    </div>
                    {headerSlot && <div className="hidden lg:block h-6 w-px bg-white/20"></div>}
                    {headerSlot && <div className="shrink-0">{headerSlot}</div>}
                </div>

                {/* Always Right Items */}
                <div className="flex items-center gap-3 md:gap-4 shrink-0">

                    {/* Affiliate Button removed per request */}
                    <button onClick={onOpenCreateBot} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-transparent border border-white/20 hover:bg-white/5 text-white text-xs font-bold transition">
                        <Plus size={16} strokeWidth={3} />
                        New Bot
                    </button>

                    <div className="hidden md:block h-8 w-px bg-white/20 mx-1"></div>

                    {/* Notification Bell (Visible everywhere, far right on mobile) */}
                    <NotificationDropdown
                        isOpen={activeDropdown === 'notif'}
                        onToggle={() => setActiveDropdown(activeDropdown === 'notif' ? null : 'notif')}
                        onClose={() => setActiveDropdown(null)}
                    />

                    {/* Profile Avatar (HIDDEN ON MOBILE, visible on desktop) */}
                    <div className="hidden md:flex items-center">
                        <UserDropdown
                            isOpen={activeDropdown === 'user'}
                            onToggle={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                            onClose={() => setActiveDropdown(null)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileGlobalHeader;