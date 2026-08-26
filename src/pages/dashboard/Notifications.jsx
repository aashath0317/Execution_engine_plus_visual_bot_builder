import React from 'react';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useNotification } from '../../context/NotificationContext';

const Notifications = () => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, formatTimeAgo } = useNotification();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <DashboardLayout>
            <Header title="Notifications" />

            <div className="max-w-4xl mx-auto mt-6">
                <div className="bg-[#0e4d2d] rounded-2xl p-6 mb-6 flex justify-between items-center border border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                            <Bell className="text-[#00FF9D]" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Your Notifications</h2>
                            <p className="text-gray-300 text-sm">You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.</p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 border border-white/5 hover:border-white/10"
                        >
                            <CheckCircle2 size={16} /> Mark all as read
                        </button>
                    )}
                </div>

                <div className="bg-[#131517] rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-[#1A1F24]/50">
                        <div className="flex text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <div className="w-16 text-center">Status</div>
                            <div className="flex-1">Message</div>
                            <div className="w-32 text-right">Time</div>
                        </div>
                    </div>

                    {notifications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 flex items-start gap-4 transition-colors hover:bg-white/5 ${!notif.read ? 'bg-[#00FF9D]/5' : ''}`}
                                >
                                    <div className="w-16 flex justify-center mt-1">
                                        {!notif.read ? (
                                            <div className="w-2.5 h-2.5 bg-[#00FF9D] rounded-full shadow-[0_0_8px_rgba(0,255,157,0.5)]"></div>
                                        ) : (
                                            <Check size={16} className="text-gray-600" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-semibold mb-1 ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                                            {notif.title}
                                        </h4>
                                        <p className={`text-sm leading-relaxed ${notif.read ? 'text-gray-500' : 'text-gray-300'}`}>
                                            {notif.message}
                                        </p>

                                        {!notif.read && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="mt-3 text-xs bg-[#1A1F24] hover:bg-[#2A2F34] text-gray-300 px-3 py-1.5 rounded transition border border-white/5"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>

                                    <div className="w-32 text-right flex flex-col items-end justify-between">
                                        <span className="text-xs text-gray-500 font-mono mb-2">
                                            {formatTimeAgo(notif.timestamp)}
                                        </span>
                                        <button
                                            onClick={() => deleteNotification(notif.id)}
                                            className="text-gray-500 hover:text-red-400 focus:outline-none transition p-1 rounded hover:bg-white/5 mt-auto"
                                            title="Delete Notification"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Bell size={48} className="text-gray-600 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-white mb-2">No notifications yet</h3>
                            <p className="text-gray-500 text-sm">When you get notifications, they'll show up here.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Notifications;
