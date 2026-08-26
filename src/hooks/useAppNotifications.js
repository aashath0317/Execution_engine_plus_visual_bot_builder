import { useNotification } from '../context/NotificationContext';

export const useAppNotifications = () => {
    const { addNotification } = useNotification();

    // Helper to send the notification
    const notify = (title, message, type, icon) => {
        addNotification({
            title,
            message,
            type,
            icon,
            timestamp: Date.now(),
            read: false,
        });
    };

    return {
        // 1. High Priority: Security & Connection Alerts
        notifyApiDisconnect: (message = "Urgent: Binance API key expired or disconnected. Reconnect to resume bot trading.") =>
            notify("API Disconnected", message, "urgent", "⚠️"),

        notifySecurityEvent: (message) =>
            notify("Security Alert", message, "urgent", "🔒"),

        notifyFailedTransaction: (message = "Withdrawal failed due to insufficient network fee.") =>
            notify("Transaction Failed", message, "error", "❌"),

        // 2. Trading & Bot Activity
        notifyBotStatus: (title = "Bot Status Changed", message) =>
            notify(title, message, "info", "🤖"),

        notifyTargetReached: (message) =>
            notify("Target Reached", message, "success", "🎯"),

        notifyRiskAlert: (title = "Risk Alert", message) =>
            notify(title, message, "warning", "📉"),

        notifyBotError: (message = "Insufficient balance to place the next grid order.") =>
            notify("Bot Error", message, "error", "❌"),

        // 3. Portfolio & Market Alerts
        notifySignificantSwing: (message) =>
            notify("Portfolio Update", message, "warning", "📉"),

        notifyPortfolioSummary: (message) =>
            notify("Daily Wrap-up", message, "info", "📊"),

        notifyMarketTrigger: (title = "Market Opportunity", message) =>
            notify(title, message, "info", "💡"),

        // 4. Platform & Community
        notifySystemMaintenance: (message = "FydBlock scheduled maintenance in 24 hours. Trading will not be interrupted.") =>
            notify("System Maintenance", message, "info", "🛠️"),

        notifyAffiliateEvent: (message) =>
            notify("Affiliate Update", message, "success", "👥"),

        notifyNewFeature: (title = "New Feature!", message) =>
            notify(title, message, "success", "✨"),

        // Generic custom notification fallback
        customNotification: (title, message, type = "info", icon = "💬") =>
            notify(title, message, type, icon)
    };
};

export default useAppNotifications;
