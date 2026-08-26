import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronDown, Info, Search, Loader2, Check, LayoutGrid } from 'lucide-react';
import API_BASE_URL from '../../config';
import { useTrading } from '../../context/TradingContext'; // <--- Import Context
import { getToken } from '../../utils/token';

import { getSortedPairs, PRIORITY_COINS } from '../../data/pairs';

const ALL_PAIRS = getSortedPairs();

const ConfigureBotModal = ({ isOpen, onClose, botType = 'SPOT GRID', onSuccess, initialBot = null }) => {
    const { isPaperTrading } = useTrading(); // <--- Get Active Mode

    const [config, setConfig] = useState({
        exchange: 'Binance',
        pair: 'BTC/USDT',
        investment: 1000,
        grids: 20,
        upperPrice: 0,
        lowerPrice: 0,
        trailingUp: false,
        trailingDown: false,
        gridType: 'Arithmetic', // 'Arithmetic' or 'Geometric'
        orderSizeType: 'quote', // 'quote' (USDT) or 'base' (Coin)
        gridGap: 0              // Optional: override
    });

    // Edit Mode State
    const [addedInvestment, setAddedInvestment] = useState(0);

    const [mode, setMode] = useState('auto');
    const [riskLevel, setRiskLevel] = useState('high');
    const [isPairOpen, setIsPairOpen] = useState(false);
    const [pairSearch, setPairSearch] = useState('');
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [fetchedPrice, setFetchedPrice] = useState(0);
    const [creating, setCreating] = useState(false); // Loading state for creation
    const [creationSuccess, setCreationSuccess] = useState(false); // Success State

    // Investment Validation State
    const [investmentAsset, setInvestmentAsset] = useState('quote'); // 'quote' (USDT) or 'base' (COIN)
    const [walletAssets, setWalletAssets] = useState([]);
    const [availableUSDT, setAvailableUSDT] = useState(0);

    // --- FETCH BALANCE ---
    useEffect(() => {
        if (!isOpen) return;
        const fetchBalance = async () => {
            const token = getToken();
            if (!token) return;
            try {
                const modeQuery = isPaperTrading ? '?mode=paper' : '?mode=live';
                // Fetch both for complete data
                const [portRes, dashRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/user/portfolio${modeQuery}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE_URL}/user/dashboard${modeQuery}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (portRes.ok) {
                    const data = await portRes.json();
                    setWalletAssets(data.assets || []);
                }
                if (dashRes.ok) {
                    const data = await dashRes.json();
                    setAvailableUSDT(parseFloat(data.balances?.available || 0));
                }
            } catch (e) {
                console.error("Failed to fetch balance:", e);
            }
        };
        fetchBalance();
    }, [isOpen, isPaperTrading]);

    // Calculate Available Balance based on selection
    const availableBalance = useMemo(() => {
        if (investmentAsset === 'quote') return availableUSDT;

        const baseSymbol = config.pair.split('/')[0];
        const asset = walletAssets.find(a => a.symbol === baseSymbol);

        // Use 'free' if available (backend update), otherwise fallback to 'balance' (total)
        // This ensures funds locked in other orders/bots are NOT shown as available.
        return asset ? parseFloat(asset.free !== undefined ? asset.free : asset.balance) : 0;
    }, [walletAssets, availableUSDT, investmentAsset, config.pair]);

    // Theme Colors based on Mode
    const themeColor = '#00FF9D';
    const themeBgHover = 'hover:bg-[#00FF9D]';
    const themeText = 'text-[#00FF9D]';
    const themeBorder = 'border-[#00FF9D]';

    const filteredPairs = useMemo(() => {
        return ALL_PAIRS.filter(pair => pair.toLowerCase().includes(pairSearch.toLowerCase()));
    }, [pairSearch]);

    // --- HELPER: Calculate Range based on Price & Risk ---
    const calculateRange = (price, risk) => {
        let percentage = 0.10; // Default High
        if (risk === 'medium') percentage = 0.20;
        if (risk === 'low') percentage = 0.30;

        const newUpper = parseFloat((price * (1 + percentage)).toFixed(4));
        const newLower = parseFloat((price * (1 - percentage)).toFixed(4));
        return { newUpper, newLower };
    };

    // --- 1. FETCH PRICE ---
    useEffect(() => {
        if (!isOpen) return;

        const fetchPrice = async () => {
            setIsPriceLoading(true);
            try {
                const exch = config.exchange ? config.exchange.toLowerCase() : 'binance';
                const url = `${API_BASE_URL}/user/market-data?exchange=${exch}&symbol=${config.pair}`;

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();

                    let price = 0;
                    if (data.price) {
                        price = parseFloat(data.price);
                    } else if (data.bids && data.bids.length > 0 && data.asks && data.asks.length > 0) {
                        const bestBid = parseFloat(data.bids[0][0]);
                        const bestAsk = parseFloat(data.asks[0][0]);
                        price = (bestBid + bestAsk) / 2;
                    }

                    if (price > 0 && !isNaN(price)) {
                        setFetchedPrice(price);
                        const { newUpper, newLower } = calculateRange(price, riskLevel);
                        setConfig(prev => ({ ...prev, upperPrice: newUpper, lowerPrice: newLower }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch live price:", error);
            } finally {
                setIsPriceLoading(false);
            }
        };

        fetchPrice();
    }, [config.pair, config.exchange, isOpen]);

    // --- 2. UPDATE INPUTS WHEN RISK/MODE CHANGES ---
    useEffect(() => {
        if (fetchedPrice <= 0) return;
        if (mode === 'manual') return;

        const { newUpper, newLower } = calculateRange(fetchedPrice, riskLevel);

        setConfig(prev => ({
            ...prev,
            upperPrice: newUpper,
            lowerPrice: newLower,
            trailingUp: mode === 'auto' ? true : prev.trailingUp,
            trailingDown: mode === 'auto' ? true : prev.trailingDown
        }));

    }, [fetchedPrice, mode, riskLevel]);

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
            }
            return changed ? newConfig : prev;
        });
    }, [config.gridType, config.orderSizeType]);

    // --- 3. POPULATE FOR EDIT MODE ---
    useEffect(() => {
        if (initialBot && isOpen) {
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
                gridType: (strat.grid_type === 'GEOMETRIC') ? 'Geometric' : 'Arithmetic',
                orderSizeType: strat.order_size_type || 'quote',
                gridGap: parseFloat(strat.grid_gap || 0)
            });
            setMode(cfg.mode === 'paper' ? 'manual' : 'manual'); // Usually Manual if editing
            setRiskLevel('medium'); // Default or could derive
            setAddedInvestment(0);
        }
    }, [initialBot, isOpen]);


    const handleCreate = async () => {
        const up = Number(config.upperPrice);
        const low = Number(config.lowerPrice);

        if (up <= 0 || low <= 0) {
            alert("Price range is invalid.");
            return;
        }

        if (low >= up) {
            alert("Error: Lower Price must be smaller than Upper Price.");
            return;
        }

        // Validate Balance
        // If Editing: Check addedInvestment vs Balance
        // If Creating: Check total Investment vs Balance
        const amountToCheck = initialBot ? addedInvestment : config.investment;

        if (amountToCheck > availableBalance) {
            alert(`Insufficient ${investmentAsset === 'quote' ? 'USDT' : config.pair.split('/')[0]} Balance.`);
            return;
        }

        // --- VALIDATION: INFINITY GRID SAFETY LOCK ---
        // Block Arithmetic + Base + Trailing Up
        if (config.gridType === 'Arithmetic' && config.orderSizeType === 'base' && config.trailingUp) {
            alert("❌ Configuration Error: You cannot combine 'Arithmetic' spacing with 'Fixed Coin (Base)' and 'Trailing Up'. This causes funding gaps. Please use 'Geometric' spacing or 'Fixed USDT (Quote)'.");
            return;
        }
        // ---------------------------------------------

        setCreating(true);

        // Convert Investment to USDT if Base is selected (Approx)
        let finalInvestment = Number(config.investment);
        let finalAdded = Number(addedInvestment);

        if (investmentAsset === 'base') {
            // Conversion logic needed if user inputs Base currency
            // For now assume USDT for simplicity or apply price
        }

        // If Editing, New Total = Old + Added
        if (initialBot) {
            finalInvestment = finalInvestment + finalAdded;
        }

        const payload = {
            bot_name: initialBot ? initialBot.bot_name : `${config.pair} Grid Bot (${isPaperTrading ? 'Paper' : 'Live'})`,
            quote_currency: config.pair.split('/')[0],
            bot_type: 'GRID',
            status: initialBot ? initialBot.status : 'active',
            mode: isPaperTrading ? 'paper' : 'live',
            added_investment: finalAdded, // Backend needs this to adjust balances
            config: {
                exchange: config.exchange,
                pair: config.pair,
                mode: isPaperTrading ? 'paper' : 'live',
                strategy: {
                    upper_price: Number(config.upperPrice),
                    lower_price: Number(config.lowerPrice),
                    grids: Number(config.grids),
                    investment: finalInvestment,
                    trailing_up: config.trailingUp,
                    trailing_down: config.trailingDown,
                    grid_type: config.gridType.toUpperCase(),
                    // New Fields
                    order_size_type: config.orderSizeType,
                    grid_gap: Number(config.gridGap)
                }
            }
        };

        try {
            const token = getToken();
            const url = initialBot ? `${API_BASE_URL}/user/bot/${initialBot.bot_id || initialBot.id}` : `${API_BASE_URL}/user/bot`;
            const method = initialBot ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setCreationSuccess(true);
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                    setCreationSuccess(false);
                }, 1500);
            } else {
                const errData = await res.json();
                alert(`Failed to ${initialBot ? 'update' : 'create'} bot: ${errData.message || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            alert("Connection failed");
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    const numUpper = Number(config.upperPrice) || 0;
    const numLower = Number(config.lowerPrice) || 0;
    const numGrids = Number(config.grids) || 0;
    const numInv = Number(config.investment) || 0;

    const priceRange = numUpper - numLower;
    const gridStep = numGrids > 0 ? (priceRange / numGrids) : 0;
    const investmentPerGrid = numGrids > 0 ? (numInv / numGrids).toFixed(2) : 0;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm">

            <div className={`bg-[#000000] border border-white/10 rounded-3xl w-full max-w-6xl p-8 relative grid grid-cols-1 lg:grid-cols-12 gap-8`}>

                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-20">
                    <X size={24} />
                </button>

                {/* --- LEFT SIDE: CONFIGURATION --- */}
                <div className="lg:col-span-7 flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-white mb-1">{initialBot ? 'Edit Bot Configuration' : `Configure ${isPaperTrading ? 'Paper' : 'Live'} Grid Bot`}</h2>
                    <p className="text-sm text-gray-400 mb-6">{initialBot ? 'Modify your running bot. Adding investment requires rebalancing.' : 'Setup your automated grid trading parameters.'}</p>

                    <div className="space-y-5">
                        {/* EXCHANGE & PAIR */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Exchange</label>
                                <div className="relative">
                                    <select
                                        value={config.exchange}
                                        onChange={(e) => setConfig({ ...config, exchange: e.target.value })}
                                        className={`w-full bg-[#050B0D] border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-[${themeColor}] appearance-none cursor-pointer text-sm focus:${themeBorder}`}
                                    >
                                        <option>Binance</option><option>Bybit</option><option>OKX</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                                </div>
                            </div>

                            <div className="space-y-1 relative">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Pair</label>
                                <div
                                    className={`w-full bg-[#050B0D] border border-white/10 rounded-lg px-3 py-2.5 flex items-center justify-between cursor-pointer hover:${themeBorder} hover:border-opacity-30`}
                                    onClick={() => setIsPairOpen(!isPairOpen)}
                                >
                                    <span className="text-white text-sm truncate">{config.pair}</span>
                                    <ChevronDown size={14} className="text-gray-500" />
                                </div>
                                {isPairOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-[#050B0D] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden h-60 flex flex-col">
                                        <div className="p-2 border-b border-white/5">
                                            <div className="flex items-center bg-[#050B0D] rounded px-2 py-1.5 border border-white/5">
                                                <Search size={14} className="text-gray-500 mr-2" />
                                                <input type="text" autoFocus placeholder="SEARCH" className="bg-transparent text-xs text-white outline-none w-full uppercase" value={pairSearch} onChange={(e) => setPairSearch(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto flex-1">
                                            {filteredPairs.map((p) => {
                                                const isPriority = PRIORITY_COINS.some(c => p.startsWith(c + '/'));
                                                return (
                                                    <div key={p} onClick={() => { setConfig({ ...config, pair: p }); setIsPairOpen(false); }} className={`px-4 py-2 text-xs cursor-pointer flex items-center justify-between border border-transparent hover:border-[#00FF9D] rounded ${config.pair === p ? `text-[${themeColor}] bg-[${themeColor}]/5` : 'text-gray-300'}`}>
                                                        <span className={isPriority ? 'font-bold text-white' : ''}>{p}</span>
                                                        {isPriority && <span className="text-[10px] text-yellow-500">★</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MODE TOGGLE */}
                        <div className="flex bg-[#050B0D] p-1 rounded-lg mt-2">
                            <button onClick={() => setMode('auto')} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${mode === 'auto' ? `bg-[${themeColor}] text-black` : 'text-gray-400 hover:text-white'}`} style={mode === 'auto' ? { backgroundColor: themeColor } : {}}>AUTO (AI)</button>
                            <button onClick={() => setMode('manual')} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${mode === 'manual' ? `bg-[${themeColor}] text-black` : 'text-gray-400 hover:text-white'}`} style={mode === 'manual' ? { backgroundColor: themeColor } : {}}>MANUAL</button>
                        </div>

                        {/* FIXED HEIGHT WRAPPER */}
                        <div className="h-[180px] flex flex-col justify-center">
                            {mode === 'auto' ? (
                                <div className="space-y-3 w-full">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Select Risk Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button onClick={() => setRiskLevel('high')} className={`py-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${riskLevel === 'high' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                            High Risk <span className="text-[10px] font-normal opacity-70">±10% Range</span>
                                        </button>
                                        <button onClick={() => setRiskLevel('medium')} className={`py-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${riskLevel === 'medium' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                            Medium Risk <span className="text-[10px] font-normal opacity-70">±20% Range</span>
                                        </button>
                                        <button onClick={() => setRiskLevel('low')} className={`py-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${riskLevel === 'low' ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                                            Low Risk <span className="text-[10px] font-normal opacity-70">±30% Range</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 w-full">
                                    <div className="grid grid-cols-2 gap-4 relative">
                                        {isPriceLoading && <div className={`absolute inset-0 bg-black z-10 flex items-center justify-center rounded-lg`}><Loader2 size={16} className={`animate-spin ${themeText}`} /></div>}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Upper Price</label>
                                            <input
                                                type="number"
                                                value={config.upperPrice}
                                                onChange={(e) => setConfig({ ...config, upperPrice: e.target.value })}
                                                className={`w-full bg-[#050B0D] border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:${themeBorder} text-sm`}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Lower Price</label>
                                            <input
                                                type="number"
                                                value={config.lowerPrice}
                                                onChange={(e) => setConfig({ ...config, lowerPrice: e.target.value })}
                                                className={`w-full bg-[#050B0D] border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:${themeBorder} text-sm`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Trailing Features</label>
                                        <div className="flex gap-4">
                                            <div className="relative group flex-1">
                                                <label className={`flex items-center gap-2 cursor-pointer bg-[#1c1e22] px-4 py-2 rounded-lg border border-white/5 transition-all justify-center ${config.orderSizeType === 'base' ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20'}`}>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${config.trailingUp ? `bg-[${themeColor}] border-[${themeColor}]` : 'border-gray-600'}`} style={config.trailingUp ? { backgroundColor: themeColor, borderColor: themeColor } : {}}>{config.trailingUp && <Check size={12} className="text-black" />}</div>
                                                    <input type="checkbox" className="hidden" checked={config.trailingUp} disabled={config.orderSizeType === 'base'} onChange={e => setConfig({ ...config, trailingUp: e.target.checked })} />
                                                    <span className="text-xs text-gray-300 group-hover:text-white font-bold">Trailing Up</span>
                                                </label>
                                                {config.orderSizeType === 'base' && (
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1A2329] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10 shadow-xl whitespace-nowrap min-w-max">
                                                        Not supported in Fixed Coin mode.
                                                    </div>
                                                )}
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer group bg-[#050B0D] px-4 py-2 rounded-lg border border-white/5 hover:border-white/20 transition-all flex-1 justify-center">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${config.trailingDown ? `bg-[${themeColor}] border-[${themeColor}]` : 'border-gray-600'}`} style={config.trailingDown ? { backgroundColor: themeColor, borderColor: themeColor } : {}}>{config.trailingDown && <Check size={12} className="text-black" />}</div>
                                                <input type="checkbox" className="hidden" checked={config.trailingDown} onChange={e => setConfig({ ...config, trailingDown: e.target.checked })} />
                                                <span className="text-xs text-gray-300 group-hover:text-white font-bold">Trailing Down</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- GRID TYPE SELECTOR --- */}
                        <div className="space-y-2 mt-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Grid Type</label>
                            <div className="flex bg-[#050B0D] p-1 rounded-lg">
                                <button
                                    onClick={() => setConfig({ ...config, gridType: 'Arithmetic' })}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${config.gridType === 'Arithmetic' ? `bg-[${themeColor}] text-black` : 'text-gray-400 hover:text-white'}`}
                                    style={config.gridType === 'Arithmetic' ? { backgroundColor: themeColor } : {}}
                                >
                                    ARITHMETIC
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, gridType: 'Geometric' })}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${config.gridType === 'Geometric' ? `bg-[${themeColor}] text-black` : 'text-gray-400 hover:text-white'}`}
                                    style={config.gridType === 'Geometric' ? { backgroundColor: themeColor } : {}}
                                >
                                    GEOMETRIC
                                </button>
                            </div>
                        </div>

                        {/* --- ORDER SIZE TYPE (Infinity Grid) --- */}
                        <div className="space-y-2 mt-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Order Size Type (Advanced)</label>
                            <div className="flex bg-[#050B0D] p-1 rounded-lg">
                                <div className="relative group flex-1">
                                    <button
                                        onClick={() => setConfig({ ...config, orderSizeType: 'quote' })}
                                        disabled={config.gridType === 'Arithmetic'}
                                        className={`w-full py-1.5 rounded-md text-[10px] font-bold transition-all ${config.gridType === 'Arithmetic' ? 'opacity-50 cursor-not-allowed text-gray-500' : config.orderSizeType === 'quote' ? `bg-[${themeColor}] text-black` : 'text-gray-400 hover:text-white'}`}
                                        style={config.orderSizeType === 'quote' && config.gridType !== 'Arithmetic' ? { backgroundColor: themeColor } : {}}
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
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${config.orderSizeType === 'base' ? `bg-[${themeColor}] text-black` : 'text-gray-400 hover:text-white'}`}
                                    style={config.orderSizeType === 'base' ? { backgroundColor: themeColor } : {}}
                                >
                                    FIXED COIN (Base)
                                </button>
                            </div>
                        </div>

                        {/* --- COMMON INPUTS --- */}
                        <div className="space-y-2 mt-2">
                            {initialBot ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                        <span>Current Investment</span>
                                        <span className="text-white">${config.investment.toFixed(2)}</span>
                                    </div>
                                    <label className="block text-[10px] font-bold text-[#00FF9D] uppercase">Add Extra Investment (USDT)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={addedInvestment}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setAddedInvestment(val >= 0 ? val : 0);
                                            }}
                                            className={`w-full bg-[#050B0D] border border-[#00FF9D]/30 rounded-lg px-3 py-2.5 text-white outline-none focus:border-[#00FF9D] text-sm`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Total Investment</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={config.investment}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value) || 0;
                                                setConfig({ ...config, investment: val });
                                            }}
                                            className={`w-full bg-[#050B0D] border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:${themeBorder} text-sm`}
                                        />
                                        {/* Asset Selector (Only on Init) */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex bg-[#050B0D] rounded-lg border border-white/10 p-1">
                                            <button
                                                onClick={() => setInvestmentAsset('quote')}
                                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${investmentAsset === 'quote' ? `bg-[${themeColor}] text-black` : 'text-gray-400 hover:text-white'}`}
                                                style={investmentAsset === 'quote' ? { backgroundColor: themeColor } : {}}
                                            >
                                                USDT
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Balance Display & Validation Message */}
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] text-gray-500 font-medium">
                                    {initialBot ? 'Available to Add:' : 'Available:'} <span className="text-white">{availableBalance.toFixed(4)} {investmentAsset === 'quote' ? 'USDT' : config.pair.split('/')[0]}</span>
                                </span>
                                {(initialBot ? addedInvestment : config.investment) > availableBalance && (
                                    <span className="text-[10px] text-red-500 font-bold animate-pulse">
                                        Insufficient Balance
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Number of Grids</label>
                            <div className="relative">
                                <input type="number" value={config.grids} onChange={(e) => setConfig({ ...config, grids: parseFloat(e.target.value) || 0 })} className={`w-full bg-[#050B0D] border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:${themeBorder} text-sm`} />
                                <LayoutGrid size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        {creationSuccess ? (
                            <button
                                disabled
                                className={`w-full text-black font-bold py-3.5 rounded-xl mt-4 flex justify-center items-center gap-2 bg-green-500 transition-all`}
                            >
                                <Check size={20} />
                                Success! Starting Engine...
                            </button>
                        ) : (
                            <button
                                onClick={handleCreate}
                                disabled={creating || config.investment > availableBalance || config.investment <= 0}
                                className={`w-full text-black font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-all mt-4 flex justify-center items-center gap-2 bg-[#00FF9D] hover:bg-[#00cc7d] ${(creating || config.investment > availableBalance || config.investment <= 0) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                            >
                                {creating ? <Loader2 className="animate-spin" /> : (initialBot ? 'Update & Restart Bot' : `Create ${isPaperTrading ? 'Paper' : 'Live'} Grid Bot`)}
                            </button>
                        )}
                    </div>
                </div>

                {/* --- RIGHT SIDE: PREVIEW --- */}
                <div className="lg:col-span-5 h-full">
                    <div className="bg-[#1c1e22] border border-white/5 rounded-3xl p-8 sticky top-10 h-full flex flex-col">
                        <h2 className="text-xl font-bold text-white mb-6">Strategy Preview</h2>

                        <div className="space-y-4 text-sm flex-1">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-gray-400">Current Price</span>
                                <span className={`font-bold ${themeText}`}>${fetchedPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-gray-400">Grid Range</span>
                                <span className="font-bold text-white">
                                    {numLower > 0 ? numLower.toFixed(4) : '---'} - {numUpper > 0 ? numUpper.toFixed(4) : '---'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-gray-400">Grid Density</span>
                                <span className="font-bold text-white">
                                    {numGrids} Grids (~${gridStep.toFixed(2)} step)
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-gray-400">Grid Type</span>
                                <span className="font-bold text-white uppercase">{config.gridType}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-gray-400">Investment per Grid</span>
                                <span className="font-bold text-white">${investmentPerGrid}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-gray-400">Mode</span>
                                <span className={`font-bold uppercase ${mode === 'auto' ? themeText : 'text-yellow-500'}`}>{mode} ({mode === 'auto' ? riskLevel : 'Custom'})</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-gray-400">Trailing</span>
                                <div className="flex gap-2">
                                    {config.trailingUp && <span className={`text-[10px] bg-[${themeColor}]/10 text-[${themeColor}] px-2 py-1 rounded`} style={{ color: themeColor, backgroundColor: `${themeColor}1a` }}>UP</span>}
                                    {config.trailingDown && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded">DOWN</span>}
                                    {!config.trailingUp && !config.trailingDown && <span className="text-gray-600">-</span>}
                                </div>
                            </div>
                        </div>

                        <div className={`mt-6 flex items-start gap-2 p-4 bg-[${themeColor}]/5 border border-[${themeColor}]/20 rounded-xl min-h-[80px]`} style={{ borderColor: `${themeColor}33`, backgroundColor: `${themeColor}0d` }}>
                            <Info size={18} className="shrink-0 mt-0.5" style={{ color: themeColor }} />
                            <p className="text-xs leading-relaxed" style={{ color: themeColor }}>
                                Bot will place <strong>{numGrids} orders</strong> in the price range of {numLower.toFixed(2)} to {numUpper.toFixed(2)}.
                                {mode === 'auto' ? ` Optimized for ${riskLevel} risk market conditions.` : ' Using custom manual settings.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >,
        document.body
    );
};

export default ConfigureBotModal;
