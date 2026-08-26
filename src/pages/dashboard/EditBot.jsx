
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Search, Loader2, Settings, ArrowLeft, Edit, AlertTriangle, Sparkles } from 'lucide-react';
import API_BASE_URL from '../../config';
import { useTrading } from '../../context/TradingContext';
import { useToast } from '../../context/ToastContext';
import { getToken } from '../../utils/token';
import DashboardLayout from '../../components/DashboardLayout';
import GridChart from '../../components/GridChart';
// import ActiveBots from '../../components/ActiveBots'; // Removed for Edit Mode
import useAppNotifications from '../../hooks/useAppNotifications';

import { getSortedPairs } from '../../data/pairs';

const ALL_PAIRS = getSortedPairs();

const EditBot = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isPaperTrading } = useTrading();
    const { addToast } = useToast();
    const { notifyBotStatus } = useAppNotifications();

    // Use state.initialBot if available, otherwise will fetch
    const [initialBot, setInitialBot] = useState(state?.initialBot || null);
    const [isLoadingBot, setIsLoadingBot] = useState(!state?.initialBot);

    // --- STATE ---
    const [config, setConfig] = useState({
        exchange: '',
        pair: '',
        investment: 0,
        grids: 0,
        upperPrice: 0,
        lowerPrice: 0,
        trailingUp: false,
        trailingDown: false,
        stopLoss: 0,
        takeProfit: 0,
        gridType: 'Geometric',
        orderSizeType: 'quote',
        // Profit Strategy Settings
        profitMode: 'USDT_ONLY',
        fiatProfitStyle: 'SPLIT',
        profitSplitRatio: 0.5
    });

    const [addedInvestment, setAddedInvestment] = useState(0);
    const [mode, setMode] = useState('manual');
    const [activeTab, setActiveTab] = useState('orders');

    // UI Helpers
    const [fetchedPrice, setFetchedPrice] = useState(0);
    const [creating, setCreating] = useState(false);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const [connectedExchanges, setConnectedExchanges] = useState([]);

    // --- FETCH BOT IF NEEDED ---
    useEffect(() => {
        if (!initialBot && id) {
            const fetchBot = async () => {
                setIsLoadingBot(true);
                const token = getToken();
                if (!token) return;
                try {
                    const res = await fetch(`${API_BASE_URL}/user/bots?mode=${isPaperTrading ? 'paper' : 'live'}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const bots = await res.json();
                        const found = bots.find(b => (b.bot_id || b.id).toString() === id);
                        if (found) {
                            setInitialBot(found);
                        } else {
                            addToast("Bot not found", "error");
                            navigate('/dashboard');
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch bot", e);
                } finally {
                    setIsLoadingBot(false);
                }
            };
            fetchBot();
        } else if (initialBot) {
            setIsLoadingBot(false);
        }
    }, [id, initialBot, isPaperTrading]);

    // --- INITIALIZE CONFIG ---
    useEffect(() => {
        if (initialBot) {
            const cfg = typeof initialBot.config === 'string' ? JSON.parse(initialBot.config) : initialBot.config;
            const strat = cfg.strategy || {};
            setConfig({
                exchange: cfg.exchange || '',
                pair: cfg.pair || '',
                investment: parseFloat(strat.investment || 0),
                grids: parseInt(strat.grids || 20),
                upperPrice: parseFloat(strat.upper_price || 0),
                lowerPrice: parseFloat(strat.lower_price || 0),
                trailingUp: !!strat.trailing_up,
                trailingDown: !!strat.trailing_down,
                stopLoss: parseFloat(cfg.risk_management?.stop_loss?.threshold || 0),
                takeProfit: parseFloat(cfg.risk_management?.take_profit?.threshold || 0),
                gridType: (strat.grid_type === 'GEOMETRIC') ? 'Geometric' : 'Arithmetic',
                orderSizeType: strat.order_size_type || 'quote',
                // Map Legacy/New Settings
                profitMode: strat.profit_mode || (strat.profit_currency_type === 'base' ? 'COIN_ONLY' : 'USDT_ONLY'),
                fiatProfitStyle: strat.fiat_profit_style || 'SPLIT',
                profitSplitRatio: parseFloat(strat.profit_split_ratio || 0.5)
            });
            setMode('manual');
        }
    }, [initialBot]);

    // --- CONTROL HIERARCHY AUTO-CORRECTION ---
    useEffect(() => {
        setConfig(prev => {
            let newConfig = { ...prev };
            let changed = false;

            if (newConfig.gridType === 'Arithmetic' && newConfig.orderSizeType !== 'base') {
                newConfig.orderSizeType = 'base';
                changed = true;
            }

            if (newConfig.orderSizeType === 'base') {
                if (newConfig.trailingUp) {
                    newConfig.trailingUp = false;
                    changed = true;
                }
                if (newConfig.profitMode && newConfig.profitMode !== 'USDT_ONLY') {
                    newConfig.profitMode = 'USDT_ONLY';
                    changed = true;
                }
                if (newConfig.fiatProfitStyle && newConfig.fiatProfitStyle !== 'INSTANT') {
                    newConfig.fiatProfitStyle = 'INSTANT';
                    changed = true;
                }
            }
            return changed ? newConfig : prev;
        });
    }, [config.gridType, config.orderSizeType]);

    // --- 2. FETCH BALANCE ---
    useEffect(() => {
        const fetchBalance = async () => {
            setBalanceLoading(true);
            const token = getToken();
            if (!token) {
                setBalanceLoading(false);
                return;
            }
            try {
                const modeQuery = isPaperTrading ? '?mode=paper' : '?mode=live';
                const res = await fetch(`${API_BASE_URL}/user/dashboard${modeQuery}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Use actual available balance from dashboard API
                    setAvailableBalance(parseFloat(data.balances?.available || 0));
                }
            } catch (e) {
                console.error(e);
                addToast("Failed to fetch balance", "error");
            } finally {
                setBalanceLoading(false);
            }
        };
        fetchBalance();
    }, [isPaperTrading]);


    // --- 3. FETCH PRICE & AUTO CALC ---
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const exch = config.exchange ? config.exchange.toLowerCase() : 'binance';
                const url = `${API_BASE_URL}/user/market-data?exchange=${exch}&symbol=${config.pair}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    let price = parseFloat(data.price);
                    if (!price && data.bids && data.bids.length) {
                        price = (parseFloat(data.bids[0][0]) + parseFloat(data.asks[0][0])) / 2;
                    }
                    if (price > 0) {
                        setFetchedPrice(price);

                        // IF AUTO MODE: Recalculate Range
                        if (mode === 'auto' && !initialBot) {
                            const rangePercent = 0.10; // 10% +/- = 20% Range
                            setConfig(prev => ({
                                ...prev,
                                upperPrice: parseFloat((price * (1 + rangePercent)).toFixed(4)),
                                lowerPrice: parseFloat((price * (1 - rangePercent)).toFixed(4)),
                                grids: 30 // Default Grids
                            }));
                        }
                    }
                }
            } catch (e) {
                console.error("Price fetch failed", e);
            }
        };
        fetchPrice();
        // Poll every 10s
        const interval = setInterval(fetchPrice, 10000);
        return () => clearInterval(interval);
    }, [config.pair, config.exchange, mode, initialBot]); // Dependency on mode allows switching to Auto to re-trigger


    // --- HANDLERS ---
    const handleSliderChange = (percent) => {
        // Percent 0-100
        const rawAmount = availableBalance * (percent / 100);
        // Floor to 2 decimal places instead of rounding to prevent exceeding available balance
        const amount = Math.floor(rawAmount * 100) / 100;
        // If Editing: Set ADDED investment
        // If Creating: Set TOTAL investment
        if (initialBot) {
            setAddedInvestment(amount);
        } else {
            setConfig(prev => ({ ...prev, investment: amount }));
        }
    };

    const handleInvestmentInput = (val) => {
        const amount = parseFloat(val);
        if (initialBot) {
            setAddedInvestment(isNaN(amount) ? 0 : amount);
        } else {
            setConfig(prev => ({ ...prev, investment: isNaN(amount) ? 0 : amount }));
        }
    };



    const handleDeploy = async () => {
        if (creating) return;

        // Basic Validation
        const amountToCheck = initialBot ? addedInvestment : config.investment;
        if (amountToCheck > availableBalance) {
            addToast("Insufficient Balance", "error");
            return;
        }
        if (config.upperPrice <= config.lowerPrice) {
            addToast("Invalid Price Range", "error");
            return;
        }

        setCreating(true);

        const finalInvestment = initialBot
            ? config.investment + addedInvestment // Old Total + Added
            : config.investment;

        const payload = {
            bot_name: initialBot ? initialBot.bot_name : `${config.pair} Grid Bot`,
            quote_currency: config.pair.split('/')[0],
            bot_type: 'GRID',
            status: 'active',
            mode: isPaperTrading ? 'paper' : 'live',
            added_investment: initialBot ? addedInvestment : 0,
            config: {
                exchange: config.exchange,
                pair: config.pair,
                mode: isPaperTrading ? 'paper' : 'live',
                strategy: {
                    upper_price: parseFloat(config.upperPrice),
                    lower_price: parseFloat(config.lowerPrice),
                    grids: parseInt(config.grids),
                    investment: finalInvestment,
                    trailing_up: config.trailingUp,
                    trailing_down: config.trailingDown,
                    grid_type: config.gridType.toUpperCase(),
                    order_size_type: config.orderSizeType,
                    // New Profit Strategy Fields
                    profit_mode: config.profitMode,
                    fiat_profit_style: config.fiatProfitStyle,
                    profit_split_ratio: config.profitSplitRatio,
                    // Legacy Fallback (optional, but good for safety)
                    profit_currency_type: config.profitMode === 'COIN_ONLY' ? 'base' : 'quote',
                },
                risk_management: {
                    stop_loss: { enabled: config.stopLoss > 0, threshold: config.stopLoss },
                    take_profit: { enabled: config.takeProfit > 0, threshold: config.takeProfit }
                }
            }
        };

        try {
            const token = getToken();
            const url = initialBot
                ? `${API_BASE_URL}/user/bot/${initialBot.bot_id || initialBot.id}`
                : `${API_BASE_URL}/user/bot`;
            const method = initialBot ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                const botId = data.bot_id;

                // Poll until RUNNING
                let attempts = 0;
                while (attempts < 60) { // 60s timeout
                    await new Promise(r => setTimeout(r, 1000));
                    try {
                        // Cache busting: Add timestamp to prevent 304 Not Modified on polling
                        const pollRes = await fetch(`${API_BASE_URL}/user/bots?mode=${isPaperTrading ? 'paper' : 'live'}&_t=${Date.now()}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Pragma': 'no-cache',
                                'Cache-Control': 'no-cache'
                            },
                        });
                        if (pollRes.ok) {
                            const bots = await pollRes.json();
                            const myBot = bots.find(b => (b.bot_id === botId || b.id === botId));

                            // Check for success or final failure
                            if (myBot) {
                                // SUCCESS: Bot is RUNNING
                                if (myBot.status === 'RUNNING' || myBot.status === 'running') {
                                    addToast("Orders placed successfully! Redirecting to dashboard...", "success");
                                    notifyBotStatus("Bot Updated", `${config.pair} Spot Grid Bot has been successfully updated.`);
                                    navigate('/dashboard');
                                    return;
                                }
                                // LOADING: Bot is STARTING
                                else if (myBot.status === 'STARTING' || myBot.status === 'starting') {
                                    // Still loading... continue loop
                                }
                                // FAILURE: Bot crashed or error
                                else if (['crashed', 'error', 'stopped', 'CRASHED'].includes(myBot.status)) {
                                    setCreating(false);
                                    addToast(`Bot failed to start. Status: ${myBot.status}`, "error");
                                    return;
                                }
                            }
                        }
                    } catch (e) { console.error(e); }
                    attempts++;
                }
                // Timeout - navigate anyway so user isn't stuck
                navigate('/dashboard');

            } else {
                const err = await res.json();
                addToast(err.message || "Failed", "error");
                setCreating(false);
            }
        } catch (e) {
            console.error(e);
            addToast("Connection Error", "error");
            setCreating(false);
        }
    };

    // --- PREVIEW LINES CALCULATION ---
    const previewLines = useMemo(() => {
        if (!config.upperPrice || !config.lowerPrice || !config.grids) return [];

        const lines = [];
        const isGeometric = config.gridType === 'Geometric';

        for (let i = 1; i <= config.grids; i++) {
            let price;
            if (isGeometric) {
                const ratio = Math.pow(config.upperPrice / config.lowerPrice, 1 / config.grids);
                price = config.lowerPrice * Math.pow(ratio, i);
            } else {
                const step = (config.upperPrice - config.lowerPrice) / config.grids;
                price = config.lowerPrice + (step * i);
            }

            // Also add lower price as first line? Usually n grids = n lines. 
            // If i=1..grids, we get lines ending at upperPrice.
            // Let's stick to this for now.

            lines.push({
                price: price,
                qty: 0, // Placeholder
                side: price < fetchedPrice ? 'buy' : 'sell'
            });
        }

        // Ensure Lower Price is also visualized? 
        // Typically grids are the lines BETWEEN range.
        // Let's add the LOWER bound too if needed.
        // For now, let's just add the calculated steps.

        return lines;
    }, [config.upperPrice, config.lowerPrice, config.grids, config.gridType, fetchedPrice]);


    // --- RENDER HELPERS ---


    const projectedHoldings = useMemo(() => {
        const inv = initialBot ? parseFloat(addedInvestment || 0) + parseFloat(config.investment || 0) : parseFloat(config.investment || 0);
        const reserve = inv * 0.01; // 1% Reserve
        const usable = inv - reserve;

        let buyRatio = 0.5;
        let sellRatio = 0.5;

        if (parseFloat(config.upperPrice) > parseFloat(config.lowerPrice) && fetchedPrice > 0) {
            const up = parseFloat(config.upperPrice);
            const low = parseFloat(config.lowerPrice);
            if (fetchedPrice >= up) {
                buyRatio = 1; sellRatio = 0;
            } else if (fetchedPrice <= low) {
                buyRatio = 0; sellRatio = 1;
            } else {
                const range = up - low;
                const pricePos = fetchedPrice - low;
                buyRatio = pricePos / range;
                sellRatio = 1 - buyRatio;
            }
        }

        const usdtVal = usable * buyRatio;
        const coinVal = usable * sellRatio;
        const coinQty = fetchedPrice > 0 ? coinVal / fetchedPrice : 0;

        // SVG Percents
        const reservePct = 1;
        const usdtPct = buyRatio * 99;
        const coinPct = sellRatio * 99;

        return { inv, reserve, usdtVal, coinVal, coinQty, reservePct, usdtPct, coinPct };
    }, [config.investment, addedInvestment, initialBot, config.upperPrice, config.lowerPrice, fetchedPrice]);

    // Calculate Real-Time Current Value (matching BotDetails.jsx static logic)
    const currentTotalValue = useMemo(() => {
        if (!initialBot) return 0;

        // Use Grid Mid-Price to match BotDetails exactly (which doesn't use live price)
        const up = parseFloat(config.upperPrice || 0);
        const low = parseFloat(config.lowerPrice || 0);
        const midPrice = (up + low) / 2;

        // Force use of midPrice if available, only fallback to fetchedPrice if midPrice is 0
        const effectivePrice = midPrice > 0 ? midPrice : fetchedPrice;

        if (initialBot.holdings) {
            const valBase = (initialBot.holdings.base || 0) * effectivePrice;
            const valQuote = (initialBot.holdings.quote || 0);
            const valReserve = (initialBot.holdings.reserve || 0);
            return valBase + valQuote + valReserve;
        }

        // Fallback
        return parseFloat(initialBot.invested_capital || 0) + parseFloat(initialBot.total_profit || 0);
    }, [initialBot, config.upperPrice, config.lowerPrice, fetchedPrice]);

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors bg-[#0A1014] p-2 rounded-lg border border-white/5 hover:border-white/20">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Edit Bot</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{config.pair} SPOT GRID</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                    {/* --- LEFT PANEL: CHART & ACTIVE BOTS --- */}
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                        <div className="bg-[#0A1014] border border-white/10 rounded-3xl h-[470px] relative overflow-hidden flex flex-col p-1">
                            <GridChart
                                exchange={config.exchange}
                                pair={config.pair}
                                gridLines={previewLines}
                                currentPrice={fetchedPrice}
                            />
                        </div>

                        <div className="bg-[#0A1014] border border-white/10 rounded-3xl p-6 flex-1 flex flex-col max-h-[1150px]">
                            {/* TABS: Grid Orders vs Execution History */}
                            <div className="flex justify-between items-center mb-4 bg-[#131B1F] p-1 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-1/2 text-center py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'orders' ? 'bg-[#00FF9D] text-black shadow-lg shadow-[#00FF9D]/20' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Grid Orders ({initialBot?.open_orders?.lines?.length || 0})
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
                                <div className="flex flex-col flex-1 min-h-0">
                                    <div className="grid grid-cols-4 text-[10px] text-gray-500 uppercase font-bold px-4 mb-2">
                                        <span>Price (USDT)</span>
                                        <span>Amount</span>
                                        <span>Total (USDT)</span>
                                        <span className="text-right">Status</span>
                                    </div>
                                    <div
                                        className="space-y-1 flex-1 overflow-y-auto pr-2 custom-scrollbar overscroll-contain"
                                        onWheel={(e) => {
                                            const container = e.currentTarget;
                                            const isScrollable = container.scrollHeight > container.clientHeight;
                                            if (isScrollable) {
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                        {initialBot?.open_orders && initialBot.open_orders.lines && initialBot.open_orders.lines.length > 0 ? (
                                            [...initialBot.open_orders.lines]
                                                .sort((a, b) => b.price - a.price)
                                                .map((order, i) => {
                                                    const total = (order.price * order.qty).toFixed(2);
                                                    const isBuy = order.side === 'buy';
                                                    return (
                                                        <div key={i} className="grid grid-cols-4 text-xs px-4 py-3 bg-[#131B1F]/50 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                                            <span className="text-white font-mono">${order.price.toFixed(2)}</span>
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
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1 min-h-0">
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
                                        className="space-y-1 flex-1 overflow-y-auto pr-2 custom-scrollbar overscroll-contain"
                                        onWheel={(e) => {
                                            const container = e.currentTarget;
                                            const isScrollable = container.scrollHeight > container.clientHeight;
                                            if (isScrollable) {
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                        {initialBot?.recent_trades && initialBot.recent_trades.length > 0 ? (
                                            initialBot.recent_trades.map((trade, i) => {
                                                const isBuy = trade.side === 'buy';
                                                const dateStr = trade.timestamp || "";
                                                const finalDateStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";

                                                return (
                                                    <div key={i} className="grid grid-cols-6 text-xs px-4 py-3 bg-[#131B1F]/50 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                                        <span className="text-gray-400 text-[11px]">
                                                            {new Date(finalDateStr).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className={`font-bold ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                                                            {isBuy ? 'BUY' : 'SELL'}
                                                        </span>
                                                        <span className="text-white font-mono">${trade.price.toFixed(2)}</span>
                                                        <span className="text-gray-400">{trade.qty.toFixed(4)}</span>
                                                        <span className="text-gray-500 text-[10px]">
                                                            {(() => {
                                                                if (!trade.fee) return "0.00 USDT";
                                                                const baseCurrency = config.pair.split('/')[0];
                                                                const quoteCurrency = config.pair.split('/')[1] || 'USDT';
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
                                                                    ? `+${parseFloat(trade.profit).toFixed(4)} ${config.pair ? config.pair.split('/')[0] : ''}`
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
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT PANEL: CONFIGURATION FORM --- */}
                    <div className="w-full lg:w-[400px] xl:w-[450px] bg-[#0A1014] border border-white/5 rounded-3xl p-6 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                        {isLoadingBot ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <Loader2 className="animate-spin text-[#00FF9D] mb-4" size={32} />
                                <span className="text-gray-400">Loading bot details...</span>
                            </div>
                        ) : initialBot ? (
                            <div className="mb-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#131B1F] flex items-center justify-center border border-white/5 overflow-hidden shadow-lg">
                                            <img
                                                src={`/icons/${(config.pair || 'BTC/USDT').split('/')[0].toLowerCase()}.png`}
                                                alt={config.pair}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/icons/btc.png'; }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{config.pair} Spot Grid</h3>
                                            <p className="text-xs text-gray-500">Running on {config.exchange?.replace('_paper', '').toUpperCase() || 'EXCHANGE'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profit Display */}
                                <div className="bg-[#131B1F] rounded-2xl p-6 border border-white/5 mb-6">
                                    <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Total Grid Profit</p>
                                    <div className="flex items-baseline gap-3 flex-wrap">
                                        {(!['COIN_ONLY'].includes(config.strategy?.profit_mode || config.profitMode || config.profit_mode) || parseFloat(initialBot.total_profit || 0) !== 0) && (
                                            <h2 className={`text-4xl font-bold ${parseFloat(initialBot.total_profit || 0) >= 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                                {parseFloat(initialBot.total_profit || 0) >= 0 ? '+' : ''}${Math.abs(parseFloat(initialBot.total_profit || 0)).toFixed(2)}
                                            </h2>
                                        )}
                                        {(parseFloat(initialBot.total_profit_coin || 0) > 0 || ['COIN_ONLY'].includes(config.strategy?.profit_mode || config.profitMode || config.profit_mode)) && (
                                            <h2 className={`${(['COIN_ONLY'].includes(config.strategy?.profit_mode || config.profitMode || config.profit_mode) && parseFloat(initialBot.total_profit || 0) === 0) ? 'text-4xl' : 'text-2xl mt-1'} font-bold ${parseFloat(initialBot.total_profit_coin || 0) >= 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                                {parseFloat(initialBot.total_profit_coin || 0) >= 0 ? '+' : ''}{parseFloat(initialBot.total_profit_coin || 0).toFixed(4)} {initialBot.coin_symbol || config.pair?.split('/')[0] || ''}
                                            </h2>
                                        )}
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${parseFloat(initialBot.total_profit || 0) >= 0 || parseFloat(initialBot.total_profit_coin || 0) > 0 ? 'bg-[#00FF9D]/20 text-[#00FF9D]' : 'bg-red-500/20 text-red-500'}`}>
                                            {parseFloat(initialBot.total_profit || 0) >= 0 || parseFloat(initialBot.total_profit_coin || 0) > 0 ? '+' : ''}
                                            {initialBot.invested_capital > 0
                                                ? (((parseFloat(initialBot.total_profit || 0) + (parseFloat(initialBot.total_profit_coin || 0) * (fetchedPrice || currentTotalValue))) / parseFloat(initialBot.invested_capital)) * 100).toFixed(2)
                                                : '0.00'}%
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2">Realized Profit from Grid Trades</p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Investment</p>
                                        <p className="text-base text-white font-bold">${parseFloat(initialBot.invested_capital || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current Value</p>
                                        <p className="text-base text-white font-bold">
                                            ${currentTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>

                                {/* Active Grids (If Available) */}
                                {initialBot.open_orders && (
                                    <div className="mb-2">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2">
                                            <span>Active Grids</span>
                                            <span>
                                                <span className="text-green-500">{initialBot.open_orders.buy} Buys</span>
                                                <span className="mx-1">|</span>
                                                <span className="text-red-500">{initialBot.open_orders.sell} Sells</span>
                                                <span className="text-gray-600 ml-1">({initialBot.open_orders.total} Total)</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#1A2329] rounded-full h-2 overflow-hidden flex">
                                            <div
                                                className="h-full bg-[#00FF9D] shadow-[0_0_10px_#00FF9D]"
                                                style={{ width: initialBot.open_orders.total > 0 ? `${(initialBot.open_orders.buy / initialBot.open_orders.total) * 100}%` : '0%' }}
                                            ></div>
                                            <div
                                                className="h-full bg-red-500 shadow-[0_0_10px_#EF4444]"
                                                style={{ width: initialBot.open_orders.total > 0 ? `${(initialBot.open_orders.sell / initialBot.open_orders.total) * 100}%` : '0%' }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* INVESTMENT SECTION */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">{initialBot ? 'Add Investment' : 'Investment'}</label>
                                <span className="text-[10px] text-gray-500 flex items-center gap-2">
                                    Available:
                                    {balanceLoading ? (
                                        <Loader2 className="animate-spin text-[#00FF9D]" size={12} />
                                    ) : (
                                        <span className="text-white">${(Math.floor((availableBalance || 0) * 100) / 100).toFixed(2)}</span>
                                    )}
                                </span>
                            </div>

                            <div className="relative">
                                <style>
                                    {`
                                        .no-spinner::-webkit-inner-spin-button, 
                                        .no-spinner::-webkit-outer-spin-button { 
                                            -webkit-appearance: none; 
                                            margin: 0; 
                                        }
                                        .no-spinner { 
                                            -moz-appearance: textfield; 
                                        }
                                    `}
                                </style>
                                <input
                                    type="number"
                                    value={initialBot ? addedInvestment : config.investment}
                                    onChange={e => handleInvestmentInput(e.target.value)}
                                    disabled={balanceLoading}
                                    placeholder="Amount"
                                    className={`w-full bg-[#131B1F] border border-white/10 rounded-lg pl-3 pr-12 py-3 text-white font-mono text-lg outline-none focus:border-[#00FF9D] no-spinner transition-opacity duration-200 ${balanceLoading ? 'opacity-70' : ''}`}
                                />
                                {balanceLoading && (
                                    <div className="absolute right-24 top-1/2 -translate-y-1/2">
                                        <Loader2 className="animate-spin text-[#00FF9D]" size={16} />
                                    </div>
                                )}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                    <img src="/icons/usdt.png" alt="USDT" className="w-5 h-5" />
                                    <span className="text-[#00FF9D] font-bold text-sm">USDT</span>
                                </div>
                            </div>

                            {/* SLIDER and PRESETS */}
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={((initialBot ? addedInvestment : config.investment) / (availableBalance || 1)) * 100}
                                    onChange={e => handleSliderChange(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00FF9D]"
                                />
                                <div className="flex justify-between gap-2">
                                    {[25, 50, 75, 100].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => handleSliderChange(p)}
                                            className="flex-1 py-1 bg-[#131B1F] border border-white/5 rounded text-[10px] text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                                        >
                                            {p}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* (Moved Price & Grid Settings to Advanced) */}

                        {/* ADVANCED SETTINGS */}
                        <div className="border-t border-white/5 pt-4 mb-6">

                            {/* Toggle for Deploy Mode */}
                            {!initialBot && (
                                <>
                                    {!isAdvancedOpen && (
                                        <div className="mb-6 space-y-3 px-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">High price {config.trailingUp && <span className="ml-2 text-[10px] bg-[#00FF9D]/10 text-[#00FF9D] px-1.5 py-0.5 rounded border border-[#00FF9D]/20">Trailing up</span>}</span>
                                                <span className="text-white font-mono">{parseFloat(config.upperPrice || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Low price {config.trailingDown && <span className="ml-2 text-[10px] bg-[#00FF9D]/10 text-[#00FF9D] px-1.5 py-0.5 rounded border border-[#00FF9D]/20">Trailing down</span>}</span>
                                                <span className="text-white font-mono">{parseFloat(config.lowerPrice || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Step <span className="text-[10px] text-gray-500 uppercase">({config.gridType})</span></span>
                                                <span className="text-white font-mono">
                                                    {config.lowerPrice > 0 ? (
                                                        config.gridType === 'Geometric'
                                                            ? ((Math.pow(config.upperPrice / config.lowerPrice, 1 / config.grids) - 1) * 100).toFixed(2)
                                                            : (((config.upperPrice - config.lowerPrice) / config.grids / config.lowerPrice) * 100).toFixed(2)
                                                    ) : '0.00'}%
                                                    <span className="text-gray-500 ml-1">({config.grids} Levels)</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-[#00FF9D] hover:text-[#00cc7d] transition-colors py-2"
                                    >
                                        <Settings size={16} /> {isAdvancedOpen ? 'Hide Settings' : 'Customize'}
                                    </button>
                                </>
                            )}

                            {/* Settings Content - Always shown if Edit Mode (initialBot) OR if expanded */}
                            {(initialBot || isAdvancedOpen) && (
                                <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Grid Type</label>
                                        <div className="flex bg-[#131B1F] p-1 rounded-lg">
                                            {['Arithmetic', 'Geometric'].map(t => (
                                                <button key={t} onClick={() => setConfig({ ...config, gridType: t })} className={`flex-1 py-1.5 rounded text-[10px] transition-colors ${config.gridType === t ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400'}`}>{t.toUpperCase()}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* --- ORDER SIZE TYPE (Infinity Grid) --- */}
                                    <div className="space-y-2 pt-2 border-t border-white/5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Order Size Type (Advanced)</label>
                                        <div className="flex bg-[#131B1F] p-1 rounded-lg">
                                            <div className="relative group flex-1">
                                                <button
                                                    onClick={() => setConfig({ ...config, orderSizeType: 'quote' })}
                                                    disabled={config.gridType === 'Arithmetic'}
                                                    className={`w-full py-1.5 rounded-md text-[10px] font-bold transition-all ${config.gridType === 'Arithmetic' ? 'opacity-50 cursor-not-allowed text-gray-500' : config.orderSizeType === 'quote' ? `bg-[#00FF9D] text-black` : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    FIXED USDT (Quote)
                                                </button>
                                                {config.gridType === 'Arithmetic' && (
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1A2329] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10 shadow-xl">
                                                        Arithmetic grid requires Fixed Coin mode.
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setConfig({ ...config, orderSizeType: 'base' })}
                                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${config.orderSizeType === 'base' ? `bg-[#00FF9D] text-black` : 'text-gray-400 hover:text-white'}`}
                                            >
                                                FIXED COIN (Base)
                                            </button>
                                        </div>
                                        {/* Validation Warning in UI */}
                                        {config.gridType === 'Arithmetic' && config.orderSizeType === 'base' && config.trailingUp && (
                                            <div className="text-[10px] text-red-500 font-bold bg-red-500/10 p-2 rounded-sm border border-red-500/30 flex items-center gap-2">
                                                <AlertTriangle size={12} />
                                                Forbidden: Arithmetic + Base + Trailing Up
                                            </div>
                                        )}
                                    </div>

                                    {/* --- PROFIT STRATEGY SETTINGS --- */}
                                    <div className="space-y-4 pt-2 border-t border-white/5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Profit Mode</label>
                                            <div className="flex bg-[#131B1F] p-1 rounded-lg">
                                                {['USDT_ONLY', 'COIN_ONLY', 'HYBRID'].map(m => {
                                                    const isDisabled = config.orderSizeType === 'base' && m !== 'USDT_ONLY';
                                                    return (
                                                        <div key={m} className="relative group flex-1">
                                                            <button
                                                                onClick={() => setConfig({ ...config, profitMode: m })}
                                                                disabled={isDisabled}
                                                                className={`w-full py-1.5 rounded-md text-[10px] font-bold transition-all ${isDisabled ? 'opacity-50 cursor-not-allowed text-gray-500' : config.profitMode === m ? `bg-[#00FF9D] text-black` : 'text-gray-400 hover:text-white'}`}
                                                            >
                                                                {m.replace('_', ' ')}
                                                            </button>
                                                            {isDisabled && (
                                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1A2329] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10 shadow-xl whitespace-nowrap min-w-max">
                                                                    Only USDT profit supported in Fixed Coin mode.
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Fiat Profit Style (Only for USDT_ONLY) */}
                                        {config.profitMode === 'USDT_ONLY' && config.gridType !== 'Arithmetic' && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Fiat Profit Style</label>
                                                <div className="flex bg-[#131B1F] p-1 rounded-lg">
                                                    {['INSTANT', 'DELAYED', 'SPLIT'].map(s => {
                                                        const isFiatDisabled = config.orderSizeType === 'base' && s !== 'INSTANT';
                                                        return (
                                                            <div key={s} className="relative group flex-1">
                                                                <button
                                                                    onClick={() => setConfig({ ...config, fiatProfitStyle: s })}
                                                                    disabled={isFiatDisabled}
                                                                    className={`w-full py-1.5 rounded-md text-[10px] font-bold transition-all ${isFiatDisabled ? 'opacity-50 cursor-not-allowed text-gray-500' : config.fiatProfitStyle === s ? `bg-[#00FF9D] text-black` : 'text-gray-400 hover:text-white'}`}
                                                                >
                                                                    {s}
                                                                </button>
                                                                {isFiatDisabled && (
                                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1A2329] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10 shadow-xl whitespace-nowrap min-w-max">
                                                                        Only Instant style supported in Fixed Coin.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Split Ratio (Only for SPLIT or HYBRID) */}
                                        {(config.profitMode === 'HYBRID' || (config.profitMode === 'USDT_ONLY' && config.fiatProfitStyle === 'SPLIT')) && config.gridType !== 'Arithmetic' && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Profit Split Ratio (To Fiat)</label>
                                                    <span className="text-[10px] text-[#00FF9D] font-bold">{(config.profitSplitRatio * 100).toFixed(0)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="1" step="0.05"
                                                    value={config.profitSplitRatio}
                                                    onChange={e => setConfig({ ...config, profitSplitRatio: parseFloat(e.target.value) })}
                                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00FF9D]"
                                                />
                                                <div className="flex justify-between text-[10px] text-gray-500">
                                                    <span>0% (All Coin)</span>
                                                    <span>100% (All Fiat)</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* MOVED: PRICE RANGE */}
                                    <div className="space-y-3 pt-2 border-t border-white/5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Price Range</label>
                                            <button
                                                onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
                                                className="flex items-center gap-1 text-[10px] text-[#00FF9D] font-bold"
                                            >
                                                <div className={`w-8 h-4 rounded-full p-0.5 flex transition-colors ${mode === 'auto' ? 'bg-[#00FF9D] justify-end' : 'bg-gray-700 justify-start'}`}>
                                                    <div className="w-3 h-3 bg-black rounded-full shadow" />
                                                </div>
                                                Auto
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <span className="text-[10px] text-gray-500 block mb-1">High Price</span>
                                                <input
                                                    type="number"
                                                    value={config.upperPrice}
                                                    onChange={e => setConfig({ ...config, upperPrice: e.target.value })}
                                                    disabled={mode === 'auto'}
                                                    className={`w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00FF9D] ${mode === 'auto' ? 'opacity-50' : ''}`}
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-500 block mb-1">Low Price</span>
                                                <input
                                                    type="number"
                                                    value={config.lowerPrice}
                                                    onChange={e => setConfig({ ...config, lowerPrice: e.target.value })}
                                                    disabled={mode === 'auto'}
                                                    className={`w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00FF9D] ${mode === 'auto' ? 'opacity-50' : ''}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* MOVED: GRID SETTINGS */}
                                    <div className="space-y-3 pt-2 border-t border-white/5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Grid Settings</label>
                                            <button onClick={() => setConfig({ ...config, grids: 30 })} className="text-[10px] text-[#00FF9D]">Auto (30)</button>
                                        </div>
                                        <input
                                            type="number"
                                            value={config.grids}
                                            onChange={e => setConfig({ ...config, grids: e.target.value })}
                                            className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00FF9D]"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="flex items-center gap-2 text-[10px] text-gray-300 border border-white/5 bg-[#131B1F] p-2 rounded-lg cursor-pointer hover:border-[#00FF9D]/30 transition-all">
                                                <input type="checkbox" checked={config.trailingDown} onChange={e => setConfig({ ...config, trailingDown: e.target.checked })} className="accent-[#00FF9D] w-3 h-3" />
                                                <span className="font-bold uppercase">Trailing Down</span>
                                            </label>
                                            <div className="relative group">
                                                <label className={`flex items-center gap-2 text-[10px] text-gray-300 border border-white/5 bg-[#131B1F] p-2 rounded-lg transition-all ${config.orderSizeType === 'base' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#00FF9D]/30'}`}>
                                                    <input type="checkbox" checked={config.trailingUp} disabled={config.orderSizeType === 'base'} onChange={e => setConfig({ ...config, trailingUp: e.target.checked })} className={`accent-[#00FF9D] w-3 h-3 ${config.orderSizeType === 'base' ? 'cursor-not-allowed' : ''}`} />
                                                    <span className="font-bold uppercase">Trailing Up</span>
                                                </label>
                                                {config.orderSizeType === 'base' && (
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1A2329] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10 shadow-xl whitespace-nowrap min-w-max">
                                                        Not supported in Fixed Coin mode.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Stop Loss</label>
                                                <input type="number" placeholder="Price (0 = Off)" value={config.stopLoss} onChange={e => setConfig({ ...config, stopLoss: e.target.value })} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-red-500 transition-colors" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Take Profit</label>
                                                <input type="number" placeholder="Price (0 = Off)" value={config.takeProfit} onChange={e => setConfig({ ...config, takeProfit: e.target.value })} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-green-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PROJECTED HOLDINGS (DONUT CHART) */}
                        <div className="bg-[#0A1014] border border-white/10 rounded-2xl p-5 mb-4 relative overflow-hidden">
                            <h3 className="text-sm font-bold text-white mb-4">Projected Holdings</h3>

                            <div className="flex items-center justify-between">
                                {/* Donut Chart */}
                                <div className="relative w-24 h-24">
                                    <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />

                                        {/* Reserve (Yellow) */}
                                        <circle r="15.9155" cx="18" cy="18" fill="none" stroke="#F59E0B" strokeWidth="3.8" strokeDasharray={`${projectedHoldings.reservePct}, ${100 - projectedHoldings.reservePct}`} strokeDashoffset="0" />

                                        {/* USDT (Purple) */}
                                        <circle r="15.9155" cx="18" cy="18" fill="none" stroke="#8B5CF6" strokeWidth="3.8" strokeDasharray={`${projectedHoldings.usdtPct}, ${100 - projectedHoldings.usdtPct}`} strokeDashoffset={`-${projectedHoldings.reservePct}`} />

                                        {/* Coin (Green) */}
                                        <circle r="15.9155" cx="18" cy="18" fill="none" stroke="#00FF9D" strokeWidth="3.8" strokeDasharray={`${projectedHoldings.coinPct}, ${100 - projectedHoldings.coinPct}`} strokeDashoffset={`-${projectedHoldings.reservePct + projectedHoldings.usdtPct}`} />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-[10px] text-gray-500">Value</span>
                                        <span className="text-xs font-bold text-white">${projectedHoldings.inv.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Legend/Details */}
                                <div className="flex-1 pl-6 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={`/icons/${config.pair.split('/')[0].toLowerCase()}.png`}
                                                alt={config.pair.split('/')[0]}
                                                className="w-5 h-5 rounded-full"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                            <span className="text-gray-400">{config.pair.split('/')[0]} HOLDINGS</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[#00FF9D] font-bold">{projectedHoldings.coinQty.toFixed(4)} {config.pair.split('/')[0]}</div>
                                            <div className="text-[10px] text-gray-500">${projectedHoldings.coinVal.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <img src="/icons/usdt.png" alt="USDT" className="w-5 h-5" />
                                            <span className="text-gray-400">USDT HOLDINGS</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[#8B5CF6] font-bold">{projectedHoldings.usdtVal.toFixed(2)} USDT</div>
                                            <div className="text-[10px] text-gray-500">${projectedHoldings.usdtVal.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <img src="/icons/usdt.png" alt="USDT" className="w-5 h-5 opacity-50 grayscale" />
                                            <span className="text-gray-400">FEE RESERVE (1%)</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[#F59E0B] font-bold">{projectedHoldings.reserve.toFixed(2)} USDT</div>
                                            <div className="text-[10px] text-gray-500">${projectedHoldings.reserve.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <AlertTriangle size={12} className="text-yellow-500" />
                                <span className="text-[10px] text-yellow-500">Don't withdraw the reserve to run the bot smoothly.</span>
                            </div>
                        </div>




                        {/* ESTIMATED RETURNS */}
                        {/* FOOTER GROUP: ESTIMATED RETURNS & ACTIONS */}
                        <div className="mt-auto">
                            {/* ESTIMATED RETURNS */}
                            <div className="bg-[#0A1014] border border-[#00FF9D]/20 rounded-2xl p-5 mb-4 shadow-lg shadow-[#00FF9D]/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-[#00FF9D]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles size={16} className="text-[#00FF9D] animate-pulse" />
                                    <span className="text-sm font-bold text-white">Estimated Returns</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-medium">Daily</span>
                                        <span className="text-[#00FF9D] font-bold">+2.76%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-medium">Monthly</span>
                                        <span className="text-[#00FF9D] font-bold">+9.48%</span>
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleDeploy}
                                    disabled={creating}
                                    className="w-full bg-[#00FF9D] hover:bg-[#00cc7d] text-black font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-[#00FF9D]/20 flex items-center justify-center gap-2"
                                >
                                    {creating && <Loader2 className="animate-spin" size={18} />}
                                    {initialBot ? 'Update & Restart Bot' : 'Deploy Bot'}
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, investment: 0, grids: 20 })}
                                    className="w-full bg-[#FF3B30] hover:bg-[#d63027] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-red-500/20"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout >
    );
};

export default EditBot;

const themeText = 'text-[#00FF9D]';
