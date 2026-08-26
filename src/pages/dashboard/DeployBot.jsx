
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronDown, Info, Search, Loader2, Check, LayoutGrid, AlertTriangle, Settings, ChevronRight, Sparkles, ArrowLeft, PieChart, Edit, Zap, TrendingUp, CheckCircle2, XCircle, Activity } from 'lucide-react';
import API_BASE_URL from '../../config';
import { useTrading } from '../../context/TradingContext';
import { useToast } from '../../context/ToastContext';
import { getToken } from '../../utils/token';
import DashboardLayout from '../../components/DashboardLayout';
import ExchangeFilter from '../../components/ExchangeFilter';
import GridChart from '../../components/GridChart';
import ActiveBots from '../../components/ActiveBots'; // Reuse existing if possible or verify
import useAppNotifications from '../../hooks/useAppNotifications';

import { getSortedPairs, PRIORITY_COINS } from '../../data/pairs';

const ALL_PAIRS = getSortedPairs();

const DEFAULT_CONFIG = {
    exchange: '',
    pair: 'SOL/USDT',
    investment: 1000,
    grids: 30,
    upperPrice: 0,
    lowerPrice: 0,
    trailingUp: true,
    trailingDown: true,
    stopLoss: 0,
    takeProfit: 0,
    gridType: 'Geometric',
    orderSizeType: 'quote',
    profitMode: 'USDT_ONLY',
    fiatProfitStyle: 'SPLIT',
    profitSplitRatio: 0.5,
    gridGap: 0
};

