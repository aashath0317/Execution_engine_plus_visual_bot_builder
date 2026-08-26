import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { getToken } from '../utils/token';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Fetch initial notifications from database
    const fetchNotifications = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/user/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();

                // Get local read/deleted receipts for global broadcasts
                const localRead = JSON.parse(localStorage.getItem('readGlobalNotifications') || '[]');
                const localDeleted = JSON.parse(localStorage.getItem('deletedGlobalNotifications') || '[]');

                // Format the DB returned objects to match UI expectations
                let formatted = data.map(n => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    timestamp: new Date(n.created_at).getTime(),
                    read: n.is_read || localRead.includes(n.id),
                    // Simple icon mapping based on type
                    icon: getIconForType(n.type)
                }));

                // Filter out deleted global notifications
                formatted = formatted.filter(n => !localDeleted.includes(n.id));

                setNotifications(formatted);
            }
        } catch (e) {
            console.error("Failed to fetch notifications:", e);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'referral': return '🎉';
            case 'security': return '🔒';
            case 'feature': return '🚀';
            default: return '🔔';
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 1-2 minutes for new global announcements
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const addNotification = (notif) => {
        setNotifications(prev => [
            {
                id: Date.now(),
                timestamp: Date.now(),
                read: false,
                ...notif
            },
            ...prev
        ]);
    };

    const markAsRead = async (id) => {
        // Optimistic UI update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));

        // Save to local storage for global notifications
        const localRead = JSON.parse(localStorage.getItem('readGlobalNotifications') || '[]');
        if (!localRead.includes(id)) {
            localStorage.setItem('readGlobalNotifications', JSON.stringify([...localRead, id]));
        }

        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/user/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) {
            console.error("Failed to mark notification as read", e);
        }
    };

    const markAllAsRead = async () => {
        // Local storage update for global notifications
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        const localRead = JSON.parse(localStorage.getItem('readGlobalNotifications') || '[]');
        const combinedRead = Array.from(new Set([...localRead, ...unreadIds]));
        localStorage.setItem('readGlobalNotifications', JSON.stringify(combinedRead));

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/user/notifications/mark-all-read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) {
            console.error("Failed to mark all as read", e);
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    // Helper to format "1m", "2h" etc.
    const formatTimeAgo = (timestamp) => {
        const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    const deleteNotification = async (id) => {
        // Optimistic UI update
        setNotifications(prev => prev.filter(n => n.id !== id));

        // Save to local storage for global notifications
        const localDeleted = JSON.parse(localStorage.getItem('deletedGlobalNotifications') || '[]');
        if (!localDeleted.includes(id)) {
            localStorage.setItem('deletedGlobalNotifications', JSON.stringify([...localDeleted, id]));
        }

        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/user/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) {
            console.error("Failed to delete notification", e);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearNotifications,
            formatTimeAgo
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
