import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, Loader2, Pause, Play, Trash2, Activity, Plus, Settings2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { useToast } from '../context/ToastContext';
import API_BASE_URL from '../config';
import { getToken } from '../utils/token';
import { useTrading } from '../context/TradingContext';

import BotSparkline from './BotSparkline';
import useAppNotifications from '../hooks/useAppNotifications';

const ExchangeBadge = ({ exchange, className = "" }) => {
    if (!exchange) return null;
    const exName = exchange.toLowerCase().replace('_paper', '');

    // Attempt multiple path variations for robustness
    const paths = [
        `/exchanges_svg/${exName.charAt(0).toUpperCase() + exName.slice(1)}.svg`,
        `/exchanges_svg/${exName}.svg`,
        `/exchanges_svg/${exchange.replace('_PAPER', '')}.svg`
    ];

    return (
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#131B1F] border border-white/10 flex items-center justify-center overflow-hidden p-0.5 shadow-lg z-30 ${className}`}>
            <img
                src={paths[0]}
                alt={exchange}
                className="w-full h-full object-contain"
                onError={(e) => {
                    const currentIdx = paths.indexOf(e.target.getAttribute('src'));
                    if (currentIdx !== -1 && currentIdx < paths.length - 1) {
                        e.target.src = paths[currentIdx + 1];
                    } else {
                        e.target.onerror = null;
                        e.target.parentElement.style.display = 'none';
                    }
                }}
            />
        </div>
    );
};


