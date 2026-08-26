import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Play, Pause, Trash2, Edit } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
// import TradingViewWidget from '../../components/TradingViewWidget'; // Removed
// import TradingViewWidget from '../../components/TradingViewWidget'; // Removed
import GridChart from '../../components/GridChart'; // Added
import ConfigureBotModal from './ConfigureBotModal'; // <--- Import Modal
import API_BASE_URL from '../../config';
import { getToken } from '../../utils/token';
import { useTrading } from '../../context/TradingContext';
import { formatTokenPrice } from '../../utils/formatting';
import useAppNotifications from '../../hooks/useAppNotifications';

const BotDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isPaperTrading } = useTrading();
    const [bot, setBot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(""); // 'stopping' | 'starting' | 'deleting'
    const [activeTab, setActiveTab] = useState('orders');
    const [currentPrice, setCurrentPrice] = useState(0); // MOVED UP
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // <--- Edit Modal State
    const { notifyBotStatus } = useAppNotifications();

    // Theme Variables
    const themeColor = '#00FF9D';
    const themeText = 'text-[#00FF9D]';

    useEffect(() => {
        if (!bot) return;
        const fetchPrice = async () => {
            try {
                // Parse pair and exchange from bot config
                const config = typeof bot.config === 'string' ? JSON.parse(bot.config || '{}') : bot.config || {};
                const exchange = bot.exchange_name || 'BINANCE';
                // Override pair for Mock to avoid confusion
                const isMock = exchange.toLowerCase().includes('mock');
                const pair = isMock ? 'MOCK/USDT' : (config.pair || bot.quote_currency + '/USDT' || 'BTC/USDT');

                // Fetch real market price from candles API
                const token = localStorage.getItem('token');
                const res = await fetch(
                    `${API_BASE_URL}/user/market-candles?symbol=${encodeURIComponent(pair)}&exchange=${exchange}&timeframe=1m&limit=1`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (res.ok) {
                    const data = await res.json();
                    // API returns array directly: [{ time, open, high, low, close }, ...]
                    if (Array.isArray(data) && data.length > 0) {
                        // Use the close price of the latest candle
                        setCurrentPrice(data[data.length - 1].close);
                        return;
                    }
                }

                // Fallback to mid-grid price if candles fetch fails
                if (config.strategy) {
                    const midPrice = (config.strategy.upper_price + config.strategy.lower_price) / 2;
                    setCurrentPrice(midPrice);
                }
            } catch (e) {
                console.error("Failed to fetch market price", e);
            }
        };
        fetchPrice();

        // Refresh price every 30 seconds
        const interval = setInterval(fetchPrice, 30000);
        return () => clearInterval(interval);
    }, [bot]);

    const fetchBotDetails = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) return navigate('/signin');

        try {
            const res = await fetch(`${API_BASE_URL}/user/bot/${id}?trades_limit=5000`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const foundBot = await res.json();
                if (foundBot && !foundBot.message) {
                    setBot(foundBot);
                } else {
                    console.error("Bot not found with ID", id);
                }
            } else {
                console.error("Failed to fetch bot details");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBotDetails();
        // Removed polling as per user request
    }, [id, isPaperTrading]);

    const handleToggleBot = async () => {
        if (!bot) return;
        const currentStatus = bot.status;
        const isRunning = ['active', 'running', 'RUNNING'].includes(currentStatus);
        const action = isRunning ? 'stopping' : 'starting';
        setActionLoading(action);

        const token = getToken();

        try {
            const res = await fetch(`${API_BASE_URL}/user/bot/${bot.bot_id || bot.id}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to toggle");
            notifyBotStatus("Bot Status Changed", `Bot has been manually ${isRunning ? 'paused' : 'started'}.`);

            // --- SMART POLL ---
            // Wait for status to actually change
            let attempts = 0;
            const maxAttempts = 10; // 20 seconds max

            const pollInterval = setInterval(async () => {
                attempts++;

                // We use a separate fetch loop here to check status
                // But since fetchBotDetails updates state, we can just call it?
                // Actually, fetchBotDetails sets 'setLoading(true)' which might flicker the main UI.
                // We should implement a silent fetch or just use fetchBotDetails if we don't mind the global loader.
                // The user complained about the BUTTON loader stopping too early.

                // Let's do a silent fetch to check status
                try {
                    const checkRes = await fetch(`${API_BASE_URL}/user/bot/${id}?trades_limit=10`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (checkRes.ok) {
                        const foundBot = await checkRes.json();

                        if (foundBot && !foundBot.message) {
                            // Update the main state so the UI reflects it
                            setBot(foundBot);

                            const newStatus = foundBot.status;
                            const isNowRunning = ['active', 'running', 'RUNNING'].includes(newStatus);

                            // Condition to stop polling:
                            // If we were starting, we want running.
                            // If we were stopping, we want stopped/paused.
                            if (action === 'starting' && isNowRunning) {
                                clearInterval(pollInterval);
                                setActionLoading("");
                            } else if (action === 'stopping' && !isNowRunning) {
                                clearInterval(pollInterval);
                                setActionLoading("");
                            }
                        }
                    }
                } catch (e) {
                    console.error("Poll error", e);
                }

                if (attempts >= maxAttempts) {
                    clearInterval(pollInterval);
                    setActionLoading(""); // Give up
                }
            }, 2000);

            // We do NOT clear setActionLoading("") here! We let the poll handle it.
            // But we SHOULD run one immediate fetch just in case it was instant?
            await fetchBotDetails();

        } catch (e) {
            console.error(e);
            alert("Failed to change bot status.");
            setActionLoading("");
        }
    };

    const handleDeleteBot = async () => {
        if (!window.confirm("Are you sure you want to delete this bot?")) return;
        setActionLoading('deleting');
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/user/bot/${bot.bot_id || bot.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                notifyBotStatus("Bot Deleted", "Bot was successfully deleted.");
                navigate('/dashboard');
            } else {
                alert("Failed to delete bot");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading("");
        }
    };


    if (loading && !bot) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full min-h-screen">
                    <Loader2 className={`animate-spin ${themeText}`} size={48} />
                </div>
            </DashboardLayout>
        );
    }

    if (!bot) {
        return (
            <DashboardLayout>
                <main className="flex-1 p-6 md:p-10 relative z-10 flex flex-col items-center justify-center h-full">
                    <h2 className="text-2xl font-bold text-white mb-4">Bot Not Found</h2>
                    <button onClick={() => navigate('/dashboard')} className="text-[#00FF9D] hover:underline">Back to Dashboard</button>
                </main>
            </DashboardLayout>
        );
    }

    // Config logic
    const config = bot.config && typeof bot.config === 'string' ? JSON.parse(bot.config) : (bot.config || {});
    const profit = parseFloat(bot.total_profit || 0);
    const profitCoin = parseFloat(bot.total_profit_coin || 0);
    const hasProfit = profit >= 0;
    // Determine Exchange & Pair
    let exchange = bot.exchange_name || 'BINANCE';
    let pair = config.pair || bot.quote_currency + '/USDT' || 'BTC/USDT';

    // Mock Override: Force Pair & Exchange Name
    const isMock = exchange.toLowerCase().includes('mock') || pair === 'MOCK/USDT';

    if (isMock) {
        exchange = 'MOCK';
        pair = 'MOCK/USDT';
    }
    const isPositive = profit >= 0;

    // Grid Details
    const numGrids = config.strategy?.grids || 0;
    const priceRange = config.strategy ? `${config.strategy.lower_price} - ${config.strategy.upper_price}` : 'N/A';

    // -- HOISTED HOLDINGS CALCULATION --
    // Calculate Total Value & Percentages here so they are available for "Current Value" and "Current Holdings"

    // Fallback if no orders yet (e.g. just started or error)
    // If we really need live price, we should hit an endpoint.
    // But for "Wallet Value" display, the mid-grid price is usually sufficient.
    const estimatedPrice = currentPrice || (config.strategy ? (config.strategy.upper_price + config.strategy.lower_price) / 2 : 0);

    let valBase = 0, valQuote = 0, totalVal = 0;
    let lockedVal = 0;
    let basePct = 0, quotePct = 0;

    if (bot.holdings) {
        valBase = bot.holdings.base * estimatedPrice;
        valQuote = bot.holdings.quote;
        totalVal = valBase + valQuote;

        // Calculate Locked Value (Value of assets strictly in active orders)
        // Note: locked_quote is already in USDT. locked_base needs conversion.
        const lockedBaseVal = (bot.holdings.locked_base || 0) * estimatedPrice;
        const lockedQuoteVal = (bot.holdings.locked_quote || 0);
        lockedVal = lockedBaseVal + lockedQuoteVal;


        const safeTotalVal = totalVal || 1;
        basePct = (valBase / safeTotalVal) * 100;
        quotePct = (valQuote / safeTotalVal) * 100;
    }
    // -- END HOISTED CALCULATIONS --

    return (
        <DashboardLayout>
            <main className="flex-1 p-4 md:p-8 relative z-10 flex flex-col h-full overflow-y-auto w-full pb-24 md:pb-6">

                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors bg-[#0A1014] p-2 rounded-lg border border-white/5 hover:border-white/20">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Bot Details</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{pair}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${['active', 'running', 'RUNNING'].includes(bot.status) ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{bot.status}</span>
                            </div>
                        </div>
                    </div>

                </header>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* LEFT COLUMN: CHART (Large) */}
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                        <div className="bg-[#0A1014] border border-white/10 rounded-3xl h-[600px] relative overflow-hidden flex flex-col p-1">
                            {/* Chart Header Overlay could go here */}
                            {/* Chart Header Overlay could go here */}
                            <GridChart
                                exchange={exchange}
                                pair={pair}
                                gridLines={bot.open_orders?.lines || []}
                            />
                        </div>



                        <div className="bg-[#0A1014] border border-white/10 rounded-3xl p-6 min-h-[300px]">
                            {/* TABS: Grid Orders vs Execution History */}
                            <div className="flex justify-between items-center mb-4 bg-[#131B1F] p-1 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-1/2 text-center py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'orders' ? 'bg-[#00FF9D] text-black shadow-lg shadow-[#00FF9D]/20' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Grid Orders ({numGrids})
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`w-1/2 text-center py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'history' ? 'bg-[#00FF9D] text-black shadow-lg shadow-[#00FF9D]/20' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Execution History
                                </button>
                            </div>

                            {/* CONTENT */}
                            {activeTab === 'orders' ? (
                                <>
                                    <div className="grid grid-cols-4 text-[10px] text-gray-500 uppercase font-bold px-4 mb-2">
                                        <span>Price (USDT)</span>
                                        <span>Amount</span>
                                        <span>Total (USDT)</span>
                                        <span className="text-right">Status</span>
                                    </div>
                                    <div
                                        className="space-y-1 max-h-[645px] overflow-y-auto pr-2 custom-scrollbar overscroll-contain"
                                        onWheel={(e) => {
                                            const container = e.currentTarget;
                                            const isScrollable = container.scrollHeight > container.clientHeight;
                                            if (isScrollable) {
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                        {bot.open_orders && bot.open_orders.lines && bot.open_orders.lines.length > 0 ? (
                                            [...bot.open_orders.lines]
                                                .sort((a, b) => b.price - a.price)
                                                .map((order, i) => {
                                                    const total = (order.price * order.qty).toFixed(2);
                                                    const isBuy = order.side === 'buy';
                                                    return (
                                                        <div key={i} className="grid grid-cols-4 text-xs px-4 py-3 bg-[#131B1F]/50 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                                            <span className="text-white font-mono">${formatTokenPrice(order.price)}</span>
                                                            <span className="text-gray-400">{order.qty.toFixed(4)}</span>
                                                            <span className="text-gray-400">${total}</span>
                                                            <span className="text-right flex justify-end">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isBuy ? 'border-green-500/30 text-green-500 bg-green-500/10' : 'border-red-500/30 text-red-500 bg-red-500/10'}`}>
                                                                    {isBuy ? 'BUY OPEN' : 'SELL OPEN'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <div className="col-span-4 text-center py-10 text-gray-500 text-xs italic">
                                                No active grid orders found.
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* EXECUTION HISTORY TABLE */}
                                    {/* EXECUTION HISTORY TABLE */}
                                    <div className="grid grid-cols-6 text-[10px] text-gray-500 uppercase font-bold px-4 mb-2">
                                        <span>Time</span>
                                        <span>Side</span>
                                        <span>Price</span>
                                        <span>Amount</span>
                                        <span>Fee</span>
                                        <span className="text-right">Profit</span>
                                    </div>
                                    <div
                                        className="space-y-1 max-h-[645px] overflow-y-auto pr-2 custom-scrollbar overscroll-contain"
                                        onWheel={(e) => {
                                            const container = e.currentTarget;
                                            const isScrollable = container.scrollHeight > container.clientHeight;
                                            if (isScrollable) {
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                        {bot.recent_trades && bot.recent_trades.length > 0 ? (
                                            bot.recent_trades.map((trade, i) => {
                                                const isBuy = trade.side === 'buy';
                                                const dateStr = trade.timestamp || "";
                                                // Check for 'Z' or timezone offset ('+')
                                                const finalDateStr = (dateStr.endsWith("Z") || dateStr.includes("+")) ? dateStr : dateStr + "Z";

                                                return (
                                                    <div key={i} className="grid grid-cols-6 text-xs px-4 py-3 bg-[#131B1F]/50 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                                        <span className="text-gray-400 text-[11px]">
                                                            {new Date(finalDateStr).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className={`font-bold ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                                                            {isBuy ? 'BUY' : 'SELL'}
                                                        </span>
                                                        <span className="text-white font-mono">${formatTokenPrice(trade.price)}</span>
                                                        <span className="text-gray-400">{trade.qty.toFixed(4)}</span>
                                                        <span className="text-gray-500 text-[10px]">
                                                            {(() => {
                                                                if (!trade.fee) return "0.00 USDT";
                                                                const baseCurrency = pair.split('/')[0];
                                                                const quoteCurrency = pair.split('/')[1] || 'USDT';
                                                                // If fee is in base currency (coin), convert to USDT
                                                                if (trade.fee_currency === baseCurrency) {
                                                                    const feeInUsdt = trade.fee * trade.price;
                                                                    return `${feeInUsdt.toFixed(4)} ${quoteCurrency}`;
                                                                }
                                                                return `${trade.fee.toFixed(4)} ${trade.fee_currency || quoteCurrency}`;
                                                            })()}
                                                        </span>
                                                        <span className={`text-right font-mono ${trade.profit > 0 ? 'text-[#00FF9D]' : 'text-gray-500'}`}>
                                                            {trade.profit > 0 ? (
                                                                trade.side === 'buy'
                                                                    ? `+${parseFloat(trade.profit).toFixed(4)} ${pair.split('/')[0]}`
                                                                    : `+$${parseFloat(trade.profit).toFixed(2)}`
                                                            ) : '-'}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-4 text-center py-10 text-gray-500 text-xs italic flex flex-col items-center gap-2">
                                                <span>No trades executed yet.</span>
                                                <span className="text-[10px] opacity-50">Wait for price to cross grid lines.</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: STATS & CONTROLS */}
                    <div className="w-full lg:w-[400px] xl:w-[450px] space-y-6">

                        {/* Main Status & Controls Card */}
                        <div className="bg-[#0A1014] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#131B1F] flex items-center justify-center border border-white/5 overflow-hidden shadow-lg">
                                        <img
                                            src={`/icons/${pair.split('/')[0].toLowerCase()}.png`}
                                            alt={pair.split('/')[0]}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/icons/btc.png'; }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{pair} Spot Grid</h3>
                                        <p className="text-xs text-gray-500">Running on {exchange.replace('_paper', '').toUpperCase()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/dashboard/edit/${bot.bot_id || bot.id}`, { state: { initialBot: bot } })}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                                    title="Edit Bot"
                                >
                                    <Edit size={16} className="text-gray-400" />
                                </button>
                            </div>

                            {/* P&L Large Display */}
                            <div className="bg-[#131B1F] rounded-2xl p-6 border border-white/5 mb-6">
                                <h3 className="text-zinc-400 text-sm mb-1 font-medium">Total Profit</h3>
                                <div className="flex items-end gap-3 flex-wrap">
                                    {(!['COIN_ONLY'].includes(config.strategy?.profit_mode || config.profitMode || config.profit_mode) || profit !== 0) && (
                                        <h1 className={`text-4xl font-bold ${hasProfit ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                            {hasProfit ? '+' : ''}${Math.abs(profit).toFixed(2)}
                                        </h1>
                                    )}
                                    <span className="text-gray-500 text-[10px]">Realized Profit from Grid Trades</span>
                                    {(profitCoin > 0 || ['COIN_ONLY'].includes(config.strategy?.profit_mode || config.profitMode || config.profit_mode)) && (
                                        <h1 className={`${(['COIN_ONLY'].includes(config.strategy?.profit_mode || config.profitMode || config.profit_mode) && profit === 0) ? 'text-4xl' : 'text-2xl mb-1'} font-bold ${profitCoin >= 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                            {profitCoin >= 0 ? '+' : ''}{profitCoin.toFixed(4)} {bot.coin_symbol || pair.split('/')[0] || bot.quote_currency || ''}
                                        </h1>
                                    )}
                                    <span className={`text-sm font-bold px-2 py-1 rounded bg-zinc-900/50 mb-1 ${hasProfit || profitCoin > 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                        {hasProfit || profitCoin > 0 ? '+' : ''}
                                        {bot.invested_capital > 0 ? (((profit + (profitCoin * estimatedPrice)) / parseFloat(bot.invested_capital)) * 100).toFixed(2) : '0.00'}%
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2">Realized Profit from Grid Trades</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Investment</p>
                                    <p className="text-white font-bold">${bot.invested_capital || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current Value</p>
                                    {/* Use Calculated Locked Value if available */}
                                    <p className="text-white font-bold">${bot.holdings ?
                                        (lockedVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                                        : (parseFloat(bot.invested_capital) + profit).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Grid Progress / Open Orders */}
                            <div className="mb-8">
                                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2">
                                    <span>Active Grids</span>
                                    {bot.open_orders ? (
                                        <span>
                                            <span className="text-green-500">{bot.open_orders.buy} Buys</span>
                                            <span className="mx-1">|</span>
                                            <span className="text-red-500">{bot.open_orders.sell} Sells</span>
                                            <span className="text-gray-600 ml-1">({bot.open_orders.total} Total)</span>
                                        </span>
                                    ) : (
                                        <span>Loading...</span>
                                    )}
                                </div>
                                <div className="w-full bg-[#1A2329] rounded-full h-2 overflow-hidden flex">
                                    {/* Buys (Green) */}
                                    <div
                                        className="h-full bg-[#00FF9D] shadow-[0_0_10px_#00FF9D]"
                                        style={{ width: bot.open_orders && bot.open_orders.total > 0 ? `${(bot.open_orders.buy / bot.open_orders.total) * 100}%` : '0%' }}
                                    ></div>
                                    {/* Sells (Red) */}
                                    <div
                                        className="h-full bg-red-500 shadow-[0_0_10px_#EF4444]"
                                        style={{ width: bot.open_orders && bot.open_orders.total > 0 ? `${(bot.open_orders.sell / bot.open_orders.total) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleToggleBot}
                                    disabled={!!actionLoading}
                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${['active', 'running', 'RUNNING'].includes(bot.status) ? 'bg-[#ffca28] hover:bg-[#ffb300] text-black' : 'bg-[#00FF9D] hover:bg-[#00cc7d] text-black'} ${actionLoading ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={18} /> : (['active', 'running', 'RUNNING'].includes(bot.status) ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />)}
                                    {['active', 'running', 'RUNNING'].includes(bot.status) ? 'Pause Bot' : 'Start Bot'}
                                </button>
                                <button onClick={handleDeleteBot} disabled={!!actionLoading} className="px-4 py-3 bg-[#131B1F] text-red-500 hover:bg-red-500/20 rounded-xl border border-white/5 hover:border-red-500/50 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                        </div>

                        {/* Current Holdings Card (Relocated) */}
                        <div className="bg-[#0A1014] border border-white/10 rounded-3xl p-6">
                            <h3 className="text-white font-bold text-sm mb-4 border-b border-white/5 pb-2">Current Holdings</h3>
                            {
                                bot.holdings ? (() => {
                                    // Variables are already calculated at top of component.
                                    // We just use them here.

                                    // SVG Dash Arrays
                                    // Circle is 100 units circumference (approx).
                                    // 1. Base (Green) starts at 0. length = basePct.
                                    // 2. Quote (Purple) starts after Base. length = quotePct.

                                    return (
                                        <div className="flex flex-col items-center">
                                            {/* Pie Chart (Centered on Top) */}
                                            <div className="relative w-48 h-48 mb-8 mt-2">
                                                <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                                                    {/* Background */}
                                                    <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />

                                                    {/* Segments */}
                                                    <path className="text-[#00FF9D]" strokeDasharray={`${basePct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                                    <path className="text-[#8B5CF6]" strokeDasharray={`${quotePct}, 100`} strokeDashoffset={`-${basePct}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <p className="text-xs text-gray-400">Total Value</p>
                                                    <p className="text-white font-bold text-xl">${totalVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                                </div>
                                            </div>

                                            {/* Data List (Below Chart) */}
                                            <div className="w-full space-y-4">
                                                {/* SOL Holdings */}
                                                <div>
                                                    <div className="flex items-center justify-between gap-4 mb-1">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-2">
                                                            <img
                                                                src={`/icons/${pair.split('/')[0].toLowerCase()}.png`}
                                                                alt={pair.split('/')[0]}
                                                                className="w-5 h-5 object-contain"
                                                                onError={(e) => { e.target.src = '/icons/btc.png'; }}
                                                            />
                                                            {pair.split('/')[0]} Holdings
                                                        </p>
                                                        <span className="text-[10px] text-[#00FF9D] bg-[#00FF9D]/10 px-1.5 py-0.5 rounded font-mono">
                                                            {basePct.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center pl-4">
                                                        <p className="text-white font-bold text-sm leading-none">{bot.holdings.base.toFixed(4)} <span className="text-xs text-gray-500">{pair.split('/')[0]}</span></p>
                                                        <p className="text-xs text-gray-500 font-mono">${valBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                                    </div>
                                                </div>

                                                {/* USDT Holdings */}
                                                <div>
                                                    <div className="flex items-center justify-between gap-4 mb-1">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-2">
                                                            <img
                                                                src={`/icons/${pair.split('/')[1].toLowerCase()}.png`}
                                                                alt={pair.split('/')[1]}
                                                                className="w-5 h-5 object-contain"
                                                                onError={(e) => { e.target.src = '/icons/usdt.png'; }}
                                                            />
                                                            {pair.split('/')[1]} Holdings
                                                        </p>
                                                        <span className="text-[10px] text-[#8B5CF6] bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded font-mono">
                                                            {quotePct.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center pl-4">
                                                        <p className="text-white font-bold text-sm leading-none">{bot.holdings.quote.toFixed(2)} <span className="text-xs text-gray-500">{pair.split('/')[1]}</span></p>
                                                        <p className="text-xs text-gray-500 font-mono">${valQuote.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <div className="text-center text-xs text-gray-500 py-4">Loading Holdings...</div>
                                )
                            }
                        </div>

                        {/* Bot Configuration Card (Small) */}
                        <div className="bg-[#0A1014] border border-white/10 rounded-3xl p-6">
                            <h3 className="text-white font-bold text-sm mb-4 border-b border-white/5 pb-2">Bot Configuration</h3>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Grid Type</span>
                                    <span className="text-white font-mono capitalize">{config.strategy?.grid_type || 'Arithmetic'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Price Range</span>
                                    <span className="text-white font-mono">{priceRange}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Grids</span>
                                    <span className="text-white font-mono">{numGrids}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Trailing Up</span>
                                    <span className={`font-mono ${config.strategy?.trailing_up ? 'text-[#00FF9D]' : 'text-gray-500'}`}>
                                        {config.strategy?.trailing_up ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Trailing Down</span>
                                    <span className={`font-mono ${config.strategy?.trailing_down ? 'text-[#00FF9D]' : 'text-gray-500'}`}>
                                        {config.strategy?.trailing_down ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Take Profit</span>
                                    <span className={`font-mono ${config.risk_management?.take_profit?.enabled ? 'text-[#00FF9D]' : 'text-gray-500'}`}>
                                        {config.risk_management?.take_profit?.enabled
                                            ? `$${parseFloat(config.risk_management.take_profit.threshold).toFixed(2)}`
                                            : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Stop Loss</span>
                                    <span className={`font-mono ${config.risk_management?.stop_loss?.enabled ? 'text-red-500' : 'text-gray-500'}`}>
                                        {config.risk_management?.stop_loss?.enabled
                                            ? `$${parseFloat(config.risk_management.stop_loss.threshold).toFixed(2)}`
                                            : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Profit/Grid</span>
                                    {/* Calculate approx profit per grid if not explicitly saved */}
                                    <span className="text-[#00FF9D] font-mono">
                                        {config.strategy?.profit_per_grid
                                            ? `${config.strategy.profit_per_grid}%`
                                            : (config.strategy && config.strategy.upper_price && config.strategy.lower_price && numGrids
                                                ? `${((((config.strategy.upper_price - config.strategy.lower_price) / numGrids) / config.strategy.lower_price) * 100).toFixed(2)}%`
                                                : '0.50%')}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/5">
                                    <span className="text-gray-500">Stop Loss</span>
                                    <span className={`font-bold ${config.strategy?.stop_loss ? 'text-red-500' : 'text-gray-400'}`}>
                                        {config.strategy?.stop_loss ? `Enabled (-${config.strategy.stop_loss}%)` : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div >

                    </div >

                </div>

            </main>
            {/* Edit Modal */}
            <ConfigureBotModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                botType="SPOT GRID"
                initialBot={bot}
                onSuccess={() => {
                    fetchBotDetails();
                    setIsEditModalOpen(false);
                }}
            />
        </DashboardLayout>
    );
};

export default BotDetails;
