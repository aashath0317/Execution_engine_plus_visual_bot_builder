import React, { useState } from 'react';
import { Bell, Check, Gift, PartyPopper, LogIn, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const NotificationDropdown = ({ isOpen, onToggle, onClose }) => {
    const { notifications, markAsRead, markAllAsRead, formatTimeAgo } = useNotification();
    const [internalOpen, setInternalOpen] = useState(false);
    const navigate = useNavigate();

    // Determine if controlled or uncontrolled
    const isControlled = isOpen !== undefined;
    const open = isControlled ? isOpen : internalOpen;

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleToggle = () => {
        if (isControlled && onToggle) {
            onToggle();
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

    const getIcon = (type, customIcon) => {
        if (customIcon) return <span className="text-lg">{customIcon}</span>;
        switch (type) {
            case 'success': return <Gift size={18} />;
            case 'referral': return <PartyPopper size={18} />;
            case 'login': return <LogIn size={18} />;
            default: return <Info size={18} />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="relative w-11 h-11 flex items-center justify-center transition hover:bg-white/5 rounded-xl"
            >
                <Bell size={20} className="text-gray-400 group-hover:text-white transition-colors" strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 w-2 h-2 bg-[#FF5500] rounded-full border border-black"></span>
                )}
            </button>

            {/* Notification Dropdown */}
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={handleClose} />
                    <div className="absolute right-0 top-full mt-4 w-[calc(100vw-32px)] sm:w-[320px] md:w-[380px] bg-[#0A1014] border border-white/10 rounded-xl z-50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                        {/* Arrow */}
                        <div className="absolute top-0 right-[16px] w-3 h-3 bg-[#0A1014] border-l border-t border-white/10 transform rotate-45 -translate-y-1.5 z-50"></div>

                        <div className="p-6 relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">Notification</h3>
                                <button
                                    onClick={() => { handleClose(); navigate('/notifications'); }}
                                    className="text-[10px] bg-[#1A1F24] px-2 py-1 rounded text-gray-400 hover:text-white transition"
                                >
                                    VIEW: ALL
                                </button>
                            </div>
                            <div className="h-px w-full bg-white/10 mb-4"></div>

                            {notifications.length > 0 ? (
                                <div
                                    className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1"
                                    data-lenis-prevent="true"
                                    onWheel={(e) => e.stopPropagation()}
                                >
                                    {notifications.map((notif, index) => (
                                        <div
                                            key={notif.id}
                                            className="bg-transparent border-b border-white/5 p-4 flex gap-3 transition-colors hover:bg-white/5 cursor-pointer last:border-0"
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className={`
                                                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                                                ${notif.type === 'success' ? 'text-[#00FF9D] bg-[#00FF9D]/10' : ''}
                                                ${notif.type === 'referral' ? 'text-[#3B82F6] bg-[#3B82F6]/10' : ''}
                                                ${notif.type === 'login' ? 'text-[#F59E0B] bg-[#F59E0B]/10' : ''}
                                                ${!['success', 'referral', 'login'].includes(notif.type) ? 'text-gray-400 bg-white/5' : ''}
                                            `}>
                                                {notif.icon && <span className="text-base">{notif.icon}</span>}
                                                {!notif.icon && <Check size={16} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <h4 className={`text-sm font-semibold truncate pr-2 ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-600 whitespace-nowrap font-mono ml-2">
                                                        {formatTimeAgo(notif.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <div className="flex-shrink-0 flex items-center">
                                                    <div className="w-1.5 h-1.5 bg-[#00FF9D] rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-[#131517] border border-white/5 rounded-xl p-8 text-center">
                                    <Bell size={32} className="text-gray-600 mx-auto mb-3" />
                                    <p className="text-white font-medium">No new notifications</p>
                                    <p className="text-gray-500 text-xs mt-1">We'll notify you when something happens.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
