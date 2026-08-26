import React, { useState } from 'react';
import {
    User, Shield, Users, MessageSquarePlus, HelpCircle, ChevronDown
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { removeToken, getToken } from '../../utils/token';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getMediaUrl } from '../../utils/url';
import API_BASE_URL from '../../config';

const UserDropdown = ({ isOpen, onToggle, onClose, inline = false }) => {
    const { isPaperTrading, togglePaperTrading } = useTrading();
    const [internalOpen, setInternalOpen] = useState(false);
    const [userData, setUserData] = React.useState(null);
    const navigate = useNavigate();

    // Determine if controlled or uncontrolled
    const isControlled = isOpen !== undefined;
    const open = isControlled ? isOpen : internalOpen;

    React.useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = getToken();
            if (!token) return;
            const res = await axios.get(`${API_BASE_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(res.data.user || res.data);
        } catch (error) {
            console.error("Failed to fetch user in dropdown", error);
        }
    };

    const handleToggle = () => {
        if (isControlled) {
            if (onToggle) onToggle();
            else if (onClose && open) onClose();
        } else {
            setInternalOpen(!internalOpen);
        }
    };

    const handleClose = () => {
        if (isControlled && onClose) {
            onClose();
        } else {
            setInternalOpen(false);
        }
    };

    return (
        <div className="relative w-full">
            <div
                onClick={handleToggle}
                className="flex items-center justify-between w-full h-12 cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors group"
            >
                <div className="flex items-center gap-3 w-[calc(100%-24px)] overflow-hidden">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-800 overflow-hidden border border-white/5 group-hover:border-white/20 transition-colors">
                        <img
                            src={userData?.avatar_url ? getMediaUrl(userData.avatar_url) : "/default-user.svg"}
                            alt="User"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                if (e.target.src !== window.location.origin + "/default-user.svg") {
                                    e.target.src = "/default-user.svg";
                                }
                            }}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 w-full">
                            <span className="text-sm font-bold text-white leading-none truncate">
                                {userData?.full_name || 'Trader'}
                            </span>
                            {(() => {
                                const badge = ((planName) => {
                                    if (!planName) return null;
                                    const lower = planName.toLowerCase();
                                    if (lower.includes('advance')) return { label: 'ADVANCE', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
                                    if (lower.includes('signature') || lower.includes('pro')) return { label: 'PRO', color: 'text-[#00FF9D]', bg: 'bg-[#00FF9D]/10', border: 'border-[#00FF9D]/20' };
                                    if (lower.includes('free')) return { label: 'FREE', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };
                                    return null;
                                })(userData?.plan);

                                if (!badge) return null;

                                return (
                                    <span className={`flex-shrink-0 text-[9px] font-bold ${badge.color} ${badge.bg} border ${badge.border} px-1 py-0.5 rounded leading-none uppercase`}>
                                        {badge.label}
                                    </span>
                                );
                            })()}
                        </div>
                        <span className="text-xs text-gray-500 font-medium leading-none mt-1.5 truncate w-full">
                            {userData?.email || 'user@example.com'}
                        </span>
                    </div>
                </div>

                <ChevronDown size={16} className={`text-gray-400 transition-transform ml-2 ${open ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {open && (
                <>
                    {!inline && <div className="fixed inset-0 z-40" onClick={handleClose} />}
                    <div className={`${inline ? 'w-full mt-2' : 'absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-64 bg-[#000000] border border-white/10 rounded-xl z-50 shadow-xl'} overflow-hidden p-2 animate-in fade-in slide-in-from-top-2`}>

                        {/* Menu Items */}
                        <div className={`space-y-1 ${inline ? 'bg-[#131517] rounded-xl p-2 border border-white/5' : ''}`}>
                            <Link
                                to="/settings#account"
                                onClick={handleClose}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white border border-transparent hover:border-[#00FF9D] rounded-lg transition-colors text-left"
                            >
                                <User size={16} /> Account settings
                            </Link>
                            <Link
                                to="/settings#security"
                                onClick={handleClose}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white border border-transparent hover:border-[#00FF9D] rounded-lg transition-colors text-left"
                            >
                                <Shield size={16} /> Security
                            </Link>
                            <Link
                                to="/feedback"
                                onClick={handleClose}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white border border-transparent hover:border-[#00FF9D] rounded-lg transition-colors text-left"
                            >
                                <MessageSquarePlus size={16} /> Feedback portal
                            </Link>

                        </div>

                        <div className="my-1 border-t border-white/5"></div>

                        {/* Demo Slider */}
                        <div className="px-3 py-1">
                            <div className="flex items-center justify-between mb-0">
                                <span className={`text-xs font-bold ${isPaperTrading ? 'text-[#00FF9D]' : 'text-gray-400'}`}>
                                    Demo Mode
                                </span>
                                <button
                                    onClick={() => togglePaperTrading(!isPaperTrading)}
                                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${isPaperTrading ? 'bg-[#00FF9D]' : 'bg-gray-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-black shadow-sm transform transition-transform duration-300 ${isPaperTrading ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 tracking-tighter">
                                {isPaperTrading ? 'Paper trading active' : 'Switch to test without risk'}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserDropdown;