const DeployBot = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isPaperTrading, exchangeFilter, setExchangeFilter, connectedExchanges } = useTrading();

    const { notifyBotStatus } = useAppNotifications();
    const { addToast } = useToast();
    // const initialBot = state?.initialBot; // REMOVED: Edit logic moved to EditBot.jsx
    const initialBot = null; // Forced null for Deploy Mode

    const [config, setConfig] = useState(DEFAULT_CONFIG);

    const [addedInvestment, setAddedInvestment] = useState(0); // For Edit Mode
    const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
    const [riskLevel, setRiskLevel] = useState('high'); // For Auto mode
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    // UI Helpers
    const [isPairOpen, setIsPairOpen] = useState(false);
    const [isExchangeOpen, setIsExchangeOpen] = useState(false);
    const [pairSearch, setPairSearch] = useState('');
    const [fetchedPrice, setFetchedPrice] = useState(0);
    const [isMarketDataLoading, setIsMarketDataLoading] = useState(true); // Initial loading state
    const [creating, setCreating] = useState(false);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [balanceLoading, setBalanceLoading] = useState(true);
    const [investmentAsset, setInvestmentAsset] = useState('quote'); // 'quote' (USDT) or 'base'
    const [minInvestment, setMinInvestment] = useState(0); // Calculated min for current grids
    const [minNotional, setMinNotional] = useState(0); // Exchange min per order

    // --- BACKTEST STATES ---
    const [btLoading, setBtLoading] = useState(false);
    const [btProgress, setBtProgress] = useState(0);
    const [btReport, setBtReport] = useState(null);
    const [btDays, setBtDays] = useState(30); // 7, 30, 180, 365

    const handleReset = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        setConfig({ ...DEFAULT_CONFIG });
        setAddedInvestment(0);
        setMode('auto');
        setRiskLevel('high');
        setIsAdvancedOpen(false);
        setPairSearch('');

        // Reset transition states
        setCreating(false);
        setFetchedPrice(0);
        setIsMarketDataLoading(true);

        addToast("Settings reset to defaults", "success");
    };


    // --- FETCH EXCHANGES ---
    // --- SET DEFAULT EXCHANGE ---
    useEffect(() => {
        if (!config.exchange && Array.isArray(connectedExchanges) && connectedExchanges.length > 0) {
            // Filter matching current mode logic
            const relevant = connectedExchanges.filter(e => {
                const name = (e.exchange_name || '').toLowerCase();
                return isPaperTrading ? name.includes('paper') : !name.includes('paper');
            });

            if (relevant.length > 0) {
                setConfig(prev => ({ ...prev, exchange: (relevant[0].exchange_name || '').replace(/_paper/i, '') }));
            } else if (connectedExchanges.length > 0) {
                // Fallback to first available if no mode match
                setConfig(prev => ({ ...prev, exchange: (connectedExchanges[0].exchange_name || '').replace(/_paper/i, '') }));
            }
        }
    }, [connectedExchanges, isPaperTrading, config.exchange]);

    // --- SYNC config.exchange WITH GLOBAL exchangeFilter (top bar) ---
    useEffect(() => {
        if (exchangeFilter && exchangeFilter !== 'ALL') {
            const syncedExchange = exchangeFilter.toLowerCase().replace(/_paper/i, '');
            if (syncedExchange !== config.exchange?.toLowerCase()) {
                setConfig(prev => ({ ...prev, exchange: syncedExchange }));
            }
        }
    }, [exchangeFilter]);


    // Filter Exchanges for Dropdown
    const validExchanges = (connectedExchanges || []).filter(e => {
        const isPaperName = e.exchange_name?.toLowerCase().includes('paper');
        return isPaperTrading ? isPaperName : !isPaperName;
    }).map(e => (e.exchange_name || '').replace('_paper', '').replace('_PAPER', ''));

    // Inject Mock Exchange for Paper Trading
    if (isPaperTrading && !validExchanges.includes('MOCK')) {
        validExchanges.push('MOCK');
    }
    // If no exchanges found for mode, show message or empty?
    // We will handle that in render.

    // --- 1. INITIALIZE (EDIT MODE) ---
    useEffect(() => {
        if (initialBot) {
            const cfg = typeof initialBot.config === 'string' ? JSON.parse(initialBot.config) : initialBot.config;
            const strat = cfg.strategy || {};
            setConfig({
                exchange: cfg.exchange || 'Binance',
                pair: cfg.pair || 'BTC/USDT',
                investment: parseFloat(strat.investment || 0),
                grids: parseInt(strat.grids || 20),
                upperPrice: parseFloat(strat.upper_price || 0),
                lowerPrice: parseFloat(strat.lower_price || 0),
                trailingUp: !!strat.trailing_up,
                trailingDown: !!strat.trailing_down,
                stopLoss: parseFloat(cfg.risk_management?.stop_loss?.threshold || 0),
                takeProfit: parseFloat(cfg.risk_management?.take_profit?.threshold || 0),
                gridType: (strat.grid_type === 'GEOMETRIC') ? 'Geometric' : 'Arithmetic',
                // Map Legacy/New Settings
                profitMode: strat.profit_mode || (strat.profit_currency_type === 'base' ? 'COIN_ONLY' : 'USDT_ONLY'),
                fiatProfitStyle: strat.fiat_profit_style || 'SPLIT',
                profitSplitRatio: parseFloat(strat.profit_split_ratio || 0.5)
            });
            // Default to manual usually when editing
            setMode('manual');
        }
    }, [initialBot]);

    // --- 2. FETCH BALANCE ---
    useEffect(() => {
        if (!config.exchange) return; // Wait until exchange is selected
        const fetchBalance = async () => {
            setBalanceLoading(true);
            const token = getToken();
            if (!token) {
                setBalanceLoading(false);
                return;
            }
            try {
                const modeQuery = isPaperTrading ? '?mode=paper' : '?mode=live';
                const exchQuery = config.exchange ? `&exchange=${config.exchange}` : '';
                const res = await fetch(`${API_BASE_URL}/user/portfolio${modeQuery}${exchQuery}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const quote = config.pair.split('/')[1] || 'USDT';
                    const quoteAsset = data.assets?.find(a => a.symbol === quote);
                    setAvailableBalance(parseFloat(quoteAsset?.free || 0));
                }
            } catch (e) {
                console.error(e);
                addToast("Failed to fetch balance", "error");
            } finally {
                setBalanceLoading(false);
            }
        };
        fetchBalance();
    }, [isPaperTrading, config.exchange, config.pair]);


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
                        setIsMarketDataLoading(false); // Data loaded

                        // IF AUTO MODE: Recalculate Range
                        if (mode === 'auto' && !initialBot) {
                            setConfig(prev => ({
                                ...prev,
                                upperPrice: parseFloat((price * 1.05).toFixed(4)), // 5% up
                                lowerPrice: parseFloat((price * 0.75).toFixed(4)), // 25% down
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


    // --- CONTROL HIERARCHY AUTO-CORRECTION ---
    useEffect(() => {
        setConfig(prev => {
            let newConfig = { ...prev };
            let changed = false;

            // Rule 1: Arithmetic requires Base (Fixed Coin)
            if (newConfig.gridType === 'Arithmetic' && newConfig.orderSizeType !== 'base') {
                newConfig.orderSizeType = 'base';
                changed = true;
            }

            // Rule 2: Base (Fixed Coin) locks Trailing Up and Profit Mode to USDT_ONLY
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

    // --- FETCH EXCHANGE MINIMUM ORDER LIMITS ---
    useEffect(() => {
        const fetchLimits = async () => {
            if (!config.exchange || !config.pair) return;
            try {
                const cleanExchange = config.exchange.replace('_paper', '');
                const res = await fetch(`${API_BASE_URL}/user/market-limits?exchange=${cleanExchange}&symbol=${encodeURIComponent(config.pair)}`);
                if (res.ok) {
                    const data = await res.json();
                    const notional = data.minNotional || 6.06;
                    setMinNotional(notional);
                    // 1.5x safety margin for fees/spread
                    setMinInvestment(notional * (config.grids || 1) * 1.5);
                }
            } catch (err) {
                console.warn('Failed to fetch market limits:', err);
                // Fallback: $6.06 per grid
                setMinNotional(6.06);
                setMinInvestment(6.06 * (config.grids || 1) * 1.5);
            }
        };
        fetchLimits();
    }, [config.exchange, config.pair, config.grids]);

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
        if (val === '') {
            if (initialBot) setAddedInvestment('');
            else setConfig(prev => ({ ...prev, investment: '' }));
            return;
        }

        // If it looks like a number, we can format it OR just let them type.
        // But user asked for "2 digit", so we'll likely want to cap it.
        const amount = parseFloat(val);
        if (initialBot) {
            setAddedInvestment(isNaN(amount) ? 0 : amount);
        } else {
            setConfig(prev => ({ ...prev, investment: isNaN(amount) ? 0 : amount }));
        }
    };



    // Helper: is investment below minimum?
    const investmentAmount = initialBot ? addedInvestment : config.investment;
    const isBelowMinimum = config.exchange !== 'MOCK' && minInvestment > 0 && investmentAmount < minInvestment;

    const handleDeploy = async () => {
        if (creating) return;

        // Basic Validation
        const amountToCheck = initialBot ? addedInvestment : config.investment;
        if (config.exchange !== 'MOCK' && amountToCheck > availableBalance) {
            addToast("Insufficient Balance", "error");
            return;
        }
        if (config.upperPrice <= config.lowerPrice) {
            addToast("Invalid Price Range", "error");
            return;
        }
        // Minimum investment check
        if (isBelowMinimum) {
            addToast(`Minimum investment: $${minInvestment.toFixed(2)} USDT (${config.grids} grids × $${minNotional.toFixed(2)} min × 1.5 safety)`, "error");
            return;
        }

        // --- VALIDATION: INFINITY GRID SAFETY LOCK ---
        // Block Arithmetic + Base + Trailing Up
        if (config.gridType === 'Arithmetic' && config.orderSizeType === 'base' && config.trailingUp) {
            addToast("❌ Config Error: Arithmetic + Base + Trailing Up is forbidden.", "error");
            return;
        }
        // ---------------------------------------------

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
                    // New Fields
                    order_size_type: config.orderSizeType,
                    // New Profit Strategy Fields
                    profit_mode: config.profitMode,
                    fiat_profit_style: config.fiatProfitStyle,
                    profit_split_ratio: config.profitSplitRatio,
                    // Legacy Fallback
                    profit_currency_type: config.profitMode === 'COIN_ONLY' ? 'base' : 'quote',
                    grid_gap: Number(config.gridGap),
                    // Sync Initial Allocation with Projected Holdings
                    initial_base_balance_allocation: projectedHoldings.coinVal,
                    initial_quote_balance_allocation: projectedHoldings.usdtVal
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
                                    notifyBotStatus("Bot Created", `${config.pair} Spot Grid Bot has been successfully created.`);
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
        if (!config.upperPrice || !config.lowerPrice || !config.grids || config.upperPrice <= config.lowerPrice) return [];

        const lines = [];
        const isGeometric = config.gridType === 'Geometric';

        try {
            for (let i = 1; i <= config.grids; i++) {
                let price;
                if (isGeometric) {
                    const ratio = Math.pow(config.upperPrice / config.lowerPrice, 1 / config.grids);
                    price = config.lowerPrice * Math.pow(ratio, i);
                } else {
                    const step = (config.upperPrice - config.lowerPrice) / config.grids;
                    price = config.lowerPrice + (step * i);
                }

                if (isNaN(price) || !isFinite(price)) continue;

                lines.push({
                    price: price,
                    qty: 0,
                    side: price < (fetchedPrice || 0) ? 'buy' : 'sell'
                });
            }
        } catch (e) {
            console.error("Failed to calculate preview lines", e);
            return [];
        }

        return lines;
    }, [config.upperPrice, config.lowerPrice, config.grids, config.gridType, fetchedPrice]);


    // --- RENDER HELPERS ---
    const filteredPairs = ALL_PAIRS.filter(p => p.toLowerCase().includes(pairSearch.toLowerCase()));

    const projectedHoldings = useMemo(() => {
        const inv = initialBot ? parseFloat(addedInvestment || 0) + parseFloat(config.investment || 0) : parseFloat(config.investment || 0);
        const usable = isNaN(inv) ? 0 : inv;

        let buyRatio = 0.5;
        let sellRatio = 0.5;

        const up = parseFloat(config.upperPrice || 0);
        const low = parseFloat(config.lowerPrice || 0);
        const current = parseFloat(fetchedPrice || 0);

        if (up > low && current > 0) {
            if (current >= up) {
                buyRatio = 1; sellRatio = 0;
            } else if (current <= low) {
                buyRatio = 0; sellRatio = 1;
            } else {
                const range = up - low;
                const pricePos = current - low;
                buyRatio = pricePos / range;
                sellRatio = 1 - buyRatio;
            }
        }

        const usdtVal = usable * buyRatio;
        const coinVal = usable * sellRatio;
        const coinQty = current > 0 ? coinVal / current : 0;
        const usdtPct = buyRatio * 100;
        const coinPct = sellRatio * 100;

        return {
            inv: usable,
            usdtVal: isNaN(usdtVal) ? 0 : usdtVal,
            coinVal: isNaN(coinVal) ? 0 : coinVal,
            coinQty: isNaN(coinQty) ? 0 : coinQty,
            usdtPct: isNaN(usdtPct) ? 50 : usdtPct,
            coinPct: isNaN(coinPct) ? 50 : coinPct
        };
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
        <DashboardLayout
            isLoading={isMarketDataLoading}
            fullWidth={true}
            headerSlot={
                <ExchangeFilter
                    isLoading={isMarketDataLoading}
                    options={['ALL', ...(connectedExchanges || []).map(e => (e.exchange_name || '').toUpperCase().replace('_PAPER', ''))]}
                    selected={exchangeFilter}
                    onSelect={setExchangeFilter}
                />
            }
        >

            <div className="p-4 md:p-8 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors bg-[#0A1014] p-2 rounded-lg border border-white/5 hover:border-white/20">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{initialBot ? 'Edit Bot' : 'Grid Bot'}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{config.pair} SPOT GRID</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                    {/* --- LEFT PANEL: CHART & ACTIVE BOTS --- */}
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                        <div className="h-[650px] bg-[#0A1014] border border-white/5 rounded-none overflow-hidden relative shadow-xl">


                            {/* CHART COMPONENT */}
                            <div className="w-full h-full">
                                <GridChart
                                    exchange={config.exchange}
                                    pair={config.pair}
                                    gridLines={previewLines}
                                    currentPrice={fetchedPrice}
                                    isLoading={isMarketDataLoading}
                                />
                            </div>

                            {/* Overlay Price Lines (Visualization Check) */}
                            {/* Note: TradingViewWidget is iframe, can't easily overlay. 
                            If we used GridChart, we could. For now rely on TV Widget. */}
                        </div>

                        {/* ACTIVE BOTS MINI LIST */}
                        <div className="h-[525px] overflow-hidden flex flex-col">
                            <h3 className="text-lg font-medium text-white mb-4">Running Bots</h3>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <ActiveBots limit={10} minimal={true} />
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT PANEL: CONFIGURATION FORM --- */}
                    <div className="w-full lg:w-[300px] xl:w-[330px] bg-[#0A1014] border border-white/5 rounded-3xl p-6 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                        {initialBot ? (
                            <div className="mb-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#131B1F] flex items-center justify-center border border-white/5 overflow-hidden shadow-lg">
                                            <img
                                                src={`/icons/${(config.pair || 'BTC/USDT').split('/')[0].toLowerCase()}.png`}
                                                alt={config.pair || 'Bot'}
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
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-white mb-2">Create Grid Bot</h2>
                                <p className="text-sm text-gray-400 mb-6">Configure your automated trading strategy</p>
                            </>
                        )}

                        {/* EXCHANGE & PAIR - Hidden when Editing */}
                        {!initialBot && (
                            <div className="space-y-4 mb-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Exchange</label>
                                    <div className="relative" onClick={() => setIsExchangeOpen(!isExchangeOpen)}>
                                        <div className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex justify-between items-center cursor-pointer hover:border-white/20 transition-colors">
                                            <div className="flex items-center gap-2">
                                                {config.exchange && (() => {
                                                    const cleanName = config.exchange.replace('_paper', '');
                                                    const svgName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
                                                    return (
                                                        <img
                                                            src={`/exchanges_svg/${svgName}.svg`}
                                                            alt={config.exchange}
                                                            className="w-5 h-5 object-contain"
                                                            onError={(e) => {
                                                                if (e.target.src.includes(svgName)) {
                                                                    e.target.src = `/exchanges_svg/${cleanName.toLowerCase()}.svg`;
                                                                } else {
                                                                    e.target.style.display = 'none';
                                                                }
                                                            }}
                                                        />
                                                    );
                                                })()}
                                                <span className="uppercase">{config.exchange || 'Select Exchange'}</span>
                                            </div>
                                            <ChevronDown size={14} className={`transition-transform ${isExchangeOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {isExchangeOpen && (
                                            <div className="absolute z-50 top-full left-0 w-full bg-[#1A2023] border border-white/10 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
                                                {validExchanges.length > 0 ? (
                                                    validExchanges.map(ex => {
                                                        const cleanName = ex.replace('_paper', '');
                                                        // Apply capitalization fix like ExchangeBadge
                                                        const svgName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
                                                        return (
                                                            <div
                                                                key={ex}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const isMock = cleanName === 'MOCK';
                                                                    let newPair = config.pair;
                                                                    if (isMock) {
                                                                        newPair = 'MOCK/USDT';
                                                                    } else if (config.pair === 'MOCK/USDT') {
                                                                        newPair = 'SOL/USDT'; // Reset to valid pair
                                                                    }
                                                                    setConfig({
                                                                        ...config,
                                                                        exchange: cleanName,
                                                                        pair: newPair
                                                                    });
                                                                    setIsExchangeOpen(false);
                                                                }}
                                                                className="px-4 py-3 hover:bg-white/5 text-sm text-gray-300 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                                                            >
                                                                <div className="w-6 h-6 flex items-center justify-center bg-white/5 rounded p-0.5">
                                                                    <img
                                                                        src={`/exchanges_svg/${svgName}.svg`}
                                                                        alt={cleanName}
                                                                        className="w-full h-full object-contain"
                                                                        onError={(e) => {
                                                                            // Fallback to lowercase
                                                                            if (e.target.src.includes(svgName)) {
                                                                                e.target.src = `/exchanges_svg/${cleanName.toLowerCase()}.svg`;
                                                                            } else {
                                                                                e.target.style.display = 'none';
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="uppercase font-bold">{cleanName}</span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-4 text-xs text-gray-500 text-center">
                                                        No {isPaperTrading ? 'Paper' : 'Live'} Exchanges
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1 relative">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pair</label>
                                    <div
                                        onClick={() => setIsPairOpen(!isPairOpen)}
                                        className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex justify-between items-center cursor-pointer hover:border-white/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={`/icons/${config.pair.split('/')[0].toLowerCase()}.png`}
                                                alt={config.pair}
                                                className="w-5 h-5 rounded-full"
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/icons/btc.png'; }}
                                            />
                                            <span>{config.pair}</span>
                                        </div>
                                        <ChevronDown size={14} className={`transition-transform ${isPairOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isPairOpen && (
                                        <div className="absolute z-50 top-full left-0 w-full bg-[#1A2023] border border-white/10 rounded-xl mt-1 h-60 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-2">
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                    <input
                                                        autoFocus
                                                        value={pairSearch}
                                                        onChange={e => setPairSearch(e.target.value)}
                                                        className="w-full bg-black/30 text-white text-xs py-2 pl-9 pr-2 rounded-lg border border-white/5 outline-none uppercase focus:border-[#00FF9D]/30 transition-colors"
                                                        placeholder="SEARCH PAIR"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
                                                {filteredPairs.map(p => (
                                                    <div
                                                        key={p}
                                                        onClick={() => { setConfig({ ...config, pair: p }); setIsPairOpen(false); }}
                                                        className="px-4 py-2 hover:bg-white/5 text-xs text-gray-300 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                                                    >
                                                        <img
                                                            src={`/icons/${p.split('/')[0].toLowerCase()}.png`}
                                                            alt={p}
                                                            className="w-5 h-5 rounded-full"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = '/icons/btc.png'; }}
                                                        />
                                                        <span className="font-bold">{p}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* INVESTMENT SECTION */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">{initialBot ? 'Add Investment' : 'Investment'}</label>
                                {config.exchange !== 'MOCK' && (
                                    <span className="text-[10px] text-gray-500 flex items-center gap-2">
                                        Available:
                                        {balanceLoading ? (
                                            <Loader2 className="animate-spin text-[#00FF9D]" size={12} />
                                        ) : (
                                            <span className="text-white">${(Math.floor((availableBalance || 0) * 100) / 100).toFixed(2)}</span>
                                        )}
                                    </span>
                                )}
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
                                    step="0.01"
                                    value={initialBot ? (addedInvestment || '') : (config.investment || '')}
                                    onChange={e => handleInvestmentInput(e.target.value)}
                                    disabled={balanceLoading}
                                    placeholder="0.00"
                                    className={`w-full bg-[#131B1F] border border-white/10 rounded-lg pl-3 pr-12 py-2.5 text-white font-mono text-sm outline-none focus:border-[#00FF9D] no-spinner transition-opacity duration-200 ${balanceLoading ? 'opacity-70' : ''}`}
                                />
                                {balanceLoading && (
                                    <div className="absolute right-20 top-1/2 -translate-y-1/2">
                                        <Loader2 className="animate-spin text-[#00FF9D]" size={14} />
                                    </div>
                                )}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                                    <img src="/icons/usdt.png" alt="USDT" className="w-4 h-4" />
                                    <span className="text-[#00FF9D] font-bold text-xs">
                                        {config.exchange === 'MOCK' ? 'MOCK USDT' : 'USDT'}
                                    </span>
                                </div>
                            </div>

                            {/* SLIDER and PRESETS */}
                            {config.exchange !== 'MOCK' && (
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
                            )}

                            {/* MINIMUM INVESTMENT WARNING */}
                            {isBelowMinimum && (
                                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                                    <span className="text-[10px] text-amber-400">
                                        Min investment: <span className="font-bold text-amber-300">${minInvestment.toFixed(2)}</span> USDT
                                        <span className="text-amber-500/70 ml-1">({config.grids} grids × ${minNotional.toFixed(2)} min)</span>
                                    </span>
                                </div>
                            )}
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
                                                <span className="text-gray-400">High price {config.trailingUp && <span className="ml-2 text-[10px] bg-[#00FF9D]/10 text-[#00FF9D] px-1.5 py-0.5 rounded-none border border-[#00FF9D]/20">Trailing up</span>}</span>
                                                <span className="text-white font-mono">{parseFloat(config.upperPrice || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Low price {config.trailingDown && <span className="ml-2 text-[10px] bg-[#00FF9D]/10 text-[#00FF9D] px-1.5 py-0.5 rounded-none border border-[#00FF9D]/20">Trailing down</span>}</span>
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
                                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[#00FF9D] hover:text-[#00cc7d] transition-colors py-2"
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
                                                <button key={t} onClick={() => setConfig({ ...config, gridType: t })} className={`flex-1 py-1.5 rounded-md text-[10px] transition-colors ${config.gridType === t ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400'}`}>{t.toUpperCase()}</button>
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
                                        {config.profitMode === 'USDT_ONLY' && (
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
                                        {(config.profitMode === 'HYBRID' || (config.profitMode === 'USDT_ONLY' && config.fiatProfitStyle === 'SPLIT')) && (
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

                        {/* PROJECTED HOLDINGS (REFACED) */}
                        <div className="bg-[#0A1014] border border-white/10 rounded-3xl p-6 mb-4">
                            <h3 className="text-white font-bold text-sm mb-4 border-b border-white/5 pb-2">Projected Holdings</h3>

                            <div className="flex flex-col items-center">
                                {/* Pie Chart (Centered on Top) */}
                                <div className="relative w-48 h-48 mb-8 mt-2">
                                    <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                                        {/* Background */}
                                        <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />

                                        {/* Segments - Order: USDT -> Coin */}
                                        <path className="text-[#8B5CF6]" strokeDasharray={`${projectedHoldings.usdtPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                        <path className="text-[#00FF9D]" strokeDasharray={`${projectedHoldings.coinPct}, 100`} strokeDashoffset={`-${projectedHoldings.usdtPct}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-xs text-gray-400">Total Value</p>
                                        <p className="text-white font-bold text-xl">${projectedHoldings.inv.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                    </div>
                                </div>

                                {/* Data List (Below Chart) */}
                                <div className="w-full space-y-4">
                                    {/* Base Asset Holdings */}
                                    <div>
                                        <div className="flex items-center justify-between gap-4 mb-1">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1.5">
                                                <img
                                                    src={`/icons/${config.pair.split('/')[0].toLowerCase()}.png`}
                                                    alt={config.pair.split('/')[0]}
                                                    className="w-4 h-4 object-contain"
                                                    onError={(e) => { e.target.src = '/icons/btc.png'; }}
                                                />
                                                {config.pair.split('/')[0]} Holdings
                                            </p>
                                            <span className="text-[9px] text-[#00FF9D] bg-[#00FF9D]/10 px-1.5 py-0.5 rounded font-mono">
                                                {projectedHoldings.coinPct.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pl-5.5">
                                            <p className="text-white font-bold text-sm leading-none">{projectedHoldings.coinQty.toFixed(4)} <span className="text-[10px] text-gray-500">{config.pair.split('/')[0]}</span></p>
                                            <p className="text-[10px] text-gray-500 font-mono">${projectedHoldings.coinVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>

                                    {/* USDT Holdings */}
                                    <div>
                                        <div className="flex items-center justify-between gap-4 mb-1">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1.5">
                                                <img
                                                    src={`/icons/usdt.png`}
                                                    alt="USDT"
                                                    className="w-4 h-4 object-contain"
                                                    onError={(e) => { e.target.src = '/icons/usdt.png'; }}
                                                />
                                                USDT Holdings
                                            </p>
                                            <span className="text-[9px] text-[#8B5CF6] bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded font-mono">
                                                {projectedHoldings.usdtPct.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pl-5.5">
                                            <p className="text-white font-bold text-sm leading-none">{projectedHoldings.usdtVal.toFixed(2)} <span className="text-[10px] text-gray-500">USDT</span></p>
                                            <p className="text-[10px] text-gray-500 font-mono">${projectedHoldings.usdtVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>




                        {/* ESTIMATED RETURNS */}
                        {/* FOOTER GROUP: ESTIMATED RETURNS & ACTIONS */}
                        <div className="mt-auto">
                            {/* ESTIMATED RETURNS */}
                            <div className="bg-[#0A1014] rounded-2xl p-5 mb-4 relative overflow-hidden group">
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
                                    disabled={creating || isBelowMinimum}
                                    className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isBelowMinimum
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#00FF9D] hover:bg-[#00cc7d] text-black hover:shadow-[#00FF9D]/20'
                                        }`}
                                >
                                    {creating && <Loader2 className="animate-spin" size={18} />}
                                    {isBelowMinimum ? `Min: $${minInvestment.toFixed(2)} USDT` : (initialBot ? 'Update & Restart Bot' : 'Deploy Bot')}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full text-red-400 bg-[#1A1014] border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 font-bold py-3.5 rounded-xl transition-all"
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

export default DeployBot;

const themeText = 'text-[#00FF9D]';
