// src/LiveMarket.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Bell, Plus, Search, ChevronDown, ArrowUp, ArrowDown,
    Clock, Sliders, MoreHorizontal, Activity, Wallet, X, Check, CheckCircle2, History, ArrowLeftRight
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import AccountInfo from '../../components/AccountInfo';
import Header from '../../components/Header';
import API_BASE_URL from '../../config';
import { useTrading } from '../../context/TradingContext';
import ExchangeFilter from '../../components/ExchangeFilter';

// --- 1. CONFIGURATION & DATA ---

// Exchange list moved below

const MARKETS = [
    { id: 'USDT', name: 'USDT', balance: '0.0052569' },
    { id: 'USDC', name: 'USDC', balance: '540.20' },
    { id: 'BTC', name: 'BTC', balance: '0.000000' },
];

import { getSortedPairs } from '../../data/pairs';

// Full Pair List
const PAIRS_DATA = getSortedPairs().map(p => {
    const [base, quote] = p.split('/');
    return {
        label: p,
        value: `${base}${quote}`,
        base: base,
        quote: quote
    };
});

const EXCHANGES = [
    { name: 'Binance', logo: '/exchanges_svg/binance.svg', id: 'binance', takerFee: 0.1, makerFee: 0.1 },
    { name: 'OKX', logo: '/exchanges_svg/okx.svg', id: 'okx', takerFee: 0.05, makerFee: 0.02 },
    { name: 'Bybit', logo: '/exchanges_svg/Bybit.svg', id: 'bybit', takerFee: 0.06, makerFee: 0.01 },
    { name: 'Coinbase', logo: '/exchanges_svg/CoinBase.svg', id: 'coinbase', takerFee: 0.6, makerFee: 0.4 },
    { name: 'Kraken', logo: '/exchanges_svg/Kraken.svg', id: 'kraken', takerFee: 0.26, makerFee: 0.16 },
    { name: 'KuCoin', logo: '/exchanges_svg/KuCoin.svg', id: 'kucoin', takerFee: 0.1, makerFee: 0.1 },
    { name: 'Bitget', logo: '/exchanges_svg/Bitget.svg', id: 'bitget', takerFee: 0.06, makerFee: 0.02 },
    { name: 'Gate.io', logo: '/exchanges_svg/Gate.svg', id: 'gateio', takerFee: 0.2, makerFee: 0.2 },
];

// --- 2. COMPONENTS ---

import TradingViewWidget from '../../components/TradingViewWidget';

// ... (TradingViewWidget definition removed)


const CoinLogo = ({ symbol }) => {
    const [error, setError] = useState(false);

    // Reset error when symbol changes (though key usually handles this)
    useEffect(() => {
        setError(false);
    }, [symbol]);

    return error ? (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">
            {symbol[0]}
        </div>
    ) : (
        <img
            src={`https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`}
            alt={symbol}
            className="w-8 h-8 rounded-full"
            onError={() => setError(true)}
        />
    );
};