// --- ACTIVE BOTS LIST ---
const ActiveBots = ({ limit, minimal }) => {
    const navigate = useNavigate();
    const { isPaperTrading } = useTrading();
    const { addToast } = useToast();
    const { notifyBotStatus } = useAppNotifications();
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, botId: null, action: null });

    const fetchBots = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const modeQuery = isPaperTrading ? '?mode=paper' : '?mode=live';
            const res = await fetch(`${API_BASE_URL}/user/bots${modeQuery}&_t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            });
            if (res.ok) {
                const data = await res.json();
                const relevantBots = data.filter(b =>
                    ['active', 'running', 'RUNNING', 'paused', 'starting', 'STARTING'].includes(b.status)
                );
                setBots(relevantBots);
                return relevantBots;
            }
        } catch (e) { console.error(e); }
        return [];
    };

    useEffect(() => {
        let isMounted = true;
        let timeoutId;

        const adaptivePoll = async () => {
            if (!isMounted) return;

            try {
                const relevantBots = await fetchBots();
                if (isMounted && relevantBots) {
                    setLoading(false);
                    // Adaptive Logic
                    const hasStarting = relevantBots.some(b => b.status === 'starting' || b.status === 'STARTING');
                    const nextInterval = hasStarting ? 1000 : 5000;
                    timeoutId = setTimeout(adaptivePoll, nextInterval);
                } else {
                    if (isMounted) setLoading(false);
                    timeoutId = setTimeout(adaptivePoll, 5000);
                }
            } catch (e) {
                if (isMounted) {
                    setLoading(false);
                    timeoutId = setTimeout(adaptivePoll, 5000);
                }
            }
        };

        adaptivePoll();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [isPaperTrading]);

    const handleToggleBot = async (e, botId, currentStatus) => {
        e.stopPropagation();
        const isRunning = ['active', 'running', 'RUNNING'].includes(currentStatus);
        const isStarting = ['starting', 'STARTING'].includes(currentStatus);

        if (isStarting) return;

        const action = isRunning ? 'stopping' : 'starting';
        setActionLoading(prev => ({ ...prev, [botId]: action }));
        const token = getToken();

        // Optimistic
        setBots(prev => prev.map(b => (b.bot_id === botId || b.id === botId) ? { ...b, status: isRunning ? 'paused' : 'active' } : b));

        try {
            const res = await fetch(`${API_BASE_URL}/user/bot/${botId}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed");
            notifyBotStatus("Bot Status Changed", `Bot has been manually ${isRunning ? 'paused' : 'started'}.`);
            await fetchBots();
        } catch (e) {
            console.error(e);
            addToast("Action failed", "error");
            fetchBots(); // Revert
        } finally {
            setActionLoading(prev => { const n = { ...prev }; delete n[botId]; return n; });
        }
    };

    const handleDeleteBot = (e, botId) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            botId: botId,
            action: 'delete'
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.botId || confirmModal.action !== 'delete') return;
        const botId = confirmModal.botId;

        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        setActionLoading(prev => ({ ...prev, [botId]: 'deleting' }));

        const token = getToken();
        try {
            await fetch(`${API_BASE_URL}/user/bot/${botId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            notifyBotStatus("Bot Deleted", "Bot was successfully deleted.");
            await fetchBots();
        } catch (e) { console.error(e); } finally {
            setActionLoading(prev => { const n = { ...prev }; delete n[botId]; return n; });
            setConfirmModal({ isOpen: false, botId: null, action: null });
        }
    };

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-500" /></div>;

    if (bots.length === 0) return (
        <div className="flex flex-col items-center justify-center py-12 w-full animate-in fade-in duration-700">
            <div className="relative mb-4 group">
                <div className="absolute inset-0 bg-[#00FF9D]/20 blur-2xl rounded-full group-hover:bg-[#00FF9D]/30 transition-all duration-500"></div>
                <img
                    src="/images/no-bots.png"
                    alt="No bots"
                    className="w-16 h-16 relative z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                    }}
                />
                {!document.querySelector('img[src="/images/no-bots.png"]') && (
                    <Activity className="w-12 h-12 text-gray-700 relative z-10 transition-transform duration-500 group-hover:rotate-12" />
                )}
            </div>
            <h3 className="text-white font-bold text-sm mb-1 tracking-wide">No bots yet</h3>
            <p className="text-gray-500 text-[11px] font-medium">Your bots will be shown here</p>
        </div>
    );

    const displayBots = limit ? bots.slice(0, limit) : bots;
    const themeText = 'text-[#00FF9D]';
    const themeBgBtn = 'bg-[#00FF9D]';
    const themeHoverBtn = 'hover:bg-[#00cc7d]';
    const themeColor = '#00FF9D';
    const themeBorderHover = 'hover:border-[#00FF9D]';

    const isHorizontal = !minimal; // Default to horizontal if not minimal, or add explicit prop. 
    // Actually, let's just make it flexible.
    // If minimal is true, we might want vertical? 
    // The user wants it to look like proper Bots page. Bots page is horizontal.

    // Let's use a layout prop. default to 'grid' to be safe, or 'horizontal' to match Bots.

    const containerClasses = minimal
        ? "flex gap-6 overflow-x-auto pb-6 scrollbar-hide" // Mimic Bots.jsx
        : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6";

    return (
        <div className="flex flex-col gap-4">
            {bots.map(bot => {
                const bId = bot.bot_id || bot.id;
                const isActionLoading = actionLoading[bId];
                const isStarting = bot.status === 'starting' || bot.status === 'STARTING';
                const isRunning = ['active', 'running', 'RUNNING'].includes(bot.status);

                let config = {};
                if (typeof bot.config === 'string') { try { config = JSON.parse(bot.config); } catch (e) { } } else { config = bot.config || {}; }

                const profitMode = config.strategy?.profit_mode || config.profitMode || config.profit_mode || 'USDT_ONLY';
                const profitCoin = parseFloat(bot.total_profit_coin || 0);
                const profit = parseFloat(bot.total_profit || 0);
                const isPositive = profit >= 0 || profitCoin > 0;

                const estimatedPrice = bot.current_price || (config.strategy?.upper_price && config.strategy?.lower_price ? (config.strategy.upper_price + config.strategy.lower_price) / 2 : 0);
                const profitCoinValue = profitCoin * estimatedPrice;

                let displayProfit = "----";
                if (profitMode === 'COIN_ONLY' || (profitCoin > 0 && profit === 0 && profitMode !== 'HYBRID')) {
                    displayProfit = `${profitCoin >= 0 ? '+' : ''}${profitCoin.toFixed(4)} ${bot.coin_symbol || config.pair?.split('/')[0] || bot.quote_currency || ''}`;
                } else if (profitMode === 'HYBRID' || (profitCoin > 0 && profit > 0)) {
                    displayProfit = "HYBRID_DISPLAY";
                } else {
                    displayProfit = `${profit >= 0 ? '+' : '-'}$${Math.abs(profit).toFixed(2)}`;
                }

                const themeText = '#00FF9D';
                const themeColor = '#00FF9D';

                return (
                    <div
                        key={bId}
                        onClick={() => navigate(`/dashboard/bot/${bId}`)}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#131B1F] p-4 rounded-xl border border-white/5 hover:border-[#00FF9D]/30 transition group cursor-pointer relative overflow-hidden"
                    >
                        {/* Action Loading Overlay */}
                        {isActionLoading && (
                            <div className="absolute inset-0 bg-[#0A1014]/90 z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
                                <Loader2 className="animate-spin mb-1 text-[#00FF9D]" size={24} />
                                <p className="text-[10px] font-bold text-[#00FF9D] animate-pulse">Processing...</p>
                            </div>
                        )}

                        {/* Left: Icon & Info */}
                        <div className="flex items-center gap-4 w-full md:w-1/4 mb-4 md:mb-0">
                            <div className="w-10 h-10 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-white/5 shrink-0 relative">
                                <img
                                    src={`/icons/${(bot.trading_pair || bot.pair || bot.quote_currency || 'BTC').split('/')[0]?.toLowerCase() || 'btc'}.png`}
                                    alt="Coin"
                                    className="w-6 h-6 rounded-full"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/icons/btc.png';
                                    }}
                                />
                                <ExchangeBadge exchange={bot.exchange_name} className="md:-bottom-1 md:-right-1" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-bold text-sm">{bot.bot_name || `${bot.quote_currency || 'BTC'}/USDT Grid`}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#00FF9D] shadow-[0_0_5px_lime]' : isStarting ? 'bg-yellow-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                                    <span className={`text-[10px] font-mono ${isRunning ? 'text-gray-400' : 'text-yellow-500'}`}>
                                        {bot.status === 'RUNNING' ? 'Running' : bot.status === 'STARTING' ? 'Starting...' : bot.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Middle: Sparkline - Smaller width */}
                        <div className="hidden md:block flex-[0.4] h-12 px-8">
                            <BotSparkline color={isPositive ? themeColor : "#EF4444"} data={bot.sparkline || []} />
                        </div>

                        {/* Right Section: Values & Actions */}
                        <div className="flex items-center justify-between gap-1 md:gap-4 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                            {/* Investment */}
                            <div className="text-left md:text-right flex flex-col items-start md:items-end w-auto md:w-28 shrink-0">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Capital</p>
                                <p className="text-sm font-bold text-white">${bot.invested_capital || '0'}</p>
                            </div>

                            {/* Profit */}
                            <div className="text-center md:text-right flex flex-col items-center md:items-end w-auto md:w-28 shrink-0 px-1 md:px-0">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Total profit</p>
                                {displayProfit === "HYBRID_DISPLAY" ? (
                                    <div className="flex flex-col items-end">
                                        <p className={`text-sm font-bold ${profit >= 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                            {profit >= 0 ? '+' : '-'}${Math.abs(profit).toFixed(2)}
                                        </p>
                                        <p className="text-[10px] font-bold text-[#00FF9D]">
                                            +{profitCoin.toFixed(4)} {bot.coin_symbol || config.pair?.split('/')[0] || ''}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <p className={`text-sm font-bold ${isPositive ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                            {displayProfit}
                                        </p>
                                        {profitCoinValue > 0 && displayProfit !== "----" && !displayProfit.startsWith('$') && (
                                            <p className="text-[10px] font-bold text-gray-500">
                                                ≈ ${profitCoinValue.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 md:gap-2 w-auto justify-end shrink-0 ml-auto">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/bot/${bId}`);
                                    }}
                                    className="p-2 rounded-xl text-gray-500 hover:text-[#00FF9D] hover:bg-[#00FF9D]/10 transition-all duration-300"
                                    title="Bot Settings"
                                >
                                    <Settings2 size={18} />
                                </button>
                                <button
                                    onClick={(e) => handleToggleBot(e, bId, bot.status)}
                                    disabled={!!isActionLoading || isStarting}
                                    className={`p-2 rounded-xl transition-all duration-300 ${isRunning ? 'text-red-400 hover:bg-red-500/10' : 'text-[#00FF9D] hover:bg-[#00FF9D]/10'}`}
                                    title={isRunning ? "Stop Bot" : "Start Bot"}
                                >
                                    {isRunning ? <Pause size={18} /> : isStarting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                                </button>
                                <button
                                    onClick={(e) => handleDeleteBot(e, bId)}
                                    disabled={!!isActionLoading || isStarting}
                                    className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                                    title="Delete Bot"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={handleConfirmAction}
                title="Delete Bot?"
                message="Are you sure you want to delete this bot?"
                confirmText="Delete Bot"
                cancelText="Cancel"
                isDangerous={true}
                isLoading={confirmModal.isLoading}
            />
        </div>
    );
};

export default ActiveBots;