const TickerTape = ({ pairs, selectedPair, onSelectPair }) => {
    // Mock 24h change data
    const getChange = (base) => {
        const changes = { 'BTC': 4.6, 'ETH': 1.35, 'SOL': -2.1, 'ADA': 1.6, 'NEAR': 4.4, 'GUS': 0.3, 'AVE': 1.32, 'XTZ': 0.15, 'XRP': -0.5 };
        return changes[base] || 0.5;
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-4">
            {pairs.slice(0, 10).map(p => {
                const change = getChange(p.base);
                const isPositive = change >= 0;
                return (
                    <div
                        key={p.value}
                        onClick={() => onSelectPair(p)}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-full border cursor-pointer min-w-[200px] transition-all
                            ${selectedPair.value === p.value
                                ? 'bg-[#131B1F] border-[#00FF9D]/50 shadow-[0_0_15px_rgba(0,255,157,0.1)]'
                                : 'bg-[#0A1014] border-transparent hover:border-white/10'
                            }
                        `}
                    >
                        <CoinLogo symbol={p.base} />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{p.base} / USDT</span>
                        </div>
                        <div className={`ml-auto text-xs font-bold ${isPositive ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                            {isPositive ? '▲' : '▼'} {Math.abs(change)}%
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- Account Mode Modal ---
const AccountModeModal = ({ isOpen, onClose, currentMode, onConfirm }) => {
    const [selectedMode, setSelectedMode] = useState(currentMode);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-[#111418] rounded-xl w-full max-w-md shadow-2xl border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="text-white font-bold text-lg">Account Mode</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Isolated Card */}
                    <div
                        onClick={() => setSelectedMode('Isolated')}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedMode === 'Isolated' ? 'border-[#00FF9D] bg-[#00FF9D]/5' : 'border-white/5 bg-[#0A1014] hover:border-white/10'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-bold text-sm">Isolated</span>
                            {selectedMode === 'Isolated' && <div className="bg-[#00FF9D] rounded-full p-0.5"><Check size={12} className="text-black" /></div>}
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Each position uses its own dedicated margin. If a position's margin falls below its maintenance threshold, only that position is liquidated. Your other positions and remaining balance are protected.
                        </p>
                    </div>

                    {/* Cross Card */}
                    <div
                        onClick={() => setSelectedMode('Cross')}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedMode === 'Cross' ? 'border-[#00FF9D] bg-[#00FF9D]/5' : 'border-white/5 bg-[#0A1014] hover:border-white/10'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-bold text-sm">Cross</span>
                            {selectedMode === 'Cross' && <div className="bg-[#00FF9D] rounded-full p-0.5"><Check size={12} className="text-black" /></div>}
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            All positions share your total account equity as margin. If your account health falls below the maintenance threshold, positions will be liquidated one by one (starting with the riskiest) until your account is healthy again.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg bg-[#2B3139] text-white font-bold text-sm hover:bg-[#363C45] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(selectedMode)}
                        className="flex-1 py-2.5 rounded-lg bg-[#00FF9D] text-black font-bold text-sm hover:bg-[#00E08A] transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Leverage Modal ---
const LeverageModal = ({ isOpen, onClose, currentLeverage, onConfirm, pair }) => {
    const [leverage, setLeverage] = useState(currentLeverage);

    if (!isOpen) return null;

    // Use pair or default if not provided
    const displayPair = pair ? pair.replace('/', '-') : 'BTC-USD';
    const maxPosition = (10000000 / leverage).toLocaleString(); // Mock calculation matching screenshot

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-[#111418] rounded-xl w-full max-w-[480px] shadow-2xl border border-white/5 overflow-hidden scale-110 origin-center">
                {/* Header */}
                <div className="flex justify-between items-center p-5">
                    <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold text-xl">Change Leverage</h3>
                        <span className="bg-[#2B3139] text-gray-400 text-xs font-bold px-2 py-1 rounded border border-white/5">{displayPair}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 pt-4 space-y-8">
                    {/* Current Leverage Display */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-base font-medium">Current Leverage</span>
                        <span className="text-white font-bold text-lg">{leverage}x</span>
                    </div>

                    {/* Slider Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-base font-bold text-white mb-2">
                            <span>Leverage</span>
                            <span>{leverage}x</span>
                        </div>
                        <div className="relative h-2 bg-[#2B3139] rounded-full">
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-[#363C45] rounded-full"
                                style={{ width: `${leverage}%` }}
                            ></div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={leverage}
                                onChange={(e) => setLeverage(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-[#D1D5DB] rounded-full cursor-pointer z-20 hover:scale-110 transition-transform shadow-lg"
                                style={{ left: `calc(${leverage}% - 12px)` }}
                            ></div>

                            {/* Ruler ticks */}
                            <div className="absolute top-4 w-full flex justify-between text-xs text-gray-500 font-medium">
                                <span>1x</span>
                                <span>100x</span>
                            </div>
                        </div>
                        <div className="h-4"></div> {/* Spacer for ticks */}
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-6 gap-3">
                        {[1, 2, 5, 10, 25, 50, 100].map((val) => (
                            <button
                                key={val}
                                onClick={() => setLeverage(val)}
                                className={`py-2.5 rounded-md text-xs font-bold transition-all border ${leverage === val ? 'bg-[#20362B] text-[#00FF9D] border-[#00FF9D]' : 'bg-[#151A1E] text-gray-400 border-white/5 hover:bg-[#1E2329]'}`}
                            >
                                {val}x
                            </button>
                        ))}
                    </div>

                    {/* Max Position Info */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Maximum position at {leverage}x</span>
                        <span className="text-white font-bold text-base">{maxPosition} USD</span>
                    </div>

                    <div className="bg-[#151A1E] p-4 rounded-lg text-xs text-gray-400 leading-relaxed border border-white/5">
                        Leverage affects margin requirements and liquidation distance.
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 flex gap-4 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-lg bg-[#2B3139] text-white font-bold text-sm hover:bg-[#363C45] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(leverage)}
                        className="flex-1 py-3.5 rounded-lg bg-[#00FF9D] text-black font-bold text-sm hover:bg-[#00E08A] transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrderBook = ({ exchange, pair }) => {
    const [orderBook, setOrderBook] = useState({ bids: [], asks: [], currentPrice: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('OB'); // 'OB' | 'Trades'
    const [precision, setPrecision] = useState(5);
    const precisionOptions = [5, 25, 50, 250];
    const [sizeMode, setSizeMode] = useState('base'); // 'base' (BTC) | 'quote' (USD)
    const [trades, setTrades] = useState([]); // [NEW] Trades Data

    const generateMockData = (price) => {
        const bids = [];
        const asks = [];
        for (let i = 0; i < 15; i++) {
            bids.push([price * (1 - (i + 1) * 0.0005), Math.random() * 2]);
            asks.push([price * (1 + (i + 1) * 0.0005), Math.random() * 2]);
        }
        return { bids, asks, currentPrice: price };
    };

    const generateMockTrades = (price) => {
        const newTrades = [];
        const now = new Date();
        for (let i = 0; i < 20; i++) {
            const side = Math.random() > 0.5 ? 'buy' : 'sell';
            const tradePrice = price * (1 + (Math.random() - 0.5) * 0.001);
            const amount = Math.random() * 0.5;
            // Mock time: decrement minutes/seconds
            const time = new Date(now.getTime() - i * 5000);
            const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`; // Simple H:MM

            newTrades.push({
                price: tradePrice,
                amount: amount,
                time: timeStr + ' GMT+4', // Matching screenshot format roughly
                side: side
            });
        }
        return newTrades;
    };

    useEffect(() => {
        const fetchOrderBook = async () => {
            setLoading(true);
            try {
                let formattedSymbol = pair;
                if (!formattedSymbol.includes('/')) {
                    const length = formattedSymbol.length;
                    formattedSymbol = formattedSymbol.substring(0, length - 4) + '/' + formattedSymbol.substring(length - 4);
                }

                // Use API_BASE_URL here
                const res = await fetch(`${API_BASE_URL}/user/market-data?exchange=${exchange}&symbol=${formattedSymbol}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.bids && data.bids.length > 0) {
                        const topBid = data.bids[0][0];
                        const topAsk = data.asks[0][0];
                        const price = (topBid + topAsk) / 2;
                        setOrderBook({
                            bids: data.bids.slice(0, 14),
                            asks: data.asks.slice(0, 14).reverse(),
                            currentPrice: price
                        });
                        setTrades(generateMockTrades(price));
                        return;
                    }
                }
                // Fallback to mock data if fetch fails or is empty
                const mockPrice = pair.includes('BTC') ? 68091.60 : 1500;
                setOrderBook(generateMockData(mockPrice));
                setTrades(generateMockTrades(mockPrice));
            } catch (err) {
                console.error("OrderBook fetch error:", err);
                // Fallback
                const mockPrice = pair.includes('BTC') ? 68091.60 : 1500;
                setOrderBook(generateMockData(mockPrice));
                setTrades(generateMockTrades(mockPrice));
            } finally {
                setLoading(false);
            }
        };

        fetchOrderBook();
        // Optional: Poll every 5 seconds
        const interval = setInterval(fetchOrderBook, 5000);
        return () => clearInterval(interval);

    }, [exchange, pair]);

    const maxAskSize = Math.max(...orderBook.asks.map(a => a[1]), 1);
    const maxBidSize = Math.max(...orderBook.bids.map(b => b[1]), 1);

    // Mock Buy/Sell Ratio
    const buyPercentage = 46;
    const sellPercentage = 54;

    return (
        <div className="bg-[#0A1014] border border-white/10 h-full flex flex-col overflow-hidden">
            {/* 1. Header Tabs */}
            <div className="flex items-center px-4 border-b border-white/5 bg-[#0A1014]">
                {['OB', 'Trades'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white mx-auto w-full"></div>}
                    </button>
                ))}
            </div>

            {activeTab === 'OB' ? (
                <>

                    {/* 3. Table Header */}
                    <div className="flex justify-between px-4 py-2 text-[10px] font-medium text-gray-500">
                        <span>Price (USD)</span>
                        <span
                            className="cursor-pointer hover:text-white transition-colors"
                            onClick={() => setSizeMode(prev => prev === 'base' ? 'quote' : 'base')}
                        >
                            {sizeMode === 'base' ? 'Size (BTC)' : 'Value (USD)'}
                        </span>
                    </div>

                    {/* 4. Asks (Sells) - Top Half */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col-reverse justify-end pb-1">
                        {orderBook.asks.map((ask, i) => {
                            const widthPercent = (ask[1] / maxAskSize) * 100;
                            // Round price based on precision
                            const displayPrice = (Math.round(ask[0] / precision) * precision).toFixed(precision < 1 ? 1 : 0);

                            return (
                                <div key={i} className="flex justify-between items-center px-4 py-0.5 text-[11px] relative hover:bg-white/5 cursor-pointer group">
                                    {/* Depth Bar Background */}
                                    <div
                                        className="absolute top-0 bottom-0 right-0 bg-[#DE3E46]/20 transition-all duration-300 z-0"
                                        style={{ width: `${widthPercent}%` }}
                                    ></div>
                                    <span className="text-[#F6465D] relative z-10 font-medium">{displayPrice}</span>
                                    <span className="text-white relative z-10 font-medium">
                                        {sizeMode === 'base'
                                            ? ask[1].toFixed(5)
                                            : (ask[1] * ask[0]).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                        }
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 5. Current Price Display */}
                    <div className="py-2 px-4 flex justify-between items-center relative z-20">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-medium text-[#F6465D]">{orderBook.currentPrice.toLocaleString()}</span>
                            <ArrowDown size={16} className="text-[#F6465D]" strokeWidth={3} />
                        </div>
                        <span className="text-gray-400 text-sm font-medium">1.0</span>
                    </div>


                    {/* 6. Bids (Buys) - Bottom Half */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pt-1">
                        {orderBook.bids.map((bid, i) => {
                            const widthPercent = (bid[1] / maxBidSize) * 100;
                            const displayPrice = (Math.round(bid[0] / precision) * precision).toFixed(precision < 1 ? 1 : 0);

                            return (
                                <div key={i} className="flex justify-between items-center px-4 py-0.5 text-[11px] relative hover:bg-white/5 cursor-pointer group">
                                    {/* Depth Bar Background */}
                                    <div
                                        className="absolute top-0 bottom-0 right-0 bg-[#00FF9D]/20 transition-all duration-300 z-0"
                                        style={{ width: `${widthPercent}%` }}
                                    ></div>
                                    <span className="text-[#0ECB81] relative z-10 font-medium">{displayPrice}</span>
                                    <span className="text-white relative z-10 font-medium">
                                        {sizeMode === 'base'
                                            ? bid[1].toFixed(5)
                                            : (bid[1] * bid[0]).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                        }
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 7. Buy/Sell Ratio Footer */}
                    <div className="px-4 pb-3 pt-2">
                        <div className="flex h-6 rounded overflow-hidden text-[10px] font-bold">
                            <div
                                className="bg-[#20362B] text-[#00FF9D] flex items-center px-2 gap-1 rounded-l"
                                style={{ width: `${buyPercentage}%` }}
                            >
                                <span className="border border-[#00FF9D] rounded-sm px-0.5 text-[8px] h-3 flex items-center justify-center">B</span>
                                {buyPercentage}%
                            </div>
                            <div className="bg-black w-2"></div> {/* Spacer */}
                            <div
                                className="bg-[#3A1F22] text-[#F6465D] flex items-center justify-end px-2 gap-1 rounded-r flex-1"
                            >
                                {sellPercentage}%
                                <span className="border border-[#F6465D] rounded-sm px-0.5 text-[8px] h-3 flex items-center justify-center">S</span>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-3 px-4 py-3 text-[10px] font-medium text-gray-500 border-b border-white/5">
                        <span className="text-left">Price (USD)</span>
                        <span className="text-center">Amount (BTC)</span>
                        <span className="text-right">Time</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {trades.map((trade, i) => (
                            <div key={i} className="grid grid-cols-3 px-4 py-1 text-[11px] hover:bg-white/5 transition-colors cursor-pointer">
                                <span className={`font-medium text-left ${trade.side === 'buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                                    {trade.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                </span>
                                <span className="text-white font-medium text-center">{trade.amount.toFixed(5)}</span>
                                <span className="text-gray-500 text-right">{trade.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
            }
        </div >
    );
};

const getExchangeLogo = (name) => {
    if (!name) return null;
    const n = name.toUpperCase().replace('_PAPER', '');

    // Explicit mapping for consistency with file system
    const map = {
        'BYBIT': '/exchanges_svg/Bybit.svg',
        'BINANCE': '/exchanges_svg/binance.svg',
        'OKX': '/exchanges_svg/okx.svg',
        'COINBASE': '/exchanges_svg/CoinBase.svg',
        'KRAKEN': '/exchanges_svg/Kraken.svg',
        'KUCOIN': '/exchanges_svg/KuCoin.svg',
        'BITGET': '/exchanges_svg/Bitget.svg',
        'BITFINEX': '/exchanges_svg/Bitfinex.svg',
        'GATE': '/exchanges_svg/Gate.svg',
        'GATEIO': '/exchanges_svg/Gate.svg',
        'GEMINI': '/exchanges_svg/Gemini.svg',
        'HTX': '/exchanges_svg/HTX.svg',
        'BITSTAMP': '/exchanges_svg/Bitstamp.svg'
    };

    if (map[n]) return map[n];

    // Fallback: try capitalized first letter
    return `/exchanges_svg/${n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()}.svg`;
};

const TradePanel = ({ pair, market, selectedExchange, connectedExchanges, exchangeFilter, setExchangeFilter, tradingMode, setTradingMode }) => {
    const [orderType, setOrderType] = useState('Limit'); // 'Limit' | 'Market'
    const [showOrderTypeDropdown, setShowOrderTypeDropdown] = useState(false);
    const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);
    const [accountMode, setAccountMode] = useState('Isolated'); // 'Isolated' | 'Cross'
    const [showAccountModeModal, setShowAccountModeModal] = useState(false);
    const [leverage, setLeverage] = useState(5);
    const [showLeverageModal, setShowLeverageModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [isAutoPrice, setIsAutoPrice] = useState(false); // New state for tracking "Mid" price
    const [value, setValue] = useState('');
    const [sliderValue, setSliderValue] = useState(0);
    const [showTPSL, setShowTPSL] = useState(false);
    const [takeProfit, setTakeProfit] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [isValueInBase, setIsValueInBase] = useState(false);
    const [timeInForce, setTimeInForce] = useState('GTC');
    const [showTIFDropdown, setShowTIFDropdown] = useState(false);
    const tifRef = useRef(null);

    const isPairSliced = pair.includes('/');
    const baseAsset = isPairSliced ? pair.split('/')[0] : pair.substring(0, pair.length - 4) || 'BTC';
    const quoteAsset = isPairSliced ? pair.split('/')[1] : pair.substring(pair.length - 4) || 'USDT';

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tifRef.current && !tifRef.current.contains(event.target)) {
                setShowTIFDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Synchronize Value when Price or Amount changes
    useEffect(() => {
        if (price && amount) {
            const calculatedValue = (parseFloat(price) * parseFloat(amount)).toFixed(2);
            if (!isNaN(calculatedValue)) {
                setValue(calculatedValue);
            }
        }
    }, [price, amount]);

    // Numeric Validation Helper
    const validateNumericInput = (val) => {
        // Only allow numbers and one decimal point
        return val === '' || /^\d*\.?\d*$/.test(val);
    };

    const handlePriceChange = (e) => {
        const val = e.target.value;
        if (validateNumericInput(val)) {
            setPrice(val);
            setIsAutoPrice(false);
            if (amount && val) {
                setValue((parseFloat(val) * parseFloat(amount)).toFixed(2));
            }
        }
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (validateNumericInput(val)) {
            setAmount(val);
            const effectivePrice = (orderType === 'Market' && !price) ? currentPrice : parseFloat(price);
            if (effectivePrice && val) {
                setValue((parseFloat(val) * effectivePrice).toFixed(2));
            } else if (val === '') {
                setValue('');
            }
        }
    };

    const handleValueChange = (e) => {
        const val = e.target.value;
        if (validateNumericInput(val)) {
            setValue(val);
            const effectivePrice = (orderType === 'Market' && !price) ? currentPrice : parseFloat(price);
            if (effectivePrice && val && effectivePrice !== 0) {
                setAmount((parseFloat(val) / effectivePrice).toFixed(5));
            } else if (val === '') {
                setAmount('');
            }
        }
    };

    // Generic handler for TP/SL
    const handleTPSLChange = (type, val) => {
        if (validateNumericInput(val)) {
            if (type === 'TP') setTakeProfit(val);
            if (type === 'SL') setStopLoss(val);
        }
    };

    // Mock Data
    const currentPrice = pair.includes('BTC') ? 68091.60 : 145.20;

    // Sync price for Market orders OR when pair changes
    useEffect(() => {
        if (orderType === 'Market' || isAutoPrice) {
            setPrice(currentPrice.toFixed(1));
        }
    }, [orderType, currentPrice, isAutoPrice]);

    // Initial price set on pair change if not manual
    useEffect(() => {
        if (!isAutoPrice && orderType !== 'Market') {
            setPrice(currentPrice.toFixed(1));
        }
    }, [pair]);

    const [availableQuoteBalance, setAvailableQuoteBalance] = useState(0);
    const [availableBaseBalance, setAvailableBaseBalance] = useState(0);
    const [activeBalanceAsset, setActiveBalanceAsset] = useState('quote'); // 'quote' | 'base'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState('');

    const activeBalance = activeBalanceAsset === 'quote' ? availableQuoteBalance : availableBaseBalance;
    const activeCurrency = activeBalanceAsset === 'quote' ? quoteAsset : baseAsset;

    const handleSliderChange = (e) => {
        const val = e.target.value;
        setSliderValue(val);

        if (val > 0) {
            if (activeBalanceAsset === 'base') {
                const calculatedAmount = (availableBaseBalance * (val / 100)).toFixed(5);
                setAmount(calculatedAmount);
                if (price && parseFloat(price) !== 0) {
                    setValue((parseFloat(calculatedAmount) * parseFloat(price)).toFixed(2));
                }
            } else {
                const calculatedValue = (availableQuoteBalance * (val / 100)).toFixed(2);
                setValue(calculatedValue);
                if (price && parseFloat(price) !== 0) {
                    setAmount((parseFloat(calculatedValue) / parseFloat(price)).toFixed(5));
                }
            }
        } else {
            setAmount('');
            setValue('');
        }
    };

    useEffect(() => {
        const fetchBalance = async () => {
            if (!selectedExchange?.name) return;
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                let exName = (exchangeFilter === 'ALL' && connectedExchanges.length > 0) ? connectedExchanges[0].exchange_name : exchangeFilter;
                if (exchangeFilter !== 'ALL') {
                    const matchedConnected = connectedExchanges.find(e => e.exchange_name.toUpperCase().replace('_PAPER', '') === exchangeFilter.toUpperCase().replace('_PAPER', ''));
                    if (matchedConnected) {
                        exName = matchedConnected.exchange_name;
                    }
                }

                const res = await fetch(`${API_BASE_URL}/trade/balance?exchange=${exName}&quote=${quoteAsset}&base=${baseAsset}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAvailableQuoteBalance(data.quote || 0);
                    setAvailableBaseBalance(data.base || 0);
                }
            } catch (err) {
                console.error("Failed to fetch balance:", err);
            }
        };
        fetchBalance();
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [exchangeFilter, quoteAsset, baseAsset, connectedExchanges, selectedExchange]);

    const handleOrder = async (side) => {
        setOrderError('');
        setOrderSuccess('');

        if (!amount || parseFloat(amount) <= 0) {
            setOrderError('Enter a valid amount');
            return;
        }
        if (orderType === 'Limit' && (!price || parseFloat(price) <= 0)) {
            setOrderError('Enter a valid price');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            let exName = (exchangeFilter === 'ALL' && connectedExchanges.length > 0) ? connectedExchanges[0].exchange_name : exchangeFilter;
            if (exchangeFilter !== 'ALL') {
                const matchedConnected = connectedExchanges.find(e => e.exchange_name.toUpperCase().replace('_PAPER', '') === exchangeFilter.toUpperCase().replace('_PAPER', ''));
                if (matchedConnected) {
                    exName = matchedConnected.exchange_name;
                }
            }
            const baseSymbol = `${baseAsset}/${quoteAsset}`;
            const formattedSymbol = tradingMode === 'Future' ? `${baseSymbol}:${quoteAsset}` : baseSymbol;

            const payload = {
                exchange: exName,
                symbol: formattedSymbol,
                type: orderType,
                side: side,
                amount: parseFloat(amount),
                price: orderType === 'Limit' ? parseFloat(price) : undefined,
                marketType: tradingMode, // 'Spot' or 'Future'
                params: {
                    timeInForce: orderType === 'Limit' ? timeInForce : undefined
                }
            };

            const res = await fetch(`${API_BASE_URL}/trade/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                // Trigger a re-fetch of balance (simple hack via setting interval logic could catch it, or just manual force)
                setAvailableQuoteBalance(prev => prev);
                setOrderSuccess(`Order Placed: ${side.toUpperCase()} ${amount} ${formattedSymbol}`);
                setAmount('');
                setValue('');
                setSliderValue(0);
                setTimeout(() => setOrderSuccess(''), 5000);
            } else {
                let errorMsg = data.message;
                // Attempt to parse raw exchange error payloads (e.g., from OKX)
                if (errorMsg && errorMsg.includes('{') && errorMsg.includes('}')) {
                    try {
                        // Extract the JSON part from the ccxt error string
                        const jsonStart = errorMsg.indexOf('{');
                        const jsonStr = errorMsg.substring(jsonStart);
                        const parsedObj = JSON.parse(jsonStr);

                        if (parsedObj.data && Array.isArray(parsedObj.data) && parsedObj.data[0]?.sMsg) {
                            errorMsg = parsedObj.data[0].sMsg;
                        } else if (parsedObj.msg) {
                            errorMsg = parsedObj.msg;
                        }
                    } catch (e) {
                        // Keep the original string if parsing fails
                        console.warn("Failed to parse exchange error:", e);
                    }
                }
                setOrderError(errorMsg);
            }
        } catch (error) {
            console.error(error);
            setOrderError('Failed to place order. Network error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#0A1014] border border-white/10 h-full flex flex-col relative z-20 overflow-y-auto custom-scrollbar font-sans">
            {/* 0. Header */}
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#0A1014] shrink-0">
                <span className="text-white text-sm font-medium">Trade</span>
            </div>

            {/* 0.5 Trading Mode Selector */}
            <div className="flex bg-[#0A1014] border-b border-white/5 shrink-0">
                {['Spot', 'Future'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setTradingMode(mode)}
                        className={`flex-1 py-3 text-xs font-bold transition-colors relative uppercase ${tradingMode === mode ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {mode}
                        {tradingMode === mode && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white mx-auto w-full"></div>}
                    </button>
                ))}
            </div>

            <div className="p-4 flex flex-col gap-4 flex-1">
                {/* 1. Header (Order Type etc) */}
                <div className="flex gap-2">
                    {/* Order Type Dropdown */}
                    <div className="relative flex-1">
                        <button
                            onClick={() => setShowOrderTypeDropdown(!showOrderTypeDropdown)}
                            className="w-full bg-[#131B1F] hover:bg-[#1c262b] text-white text-xs font-bold py-2 px-3 rounded-lg flex justify-between items-center transition-colors border border-white/5"
                        >
                            {orderType} <ChevronDown size={14} className={`text-gray-400 transition-transform ${showOrderTypeDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showOrderTypeDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowOrderTypeDropdown(false)}></div>
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#131B1F] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                                    {['Limit', 'Market'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setOrderType(type);
                                                setShowOrderTypeDropdown(false);
                                            }}
                                            className={`px-3 py-2 text-xs font-bold text-left hover:bg-[#1A1F24] transition-colors ${orderType === type ? 'text-white bg-white/5' : 'text-gray-400'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setShowAccountModeModal(true)}
                        className="flex-1 bg-[#131B1F] hover:bg-[#1c262b] text-white text-xs font-bold py-2 px-2 rounded-lg flex justify-center items-center transition-colors border border-white/5"
                    >
                        {accountMode}
                    </button>

                    {tradingMode === 'Future' && (
                        <button
                            onClick={() => setShowLeverageModal(true)}
                            className="flex-1 bg-[#131B1F] hover:bg-[#1c262b] text-white text-xs font-bold py-2 px-2 rounded-lg flex justify-center items-center transition-colors border border-white/5"
                        >
                            {leverage}x
                        </button>
                    )}
                </div>

                <AccountModeModal
                    isOpen={showAccountModeModal}
                    onClose={() => setShowAccountModeModal(false)}
                    currentMode={accountMode}
                    onConfirm={(mode) => {
                        setAccountMode(mode);
                        setShowAccountModeModal(false);
                    }}
                />

                <LeverageModal
                    isOpen={showLeverageModal}
                    onClose={() => setShowLeverageModal(false)}
                    currentLeverage={leverage}
                    pair={pair}
                    onConfirm={(val) => {
                        setLeverage(val);
                        setShowLeverageModal(false);
                    }}
                />

                {/* Exchange Selector - Moved below limit selection */}
                <div className="relative">
                    <button
                        onClick={() => setShowExchangeDropdown(!showExchangeDropdown)}
                        className="w-full bg-[#131B1F] hover:bg-[#1c262b] text-white text-[10px] font-bold py-2 px-3 rounded-lg flex justify-between items-center transition-colors border border-white/5"
                    >
                        <div className="flex items-center gap-2">
                            {selectedExchange && (
                                <img
                                    src={getExchangeLogo(selectedExchange.name)}
                                    alt={selectedExchange.name}
                                    className="w-3.5 h-3.5 object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            <span className="uppercase tracking-wider">{selectedExchange?.name || 'Select Exchange'}</span>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${showExchangeDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showExchangeDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowExchangeDropdown(false)}></div>
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#131B1F] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                                {connectedExchanges.map((ex) => {
                                    const name = ex.exchange_name.toUpperCase().replace('_PAPER', '');
                                    const isSelected = exchangeFilter === name || (exchangeFilter === 'ALL' && connectedExchanges[0].exchange_name === ex.exchange_name);
                                    return (
                                        <button
                                            key={ex.exchange_name}
                                            onClick={() => {
                                                setExchangeFilter(name);
                                                setShowExchangeDropdown(false);
                                            }}
                                            className={`px-3 py-2 text-[10px] font-bold text-left hover:bg-[#1A1F24] transition-colors flex items-center gap-2 ${isSelected ? 'text-[#00FF9D] bg-[#00FF9D]/5' : 'text-gray-400'}`}
                                        >
                                            <img
                                                src={getExchangeLogo(name)}
                                                alt={name}
                                                className="w-4 h-4 object-contain"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Available Balance */}
                <div className="flex justify-between items-center mb-4 text-[11px]">
                    <span className="text-gray-500 font-medium">Available:</span>
                    <div className="flex items-center gap-2">
                        <div
                            className="bg-[#131B1F] border border-white/5 rounded px-2 py-1 flex items-center gap-2 cursor-pointer hover:border-white/20 transition-colors"
                            onClick={() => {
                                setSliderValue(100);
                                handleSliderChange({ target: { value: 100 } });
                            }}
                            title="Click to use 100%"
                        >
                            <span className="text-white font-bold text-[12px]">
                                {activeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </span>
                            <span className={`text-[10px] font-bold ${activeBalanceAsset === 'base' ? 'text-[#00FF9D]' : 'text-gray-400'}`}>{activeCurrency}</span>
                        </div>
                        <button
                            onClick={() => setActiveBalanceAsset(prev => prev === 'quote' ? 'base' : 'quote')}
                            className="p-1.5 bg-[#131B1F] border border-white/5 hover:border-white/20 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            title="Swap active balance asset"
                        >
                            <ArrowLeftRight size={12} />
                        </button>
                    </div>
                </div>

                {/* 3. Inputs */}
                <div className="space-y-3 mb-4">
                    {/* Price Input */}
                    {/* Price Input - Hidden for Market Order */}
                    {orderType !== 'Market' && (
                        <div className="relative group bg-[#0A1014] border border-white/10 rounded-lg">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none">Price</div>
                            <input
                                type="text"
                                value={price}
                                onChange={handlePriceChange}
                                className={`w-full bg-transparent py-3 pl-16 pr-28 text-left font-bold text-sm outline-none transition-all placeholder-gray-600 ${isAutoPrice ? 'text-[#00FF9D]' : 'text-white'}`}
                                placeholder="0.00"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <span className="text-gray-500 text-xs font-bold uppercase">USD</span>
                                <span className="text-gray-700 text-xs">|</span>
                                <button
                                    onClick={() => setIsAutoPrice(!isAutoPrice)}
                                    className={`text-xs font-bold transition-colors ${isAutoPrice ? 'text-[#00FF9D]' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Mid
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Value Input */}
                    <div className="relative group bg-[#0A1014] border border-white/10 rounded-lg">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none">Value</div>
                        <input
                            type="text"
                            value={isValueInBase ? amount : value}
                            onChange={isValueInBase ? handleAmountChange : handleValueChange}
                            className="w-full bg-transparent py-3 pl-16 pr-32 text-left text-white font-bold text-sm outline-none transition-all placeholder-gray-500"
                            placeholder="0.00"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <button
                                onClick={() => setIsValueInBase(!isValueInBase)}
                                className="p-1 hover:bg-white/5 rounded transition-colors group/swap"
                            >
                                <ArrowLeftRight size={14} className={`transition-colors ${isValueInBase ? 'text-[#00FF9D]' : 'text-gray-500 group-hover/swap:text-white'}`} />
                            </button>
                            <span className={`text-xs font-bold uppercase transition-colors ${isValueInBase ? 'text-[#00FF9D]' : 'text-gray-500'}`}>
                                {isValueInBase ? baseAsset : quoteAsset}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Slider */}
                <div className="flex items-center gap-3 mb-4">
                    {/* Slider Track */}
                    <div className="flex-1 relative h-6 flex items-center">
                        <div className="absolute left-0 right-0 h-1 bg-[#1F2937] rounded-full"></div>
                        <div className="absolute left-0 h-1 bg-[#374151] rounded-full" style={{ width: `${sliderValue}%` }}></div>
                        {/* Thumb */}
                        <div
                            className="absolute w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform border border-[#0A1014] z-20"
                            style={{ left: `calc(${sliderValue}% - 8px)` }}
                        ></div>
                        {/* Ticks */}
                        {[0, 25, 50, 75, 100].map(tick => (
                            <div
                                key={tick}
                                className={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 ${sliderValue >= tick ? 'bg-[#374151]' : 'bg-[#1F2937]'}`}
                                style={{ left: `${tick}%` }}
                            ></div>
                        ))}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderValue}
                            onChange={handleSliderChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                    </div>
                    <div className="bg-[#1F2937] px-2 py-0.5 rounded text-xs text-white font-bold min-w-[40px] text-center border border-white/5">
                        {sliderValue}%
                    </div>
                </div>

                {/* 5. Checkboxes & TIF */}
                <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center justify-between relative" ref={tifRef}>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded border border-gray-600 bg-transparent checked:bg-[#3B82F6] transition-colors" />
                            <span className="text-gray-500 text-xs font-medium group-hover:text-gray-300 transition-colors">Reduce-Only</span>
                        </label>

                        {orderType === 'Limit' && (
                            <>
                                <button
                                    onClick={() => setShowTIFDropdown(!showTIFDropdown)}
                                    className="bg-[#1F2937] text-[10px] text-white font-bold px-2 py-0.5 rounded border border-white/10 hover:border-white/20 transition-all active:scale-95"
                                >
                                    {timeInForce}
                                </button>

                                {showTIFDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#111418] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-1">
                                            {[
                                                { id: 'GTC', label: 'GTC', desc: 'Good Till Canceled: Your order stays active until it\'s filled or you cancel it.' },
                                                { id: 'IOC', label: 'IOC', desc: 'Immediate Or Cancel: Fills what it can right away, cancels the rest.', comingSoon: true },
                                                { id: 'ALO', label: 'ALO', desc: 'Add Liquidity Only (Post-Only): Places your order on the book. Won\'t execute immediately, only when price is hit.' }
                                            ].map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => {
                                                        if (!option.comingSoon) {
                                                            setTimeInForce(option.id);
                                                            setShowTIFDropdown(false);
                                                        }
                                                    }}
                                                    className={`w-full text-left p-3 rounded-md transition-colors group ${option.id === timeInForce ? 'bg-white/5' : 'hover:bg-white/5'} ${option.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-bold ${option.id === timeInForce ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                                            {option.label}
                                                        </span>
                                                        {option.comingSoon && (
                                                            <span className="text-[8px] text-gray-600 font-bold uppercase">(Coming Soon)</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                                        {option.desc}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={showTPSL}
                                onChange={(e) => setShowTPSL(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border border-gray-600 bg-transparent checked:bg-[#3B82F6] transition-colors"
                            />
                            <span className="text-gray-400 text-xs group-hover:text-gray-300">Take Profit / Stop Loss</span>
                        </label>

                        {showTPSL && (
                            <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="relative group bg-[#0A1014] border border-white/5 rounded p-2">
                                    <div className="text-[9px] text-gray-500 font-bold mb-1 uppercase">Take Profit</div>
                                    <input
                                        type="text"
                                        placeholder="Price"
                                        value={takeProfit}
                                        onChange={(e) => handleTPSLChange('TP', e.target.value)}
                                        className="w-full bg-transparent text-white text-xs font-bold outline-none"
                                    />
                                    <div className="absolute right-2 bottom-2 text-[9px] text-gray-600 font-bold">USD</div>
                                </div>
                                <div className="relative group bg-[#0A1014] border border-white/5 rounded p-2">
                                    <div className="text-[9px] text-gray-500 font-bold mb-1 uppercase">Stop Loss</div>
                                    <input
                                        type="text"
                                        placeholder="Price"
                                        value={stopLoss}
                                        onChange={(e) => handleTPSLChange('SL', e.target.value)}
                                        className="w-full bg-transparent text-white text-xs font-bold outline-none"
                                    />
                                    <div className="absolute right-2 bottom-2 text-[9px] text-gray-600 font-bold">USD</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. Est. Liquidation Price Boxes - Hidden in Spot */}
                {tradingMode === 'Future' && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-[#0ECB81]/5 border border-[#0ECB81]/10 rounded-lg p-2">
                            <div className="text-[10px] text-gray-400 font-medium mb-1">Est. Liq. Price</div>
                            <div className="text-[#0ECB81] text-xs font-bold text-center">—</div>
                        </div>
                        <div className="bg-[#F6465D]/5 border border-[#F6465D]/10 rounded-lg p-2">
                            <div className="text-[10px] text-gray-400 font-medium mb-1">Est. Liq. Price</div>
                            <div className="text-[#F6465D] text-xs font-bold text-center">—</div>
                        </div>
                    </div>
                )}

                {/* 7. Error & Success Messages */}
                {orderError && (
                    <div className="bg-[#F6465D]/10 border border-[#F6465D]/20 text-[#F6465D] text-xs p-2.5 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="leading-relaxed">{orderError}</span>
                    </div>
                )}

                {orderSuccess && (
                    <div className="bg-[#0ECB81]/10 border border-[#0ECB81]/20 text-[#0ECB81] text-xs p-2.5 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="leading-relaxed">{orderSuccess}</span>
                    </div>
                )}

                {/* 8. Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        onClick={() => handleOrder('buy')}
                        disabled={isSubmitting}
                        className="bg-[#2EBD85] hover:bg-[#25A674] text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-[#00FF9D]/10 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Processing...' : (tradingMode === 'Spot' ? 'Buy' : 'Long')}
                    </button>
                    <button
                        onClick={() => handleOrder('sell')}
                        disabled={isSubmitting}
                        className="bg-[#F6465D] hover:bg-[#D9304E] text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-[#F6465D]/10 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Processing...' : (tradingMode === 'Spot' ? 'Sell' : 'Short')}
                    </button>
                </div>

                {/* 8. Footer Info */}
                <div className="space-y-1 mt-4">
                    <div className="flex justify-between text-[11px] font-medium py-0.5 border-b border-white/5">
                        <span className="text-gray-500">Margin:</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold">
                                {price && amount ? ((parseFloat(price) * parseFloat(amount)) / leverage).toFixed(2) : '0.00'}
                            </span>
                            <span className="text-gray-500 text-[9px] font-bold">USD</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] font-medium py-0.5 border-b border-white/5">
                        <span className="text-gray-500">Max Position:</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold">
                                {(activeBalance * leverage).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 4 })}
                            </span>
                            <span className="text-gray-500 text-[9px] font-bold">{activeCurrency}</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] font-medium py-0.5">
                        <span className="text-gray-500">Fee Rate:</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold">Taker</span>
                            <span className="text-[#00FF9D] font-bold">{selectedExchange?.takerFee || 0.1}%</span>
                            <span className="text-white/50">/</span>
                            <span className="text-white font-bold">Maker</span>
                            <span className="text-[#00FF9D] font-bold">{selectedExchange?.makerFee || 0.05}%</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

// ExchangeBar removed


// --- MAIN PAGE ---

const BottomTable = ({ pair, selectedExchange, connectedExchanges, exchangeFilter, tradingMode }) => {
    const [activeTab, setActiveTab] = useState('Positions');

    const [openOrders, setOpenOrders] = useState([]);
    const [tradeHistory, setTradeHistory] = useState([]);
    const [positions, setPositions] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const fetchTableData = async () => {
        if (!selectedExchange?.name) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            let exName = (exchangeFilter === 'ALL' && connectedExchanges.length > 0) ? connectedExchanges[0].exchange_name : exchangeFilter;
            if (exchangeFilter !== 'ALL') {
                const matchedConnected = connectedExchanges.find(e => e.exchange_name.toUpperCase().replace('_PAPER', '') === exchangeFilter.toUpperCase().replace('_PAPER', ''));
                if (matchedConnected) {
                    exName = matchedConnected.exchange_name;
                }
            }

            let symbol = pair;
            if (!symbol.includes('/')) {
                // Formatting helper just in case
                symbol = pair.substring(0, pair.length - 4) + '/' + pair.substring(pair.length - 4);
                if (symbol.endsWith('/USDT') === false) symbol = pair.substring(0, pair.length - 4) + '/' + pair.substring(pair.length - 4);
            }
            if (tradingMode === 'Future') {
                const quoteAsset = symbol.split('/')[1] || 'USDT';
                symbol = `${symbol}:${quoteAsset}`;
            }

            setIsLoadingData(true);

            if (activeTab === 'Open Orders') {
                const res = await fetch(`${API_BASE_URL}/trade/orders/open?exchange=${exName}&symbol=${symbol}&marketType=${tradingMode}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setOpenOrders(await res.json());
            }

            if (activeTab === 'Trade History') {
                const res = await fetch(`${API_BASE_URL}/trade/history?exchange=${exName}&symbol=${symbol}&marketType=${tradingMode}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setTradeHistory(await res.json());
            }

            if (activeTab === 'Positions') {
                const res = await fetch(`${API_BASE_URL}/trade/positions?exchange=${exName}&symbol=${symbol}&marketType=${tradingMode}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setPositions(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        fetchTableData();
        const interval = setInterval(fetchTableData, 10000);
        return () => clearInterval(interval);
    }, [activeTab, pair, selectedExchange, exchangeFilter, connectedExchanges]);

    const handleCancelOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            let exName = (exchangeFilter === 'ALL' && connectedExchanges.length > 0) ? connectedExchanges[0].exchange_name : exchangeFilter;
            if (exchangeFilter !== 'ALL') {
                const matchedConnected = connectedExchanges.find(e => e.exchange_name.toUpperCase().replace('_PAPER', '') === exchangeFilter.toUpperCase().replace('_PAPER', ''));
                if (matchedConnected) {
                    exName = matchedConnected.exchange_name;
                }
            }

            let symbol = pair;
            if (!symbol.includes('/')) {
                symbol = pair.substring(0, pair.length - 4) + '/' + pair.substring(pair.length - 4);
            }
            if (tradingMode === 'Future') {
                const quoteAsset = symbol.split('/')[1] || 'USDT';
                symbol = `${symbol}:${quoteAsset}`;
            }

            const res = await fetch(`${API_BASE_URL}/trade/order/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ exchange: exName, symbol, marketType: tradingMode })
            });
            if (res.ok) {
                fetchTableData();
            } else {
                const data = await res.json();
                alert(`Error cancelling order: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to cancel order');
        }
    };

    return (
        <div className="h-[300px] bg-[#0A1014] border border-white/10 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center px-4 border-b border-white/5 bg-[#0A1014]">
                {['Positions', 'Open Orders', 'Trade History', 'Funding History'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-xs font-medium transition-colors relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00FF9D] shadow-[0_0_10px_#00FF9D]"></div>}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 bg-[#0A1014] overflow-auto custom-scrollbar relative">
                {activeTab === 'Positions' && (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] text-gray-500 font-medium border-b border-white/5 sticky top-0 bg-[#0A1014] z-10">
                                <th className="py-2 pl-4">Symbol</th>
                                <th className="py-2">Size</th>
                                <th className="py-2">Entry Price</th>
                                <th className="py-2">Mark Price</th>
                                <th className="py-2">Liq. Price</th>
                                <th className="py-2">Margin</th>
                                <th className="py-2 pr-4 text-right">PNL (ROE%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positions.length > 0 ? positions.map((pos, i) => {
                                const rawSize = parseFloat(pos.contracts || pos.info?.size || pos.info?.pos || 0);
                                const size = Math.abs(rawSize);
                                const entryPrice = parseFloat(pos.entryPrice || 0);
                                const markPrice = parseFloat(pos.markPrice || entryPrice);
                                const liqPrice = parseFloat(pos.liquidationPrice || 0);
                                const margin = parseFloat(pos.initialMargin || pos.info?.margin || 0);
                                const pnl = parseFloat(pos.unrealizedPnl || 0);
                                const roe = parseFloat(pos.percentage || 0);

                                // CCXT typically provides 'side' (long/short), but if size is negative it's a short
                                const isLong = pos.side === 'long' || (pos.side === undefined && rawSize > 0);

                                return (
                                    <tr key={i} className="text-xs font-medium border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="py-3 pl-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1 h-4 rounded-full ${isLong ? 'bg-[#00FF9D]' : 'bg-[#FF3B30]'}`}></div>
                                                <span className="text-white font-bold">{pos.symbol}</span>
                                                {pos.leverage && <span className="text-[10px] text-[#00FF9D] bg-[#00FF9D]/10 px-1.5 rounded">{pos.leverage}x</span>}
                                            </div>
                                        </td>
                                        <td className={isLong ? "text-[#00FF9D]" : "text-red-500"}>
                                            {isLong ? '' : '-'}{size} {pos.symbol.split('/')[0]}
                                        </td>
                                        <td className="text-gray-300">{entryPrice.toLocaleString()}</td>
                                        <td className="text-white">{markPrice.toLocaleString()}</td>
                                        <td className="text-orange-400">{liqPrice > 0 ? liqPrice.toLocaleString() : '-'}</td>
                                        <td className="text-gray-300">{margin > 0 ? margin.toFixed(2) + ' USD' : '-'}</td>
                                        <td className="pr-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={pnl >= 0 ? "text-[#00FF9D]" : "text-[#FF3B30]"}>
                                                    {pnl > 0 ? '+' : ''}{pnl.toFixed(2)} USD
                                                </span>
                                                <span className={`text-[10px] ${pnl >= 0 ? "text-[#00FF9D]" : "text-[#FF3B30]"}`}>
                                                    ({pnl > 0 ? '+' : ''}{roe.toFixed(2)}%)
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500 text-xs">{isLoadingData ? 'Loading...' : 'No open positions'}</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === 'Open Orders' && (
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] text-gray-500 font-medium border-b border-white/5 sticky top-0 bg-[#0A1014] z-10">
                                <th className="py-2 pl-4">Date</th>
                                <th className="py-2">Pair</th>
                                <th className="py-2">Type</th>
                                <th className="py-2">Side</th>
                                <th className="py-2">Price</th>
                                <th className="py-2">Amount</th>
                                <th className="py-2">Filled</th>
                                <th className="py-2">Total</th>
                                <th className="py-2">Trigger Conditions</th>
                                <th className="py-2 pr-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {openOrders.length > 0 ? openOrders.map((order, i) => (
                                <tr key={order.id || i} className="text-xs font-medium border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 pl-4 text-gray-400">{new Date(order.timestamp).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</td>
                                    <td className="text-white font-bold">{order.symbol}</td>
                                    <td className="text-gray-300 capitalize">{order.type}</td>
                                    <td className={order.side?.toLowerCase() === 'buy' ? 'text-[#00FF9D] uppercase' : 'text-[#F6465D] uppercase'}>{order.side}</td>
                                    <td className="text-white">{order.price || 'Market'}</td>
                                    <td className="text-white">{order.amount}</td>
                                    <td className="text-gray-400">{order.filled || 0}</td>
                                    <td className="text-gray-400">{((order.price || 0) * (order.amount || 0)).toFixed(2)}</td>
                                    <td className="text-gray-400">-</td>
                                    <td className="pr-4 text-right">
                                        <button onClick={() => handleCancelOrder(order.id)} className="text-gray-500 hover:text-white transition-colors text-[10px] border border-white/10 px-2 py-0.5 rounded transition-transform active:scale-95">Cancel</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="10" className="text-center py-8 text-gray-500 text-xs">{isLoadingData ? 'Loading...' : 'No open orders'}</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === 'Trade History' && (
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] text-gray-500 font-medium border-b border-white/5 sticky top-0 bg-[#0A1014] z-10">
                                <th className="py-2 pl-4">Date</th>
                                <th className="py-2">Pair</th>
                                <th className="py-2">Side</th>
                                <th className="py-2">Price</th>
                                <th className="py-2">Filled</th>
                                <th className="py-2">Fee</th>
                                <th className="py-2">Role</th>
                                <th className="py-2 pr-4 text-right">Realized PNL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tradeHistory.length > 0 ? tradeHistory.map((trade, i) => (
                                <tr key={trade.id || i} className="text-xs font-medium border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 pl-4 text-gray-400">{new Date(trade.timestamp).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</td>
                                    <td className="text-white font-bold">{trade.symbol}</td>
                                    <td className={trade.side?.toLowerCase() === 'buy' ? 'text-[#00FF9D] uppercase' : 'text-[#F6465D] uppercase'}>{trade.side}</td>
                                    <td className="text-white">{trade.price?.toLocaleString()}</td>
                                    <td className="text-white">{trade.amount}</td>
                                    <td className="text-gray-400">{trade.fee?.cost ? trade.fee.cost.toFixed(4) : (trade.fee || 0)}</td>
                                    <td className="text-gray-400 capitalize">{trade.takerOrMaker || trade.role || '-'}</td>
                                    <td className={`pr-4 text-right ${(trade.info?.realizedPnl || 0) >= 0 ? 'text-[#00FF9D]' : 'text-[#F6465D]'}`}>
                                        {(trade.info?.realizedPnl || 0) > 0 ? '+' : ''}{parseFloat(trade.info?.realizedPnl || 0).toFixed(2)} USDT
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="text-center py-8 text-gray-500 text-xs">{isLoadingData ? 'Loading...' : 'No trade history'}</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

                {['Funding History'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3 opacity-50 min-h-[150px]">
                        <div className="p-4 rounded-full bg-white/5">
                            <History size={24} />
                        </div>
                        <span className="text-xs font-medium">No {activeTab} found</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SKELETON LOADER ---
const LiveMarketSkeleton = () => (
    <div className="flex-1 p-4 md:p-6 flex flex-col h-full overflow-hidden animate-pulse bg-black w-full pb-24 md:pb-6">
        {/* Top Bar Skeleton */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="h-6 w-32 bg-white/5 rounded-lg"></div>
            <div className="flex gap-3">
                <div className="h-8 w-40 bg-white/5 rounded-lg"></div>
                <div className="h-8 w-48 bg-white/5 rounded-lg"></div>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
            {/* Left Col */}
            <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
                {/* Chart Skeleton */}
                <div className="h-[420px] bg-[#0A1014] border border-white/5 rounded-xl relative">
                    <div className="absolute inset-x-0 top-0 h-10 border-b border-white/5 bg-white/5"></div>
                </div>

                {/* Table Skeleton */}
                <div className="h-[500px] bg-[#0A1014] border border-white/5 rounded-xl flex flex-col">
                    <div className="h-[60px] border-b border-white/5 bg-white/5"></div>
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="h-8 w-8 rounded-full bg-white/5"></div>
                                <div className="h-4 w-24 bg-white/5 rounded"></div>
                                <div className="h-4 w-full bg-white/5 rounded ml-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Col */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                {/* Trade Panel Skeleton */}
                <div className="h-[400px] bg-[#0A1014] border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                    <div className="h-6 w-1/2 bg-white/5 rounded"></div>
                    <div className="h-10 w-full bg-white/5 rounded"></div>
                    <div className="h-10 w-full bg-white/5 rounded"></div>
                    <div className="flex-1"></div>
                    <div className="h-12 w-full bg-white/5 rounded"></div>
                </div>

                {/* Order Book Skeleton */}
                <div className="h-[500px] bg-[#0A1014] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                    <div className="h-6 w-1/3 bg-white/5 rounded mb-2"></div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="h-3 bg-white/5 rounded"></div>
                        <div className="h-3 bg-white/5 rounded"></div>
                        <div className="h-3 bg-white/5 rounded"></div>
                    </div>
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="grid grid-cols-3 gap-2">
                            <div className="h-3 bg-white/5 rounded w-3/4"></div>
                            <div className="h-3 bg-white/5 rounded w-full"></div>
                            <div className="h-3 bg-white/5 rounded w-1/2 ml-auto"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// --- MAIN PAGE ---

const LiveMarket = () => {
    const [user] = useState({ name: "Trader", plan: "Pro Plan Active" });
    const [tradingMode, setTradingMode] = useState('Spot'); // 'Spot' | 'Future'

    // --- GLOBAL STATE ---
    const { exchangeFilter, setExchangeFilter, connectedExchanges, isPaperTrading } = useTrading();

    // Filter and format connected exchanges
    const filterOptions = connectedExchanges.length > 0
        ? ['ALL', ...connectedExchanges.map(e => e.exchange_name.toUpperCase().replace('_PAPER', ''))]
        : ['ALL', 'BINANCE']; // Fallback if nothing connected, or maybe specific default

    // Normalize selected exchange

    // Sync local object with global string filter
    // If 'ALL', prioritize the first connected exchange.
    const activeName = (exchangeFilter === 'ALL' && connectedExchanges.length > 0)
        ? connectedExchanges[0].exchange_name
        : exchangeFilter;

    // Normalize for matching against EXCHANGES constant
    const cleanName = activeName.replace(/_paper/i, '').toUpperCase();
    const selectedExchange = EXCHANGES.find(e => e.name.toUpperCase() === cleanName) || EXCHANGES[0];

    const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
    const [selectedPair, setSelectedPair] = useState(PAIRS_DATA[0]);
    const [showPairDropdown, setShowPairDropdown] = useState(false);
    const [searchPairQuery, setSearchPairQuery] = useState('');
    const pairDropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pairDropdownRef.current && !pairDropdownRef.current.contains(event.target)) {
                setShowPairDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Loading State
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial data loading
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <DashboardLayout
            isLoading={isLoading}
            fullWidth={true}
            headerSlot={
                <ExchangeFilter
                    isLoading={isLoading}
                    options={filterOptions}
                    selected={exchangeFilter === 'ALL' ? selectedExchange.name : exchangeFilter}
                    onSelect={setExchangeFilter}
                />
            }
        >


            {isLoading ? (
                <LiveMarketSkeleton />
            ) : (
                <main className="flex-1 p-2 relative z-10 flex flex-col h-full overflow-y-auto lg:overflow-hidden w-full bg-black custom-scrollbar">


                    {/* Top Bar: Breadcrumb + Coin Selector */}
                    <div className="flex items-center gap-4 text-sm mb-2 px-2">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Trading</span>
                            <ChevronDown size={12} className="text-gray-600 -rotate-90" />
                            <span className="text-gray-500 font-bold tracking-wide">Terminal</span>
                            <ChevronDown size={12} className="text-gray-600 -rotate-90" />
                        </div>

                        {/* Coin Selector Dropdown */}
                        <div className="relative z-50" ref={pairDropdownRef}>
                            <button
                                onClick={() => setShowPairDropdown(!showPairDropdown)}
                                className="flex items-center gap-2 text-white font-bold text-lg hover:text-gray-200 transition-colors bg-[#131B1F] border border-white/5 py-1 px-3 rounded-lg"
                            >
                                <span className="flex items-center gap-2">
                                    <CoinLogo symbol={selectedPair.base} />
                                    {selectedPair.label}
                                </span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showPairDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showPairDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-[#131B1F] border border-white/10 rounded-xl shadow-2xl overflow-hidden shadow-black/80">
                                    <div className="p-2 border-b border-white/5 bg-[#0A1014]">
                                        <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg px-3 py-2">
                                            <Search size={14} className="text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Search coin..."
                                                value={searchPairQuery}
                                                onChange={(e) => setSearchPairQuery(e.target.value)}
                                                className="bg-transparent text-white text-xs w-full outline-none placeholder-gray-600"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {PAIRS_DATA.filter(p => p.label.toLowerCase().includes(searchPairQuery.toLowerCase())).map((pairItem) => (
                                            <button
                                                key={pairItem.value}
                                                onClick={() => {
                                                    setSelectedPair(pairItem);
                                                    setShowPairDropdown(false);
                                                    setSearchPairQuery('');
                                                }}
                                                className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-3 hover:bg-white/5 ${selectedPair.value === pairItem.value ? 'bg-white/5 text-[#00FF9D]' : 'text-gray-400'}`}
                                            >
                                                <CoinLogo symbol={pairItem.base} />
                                                {pairItem.label}
                                                {selectedPair.value === pairItem.value && <Check size={14} className="ml-auto text-[#00FF9D]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. MAIN FLEX LAYOUT */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-2 min-h-0">

                        {/* --- LEFT CONTENT AREA (Chart + Order Book + Bottom Table) --- */}
                        <div className="flex-1 flex flex-col gap-2 min-w-0">

                            {/* TOP ROW: Chart & Order Book */}
                            <div className="flex-1 flex flex-col lg:flex-row gap-2 min-h-[800px] lg:min-h-0">
                                {/* CHART SECTION (Flex-1) */}
                                <div className="flex-1 bg-[#0A1014] border border-white/10 relative overflow-hidden flex flex-col shadow-lg min-h-[400px] lg:min-h-0 shrink-0 lg:shrink">
                                    <div className="flex-1 relative">
                                        <TradingViewWidget
                                            exchange={selectedExchange.id}
                                            pair={selectedPair.value}
                                        />
                                        {/* Overlay gradient for premium feel */}
                                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A1014] via-transparent to-transparent opacity-20"></div>
                                    </div>
                                </div>

                                {/* ORDER BOOK SECTION */}
                                <div className="w-full lg:w-[280px] xl:w-[320px] flex flex-col gap-2 h-[500px] lg:h-full flex-shrink-0">
                                    <div className="flex-1 min-h-0 h-full">
                                        <OrderBook
                                            exchange={selectedExchange.id}
                                            pair={selectedPair.value}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM ROW: Bottom Table */}
                            <div className="shrink-0 w-full min-h-0">
                                <BottomTable
                                    pair={selectedPair.label || selectedPair.value} // .label has the /
                                    selectedExchange={selectedExchange}
                                    connectedExchanges={connectedExchanges}
                                    exchangeFilter={exchangeFilter}
                                    tradingMode={tradingMode}
                                />
                            </div>

                        </div>

                        {/* --- RIGHT SIDEBAR: Trade Panel + Account Info --- */}
                        <div className="w-full lg:w-[320px] xl:w-[360px] flex flex-col gap-2 h-[600px] lg:h-full flex-shrink-0">
                            <div className="flex-1 min-h-0 relative">
                                <TradePanel
                                    pair={selectedPair.value}
                                    market={selectedMarket}
                                    selectedExchange={selectedExchange}
                                    connectedExchanges={connectedExchanges}
                                    exchangeFilter={exchangeFilter}
                                    setExchangeFilter={setExchangeFilter}
                                    tradingMode={tradingMode}
                                    setTradingMode={setTradingMode}
                                />
                            </div>
                            <div className="shrink-0">
                                <AccountInfo />
                            </div>
                        </div>

                    </div>


                </main>
            )}
        </DashboardLayout>
    );
};

export default LiveMarket;