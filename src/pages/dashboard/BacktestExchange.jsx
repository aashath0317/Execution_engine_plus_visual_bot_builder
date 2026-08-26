
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { ArrowUp, ArrowDown, Activity, Settings, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import API_BASE_URL from '../../config'; // [NEW]
import { useToast } from '../../context/ToastContext';
import { useTrading } from '../../context/TradingContext';
import DashboardLayout from '../../components/DashboardLayout';
import ExchangeFilter from '../../components/ExchangeFilter';

const EXCHANGES = ['Binance', 'OKX', 'Bybit', 'KuCoin', 'Bitget', 'Gate.io'];

import { BacktestSkeleton } from './BacktestSkeleton';

const BacktestExchange = () => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const { addToast } = useToast();

    // State
    const [price, setPrice] = useState(100.00); // [FIX] Default to 100
    const [previousPrice, setPreviousPrice] = useState(100.00);
    const [inputPrice, setInputPrice] = useState("100");
    const [isConnected, setIsConnected] = useState(false);
    const [orders, setOrders] = useState([]);
    const [trades, setTrades] = useState([]); // [NEW] Trades/Fills State
    const [balances, setBalances] = useState({});
    const [logs, setLogs] = useState([]);
    const [isAutoMoving, setIsAutoMoving] = useState(false);
    const [isPaused, setIsPaused] = useState(false); // [NEW] pause state
    const [loading, setLoading] = useState(true);

    // [NEW] Adjustment States
    const [adjustAmount, setAdjustAmount] = useState("100");
    const [adjustPercent, setAdjustPercent] = useState("1");

    // Backtest Config States
    const [btSymbol, setBtSymbol] = useState('BTCUSDT');
    const [btInterval, setBtInterval] = useState('1h');
    const [btStartTime, setBtStartTime] = useState(null);
    const [btEndTime, setBtEndTime] = useState(null);
    const [btPlaySpeed, setBtPlaySpeed] = useState(1000);

    // [NEW] Bot Selection State
    const [selectedBot, setSelectedBot] = useState('grid'); // 'grid' | 'dca'
    const [botSetupMode, setBotSetupMode] = useState('default'); // 'default' | 'manual'
    const [gridConfig, setGridConfig] = useState({
        upperPrice: '',
        lowerPrice: '',
        grids: 30,
        investment: 1000,
        gridType: 'Arithmetic',
        orderSizeType: 'quote',
        profitMode: 'USDT_ONLY',
        fiatProfitStyle: 'SPLIT',
        profitSplitRatio: 0.5,
        trailingUp: true,
        trailingDown: true
    });

    const wsRef = useRef(null);
    const { showToast } = useToast();

    // Initial Data Generation (Mock History)
    // We generate 100 candles ending at "now" with price ~100
    const initialData = React.useMemo(() => {
        return [];
    }, []);

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        chartRef.current = createChart(chartContainerRef.current, {
            layout: {
                background: { color: '#0B1215' },
                textColor: '#9CA3AF',
            },
            grid: {
                vertLines: { color: '#1F2937' },
                horzLines: { color: '#1F2937' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            crosshair: {
                mode: 1, // CrosshairMode.Normal is 1
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
            },
        });

        const chart = chartRef.current; // access ref value

        // v5 Syntax: addSeries(SeriesType, Options)
        const newSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        seriesRef.current = newSeries;

        // Add Data
        newSeries.setData(initialData);

        // [FIX] Auto-center/fit content on load
        chart.timeScale().fitContent();

        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [loading]); // Re-run when loading state changes

    // ------------------------------------------
    // [NEW] Render Orders on Chart (Real-time)
    // ------------------------------------------
    const priceLinesRef = useRef([]);

    useEffect(() => {
        const series = seriesRef.current;
        if (!series || !orders) return;

        // 1. Clear existing lines
        priceLinesRef.current.forEach(line => {
            series.removePriceLine(line);
        });
        priceLinesRef.current = [];

        // 2. Draw new lines
        orders.forEach(order => {
            if (Number.isNaN(parseFloat(order.price))) return;

            const isBuy = order.side === 'BUY';
            const color = isBuy ? '#00FF9D' : '#ef5350'; // Green / Red

            const priceLine = series.createPriceLine({
                price: parseFloat(order.price),
                color: color,
                lineWidth: 1,
                lineStyle: 1, // Dotted
                axisLabelVisible: true,
                title: `${order.side} ${parseFloat(order.origQty).toFixed(3)}`,
            });

            priceLinesRef.current.push(priceLine);
        });

    }, [orders]); // Re-run when orders list changes (via WS)


    // Helper to derive URLs
    const getUrls = () => {
        // Remove trailing slash if present
        const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        // Assume API_BASE_URL ends with /api (e.g. https://api.fydblock.com/api)
        const rootUrl = base.replace(/\/api$/, '');
        const wsProtocol = rootUrl.startsWith('https') ? 'wss:' : 'ws:';
        const httpHost = rootUrl.replace(/^https?:\/\//, '');

        return {
            ws: `${wsProtocol}//${httpHost}/ws/backtest`,
            control: `${rootUrl}/backtest/control/price`
        };
    };

    // [NEW] Connected Bot Info
    const [connectedBot, setConnectedBot] = useState(null);
    const [selectedPair, setSelectedPair] = useState('BTCUSDT'); // Default
    const { exchangeFilter, setExchangeFilter, connectedExchanges } = useTrading();
    const activeExchange = exchangeFilter === 'ALL' ? (connectedExchanges[0]?.exchange_name || 'binance').toLowerCase().replace('_paper', '') : exchangeFilter.toLowerCase();


    // Websocket Connection
    useEffect(() => {
        const connect = () => {
            const { ws: wsUrl } = getUrls();
            // console.log("Connecting to Mock WS:", wsUrl);

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                setLogs(prev => [`[${new Date().toLocaleTimeString()}] Connected to Mock Exchange`, ...prev]);
                addToast("Connected to Mock Exchange", "success");
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'price') {
                        const newPrice = parseFloat(data.price);
                        setPrice(newPrice);
                        if (seriesRef.current) {
                            const newPrice = parseFloat(data.price);
                            setPrice(newPrice);
                        }

                    } else if (data.type === 'clear_chart') {
                        if (seriesRef.current) {
                            seriesRef.current.setData([]);
                        }
                    } else if (data.type === 'candle') {
                        if (seriesRef.current) {
                            seriesRef.current.update(data.candle);
                        }
                    } else if (data.type === 'orders') {
                        setOrders(data.orders);
                    } else if (data.type === 'trades') {
                        // [NEW] Handle Trades Update
                        setTrades(data.trades);
                    } else if (data.type === 'balance') {
                        // [NEW] Handle Balance Update
                        setBalances(data.balance);
                    } else if (data.type === 'status') {
                        if (data.status.isAutoMoving !== undefined) {
                            setIsAutoMoving(data.status.isAutoMoving);
                            if (!data.status.isAutoMoving) {
                                addToast("Backtest completed or stopped.", "info");
                            }
                        }
                        if (data.status.isPaused !== undefined) {
                            setIsPaused(data.status.isPaused);
                        }
                    }
                } catch (e) {
                    console.error("WS Parse Error", e);
                }
            };
        };

        connect();

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    // Fetch Initial Price & Balances & Connected Bot
    useEffect(() => {
        const initData = async () => {
            const minDelay = new Promise(resolve => setTimeout(resolve, 2500));
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { control } = getUrls();

                // 1. Fetch Price
                const priceUrl = control.replace('/control/price', '/price');
                const pRes = await fetch(priceUrl);
                if (pRes.ok) {
                    const data = await pRes.json();
                    if (data.price) {
                        setPrice(parseFloat(data.price));
                        setInputPrice(data.price.toString());
                    }
                }

                // 2. Fetch Balances
                const balUrl = control.replace('/control/price', '/balance');
                const bRes = await fetch(balUrl);
                if (bRes.ok) {
                    const balData = await bRes.json();
                    setBalances(balData);
                }

                // 3. Fetch Connected Bot (Find bot using Mock Exchange)
                const botsRes = await fetch(`${API_BASE_URL}/user/bots`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (botsRes.ok) {
                    const bots = await botsRes.json();

                    // Priority 1: Active Bot on MOCK pair
                    let mockBot = bots.find(b =>
                        (b.config?.pair?.includes('MOCK') || b.pair?.includes('MOCK')) &&
                        ['active', 'running', 'starting'].includes(b.status.toLowerCase())
                    );

                    // Priority 2: Any Active Bot
                    if (!mockBot) {
                        mockBot = bots.find(b => ['active', 'running', 'starting'].includes(b.status.toLowerCase()));
                    }

                    // Priority 3: Any Bot on MOCK pair
                    if (!mockBot) {
                        mockBot = bots.find(b => b.config?.pair?.includes('MOCK') || b.pair?.includes('MOCK'));
                    }

                    // Fallback: First bot
                    if (!mockBot && bots.length > 0) mockBot = bots[0];

                    if (mockBot) setConnectedBot(mockBot);
                }

            } catch (e) {
                console.error("Failed to fetch initial backtest data", e);
            } finally {
                await minDelay;
                setLoading(false);
            }
        };
        initData();
    }, []);

    // [NEW] Unified Price Update Logic
    const submitPriceUpdate = async (targetPrice) => {
        try {
            const { control: controlUrl } = getUrls();
            const res = await fetch(controlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: parseFloat(targetPrice) })
            });
            if (!res.ok) throw new Error("Failed to update");

            setLogs(prev => [`[${new Date().toLocaleTimeString()}] Price set to ${targetPrice.toFixed(2)}`, ...prev]);
            // Also update local input state to match
            setInputPrice(targetPrice.toString());
        } catch (err) {
            addToast("Failed to update price. Is backend running?", "error");
        }
    };

    const updatePrice = async (e) => {
        e.preventDefault();
        await submitPriceUpdate(parseFloat(inputPrice));
    };

    const handleFixedAdjust = (direction) => {
        const current = parseFloat(price);
        const change = parseFloat(adjustAmount) * direction;
        const newPrice = current + change;
        submitPriceUpdate(newPrice);
    };

    const handlePercentAdjust = (direction) => {
        const current = parseFloat(price);
        const percent = parseFloat(adjustPercent);
        const change = current * (percent / 100) * direction;
        const newPrice = current + change;
        submitPriceUpdate(newPrice);
    };


    const setQuickDate = (days) => {
        const end = new Date();
        const start = new Date(end.getTime() - (days * 24 * 60 * 60 * 1000));

        const pad = (n) => n.toString().padStart(2, '0');
        const formatDt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

        setBtEndTime(end);
        setBtStartTime(start);
    };

    if (loading) return <DashboardLayout headerSlot={<h1 className="text-xl font-bold text-white tracking-tight"></h1>} isLoading={true}><BacktestSkeleton /></DashboardLayout>;

    const quoteAsset = 'USDT';
    const baseAsset = Object.keys(balances).find(key => key !== 'USDT') || 'MOCK';

    return (
        <DashboardLayout
            isLoading={loading}
            headerSlot={
                <ExchangeFilter
                    isLoading={loading}
                    options={connectedExchanges.length > 0
                        ? ['ALL', ...connectedExchanges.map(e => e.exchange_name.toUpperCase().replace('_PAPER', ''))]
                        : ['ALL', 'BINANCE']}
                    selected={exchangeFilter}
                    onSelect={setExchangeFilter}
                />
            }
        >

            <div className="w-full text-white pb-24">
                {/* Breadcrumb & Status */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-lg font-medium">Tools</span>
                        <span className="text-gray-600 text-lg font-medium">{'>'}</span>
                        <h2 className="text-xl font-medium text-white">Backtest Engine</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isConnected ? 'bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                            {isConnected ? "CONNECTED" : "DISCONNECTED"}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Left Column: Chart & Order Book */}
                    <div className="lg:col-span-3 flex flex-col gap-6">

                        {/* Chart Container */}
                        <div className="bg-[#131517] border border-white/5 rounded-3xl p-2 h-[450px] relative overflow-hidden">
                            <div ref={chartContainerRef} className="w-full h-full rounded-2xl" />
                        </div>



                        {/* [NEW] Connected Session Header */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bot Info */}
                            <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Activity size={64} className="text-[#00FF9D]" />
                                </div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 z-10 relative">Connected Bot</h3>
                                {connectedBot ? (
                                    <div className="z-10 relative">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            {connectedBot.bot_name}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase border ${connectedBot.status === 'active'
                                                ? 'bg-[#00FF9D]/10 text-[#00FF9D] border-[#00FF9D]/20'
                                                : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {connectedBot.status}
                                            </span>
                                        </h2>
                                        <p className="text-gray-500 text-xs font-mono mt-2">ID: {connectedBot.bot_id} | {connectedBot.config?.pair || "MOCK/USDT"}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-sm z-10 relative">Searching for active bot...</p>
                                )}
                            </div>

                            {/* Wallet Balance */}
                            <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 relative overflow-hidden hover:border-white/10 transition-all">
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Backtest Wallet</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2 font-medium">{quoteAsset} (Quote)</p>
                                        <p className="text-2xl font-bold font-mono text-white">
                                            {balances[quoteAsset] ? parseFloat(balances[quoteAsset].free).toFixed(2) : '0.00'}
                                        </p>
                                        {balances[quoteAsset] && balances[quoteAsset].locked > 0 && (
                                            <p className="text-[10px] text-gray-500 mt-1">Locked: {parseFloat(balances[quoteAsset].locked).toFixed(2)}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2 font-medium">{baseAsset} (Base)</p>
                                        <p className="text-2xl font-bold font-mono text-white">
                                            {balances[baseAsset] ? parseFloat(balances[baseAsset].free).toFixed(4) : '0.0000'}
                                        </p>
                                        {balances[baseAsset] && balances[baseAsset].locked > 0 && (
                                            <p className="text-[10px] text-gray-500 mt-1">Locked: {parseFloat(balances[baseAsset].locked).toFixed(4)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Ticker */}
                        <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF9D]/5 rounded-full blur-[60px] pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity" />
                            <div className="z-10">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{baseAsset}/{quoteAsset}</p>
                                <div className="flex items-center gap-3">
                                    <h2 className={`text-5xl font-bold font-mono tracking-tight transition-colors duration-300 ${price >= previousPrice ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                        {price.toFixed(2)}
                                    </h2>
                                    {price !== previousPrice && (
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${price >= previousPrice ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-red-500/10 text-red-500'}`}>
                                            {price >= previousPrice ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                            {Math.abs(((price - previousPrice) / previousPrice) * 100).toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-6 z-10">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">24h High</p>
                                    <p className="font-mono text-lg font-bold text-white">{(price * 1.05).toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">24h Low</p>
                                    <p className="font-mono text-lg font-bold text-white">{(price * 0.95).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>



                        {/* Active Orders */}
                        <div className="bg-[#131517] border border-white/5 rounded-3xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-[#00FF9D]" />
                                Open Orders
                            </h3>
                            {orders.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Activity size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No active orders</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-400 border-b border-white/5">
                                                <th className="text-left pb-3 font-bold uppercase text-xs tracking-wider">Side</th>
                                                <th className="text-right pb-3 font-bold uppercase text-xs tracking-wider">Price</th>
                                                <th className="text-right pb-3 font-bold uppercase text-xs tracking-wider">Amount</th>
                                                <th className="text-right pb-3 font-bold uppercase text-xs tracking-wider">Filled</th>
                                                <th className="text-right pb-3 font-bold uppercase text-xs tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order, i) => (
                                                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                    <td className={`py-3 font-bold ${order.side === 'BUY' ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                                        {order.side}
                                                    </td>
                                                    <td className="py-3 text-right font-mono text-white">{parseFloat(order.price).toFixed(2)}</td>
                                                    <td className="py-3 text-right font-mono text-gray-300">{parseFloat(order.origQty).toFixed(4)}</td>
                                                    <td className="py-3 text-right font-mono text-gray-300">{parseFloat(order.executedQty).toFixed(4)}</td>
                                                    <td className="py-3 text-right">
                                                        <span className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded-lg text-xs font-medium">
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* [NEW] Recent Trades / Fills */}
                        <div className="bg-[#131517] border border-white/5 rounded-3xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <RefreshCw size={18} className="text-purple-400" />
                                Recent Trades / Fills
                            </h3>
                            {trades.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <RefreshCw size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No trades executed in this session</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-400 border-b border-white/5">
                                                <th className="text-left pb-3 font-bold uppercase text-xs tracking-wider">Side</th>
                                                <th className="text-right pb-3 font-bold uppercase text-xs tracking-wider">Price</th>
                                                <th className="text-right pb-3 font-bold uppercase text-xs tracking-wider">Amount</th>
                                                <th className="text-right pb-3 font-bold uppercase text-xs tracking-wider">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trades.map((trade, i) => (
                                                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                    <td className={`py-3 font-bold ${trade.side === 'BUY' ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                                        {trade.side}
                                                    </td>
                                                    <td className="py-3 text-right font-mono text-white">{parseFloat(trade.price).toFixed(2)}</td>
                                                    <td className="py-3 text-right font-mono text-gray-300">{parseFloat(trade.qty).toFixed(4)}</td>
                                                    <td className="py-3 text-right text-gray-500 text-xs">
                                                        {new Date(trade.time).toLocaleTimeString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Control Panel */}
                    <div className="space-y-6">
                        <div className="bg-[#131517] border border-white/5 rounded-3xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-white">
                                <Activity size={20} className="text-[#00FF9D]" /> Historical Backtest
                            </h3>
                            <p className="text-xs text-gray-400 mb-6">Replay historical market data to test bot logic.</p>

                            {/* Bot Selection & Configuration */}
                            <div className="space-y-4 mb-6 pb-6 border-b border-white/5">
                                <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Bot Strategy</h4>
                                <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                                    <button
                                        onClick={() => setSelectedBot('grid')}
                                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${selectedBot === 'grid' ? 'bg-[#00FF9D] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Grid Bot
                                    </button>
                                    <button
                                        onClick={() => setSelectedBot('dca')}
                                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${selectedBot === 'dca' ? 'bg-[#00FF9D] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        DCA Bot
                                        <span className="ml-1 text-[8px] uppercase bg-[#131B1F] text-[#00FF9D] px-1 py-0.5 rounded border border-[#00FF9D]/20">Soon</span>
                                    </button>
                                </div>

                                {selectedBot === 'grid' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">

                                        {/* Setup Mode Toggle */}
                                        <div className="flex gap-2 mb-2 p-1 bg-black/20 rounded-lg border border-white/5">
                                            <button
                                                onClick={() => setBotSetupMode('default')}
                                                className={`flex-1 py-1 text-[10px] rounded font-bold transition-all ${botSetupMode === 'default' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                Auto (Default)
                                            </button>
                                            <button
                                                onClick={() => setBotSetupMode('manual')}
                                                className={`flex-1 py-1 text-[10px] rounded font-bold transition-all ${botSetupMode === 'manual' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                Manual Setup
                                            </button>
                                        </div>

                                        {botSetupMode === 'manual' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Upper Price</label>
                                                        <input
                                                            type="number"
                                                            value={gridConfig.upperPrice}
                                                            onChange={(e) => setGridConfig({ ...gridConfig, upperPrice: e.target.value })}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none"
                                                            placeholder="High"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Lower Price</label>
                                                        <input
                                                            type="number"
                                                            value={gridConfig.lowerPrice}
                                                            onChange={(e) => setGridConfig({ ...gridConfig, lowerPrice: e.target.value })}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none"
                                                            placeholder="Low"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Generic Configuration (Visible in both modes) */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {botSetupMode === 'manual' && (
                                                <div>
                                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Grids</label>
                                                    <input
                                                        type="number"
                                                        value={gridConfig.grids}
                                                        onChange={(e) => setGridConfig({ ...gridConfig, grids: parseInt(e.target.value) || 0 })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none"
                                                    />
                                                </div>
                                            )}
                                            <div className={botSetupMode === 'default' ? "col-span-2" : ""}>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Investment (USDT)</label>
                                                <input
                                                    type="number"
                                                    value={gridConfig.investment}
                                                    onChange={(e) => setGridConfig({ ...gridConfig, investment: parseFloat(e.target.value) || 0 })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none"
                                                />
                                            </div>
                                        </div>

                                        {botSetupMode === 'manual' && (
                                            <div>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Grid Type</label>
                                                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                                    {['Arithmetic', 'Geometric'].map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => {
                                                                setGridConfig(prev => {
                                                                    let nt = { ...prev, gridType: t };
                                                                    if (t === 'Arithmetic') nt.orderSizeType = 'base';
                                                                    return nt;
                                                                })
                                                            }}
                                                            className={`flex-1 py-1 rounded text-[10px] transition-colors ${gridConfig.gridType === t ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                                                        >
                                                            {t.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Advanced Settings */}
                                        <div className="pt-2 border-t border-white/5 space-y-3">
                                            <div>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Order Size Type</label>
                                                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                                    <button
                                                        onClick={() => setGridConfig({ ...gridConfig, orderSizeType: 'quote' })}
                                                        disabled={gridConfig.gridType === 'Arithmetic'}
                                                        className={`flex-1 py-1 rounded text-[10px] transition-colors ${(botSetupMode === 'manual' && gridConfig.gridType === 'Arithmetic') ? 'opacity-50 cursor-not-allowed text-gray-600' : gridConfig.orderSizeType === 'quote' ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        FIXED USDT (Quote)
                                                    </button>
                                                    <button
                                                        onClick={() => setGridConfig({ ...gridConfig, orderSizeType: 'base' })}
                                                        className={`flex-1 py-1 rounded text-[10px] transition-colors ${gridConfig.orderSizeType === 'base' ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        FIXED COIN (Base)
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Profit Mode</label>
                                                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                                    {['USDT_ONLY', 'COIN_ONLY', 'HYBRID'].map(m => {
                                                        const isDisabled = gridConfig.orderSizeType === 'base' && m !== 'USDT_ONLY';
                                                        const pLabel = m === 'USDT_ONLY' ? 'USDT ONLY' : m === 'COIN_ONLY' ? 'COIN ONLY' : 'HYBRID';
                                                        return (
                                                            <button
                                                                key={m}
                                                                onClick={() => setGridConfig({ ...gridConfig, profitMode: m })}
                                                                disabled={isDisabled}
                                                                className={`flex-1 py-1 rounded text-[10px] transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed text-gray-600' : gridConfig.profitMode === m ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                                                            >
                                                                {pLabel}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {gridConfig.profitMode === 'USDT_ONLY' && (
                                                <div>
                                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Fiat Profit Style</label>
                                                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                                        {['INSTANT', 'DELAYED', 'SPLIT'].map(s => {
                                                            const isFiatDisabled = gridConfig.orderSizeType === 'base' && s !== 'INSTANT';
                                                            return (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => setGridConfig({ ...gridConfig, fiatProfitStyle: s })}
                                                                    disabled={isFiatDisabled}
                                                                    className={`flex-1 py-1 rounded text-[10px] transition-colors ${isFiatDisabled ? 'opacity-50 cursor-not-allowed text-gray-600' : gridConfig.fiatProfitStyle === s ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                                                                >
                                                                    {s}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {(gridConfig.profitMode === 'HYBRID' || (gridConfig.profitMode === 'USDT_ONLY' && gridConfig.fiatProfitStyle === 'SPLIT')) && (
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-[10px] text-gray-500 font-bold uppercase block">Profit Split Ratio (To Fiat)</label>
                                                        <span className="text-[10px] text-[#00FF9D] font-bold">{(gridConfig.profitSplitRatio * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0" max="1" step="0.05"
                                                        value={gridConfig.profitSplitRatio}
                                                        onChange={e => setGridConfig({ ...gridConfig, profitSplitRatio: parseFloat(e.target.value) })}
                                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00FF9D] mt-1 mb-2"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-white/5 space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <label className="flex items-center gap-2 text-[10px] text-gray-300 border border-white/5 bg-black/40 p-2 rounded-lg cursor-pointer hover:border-[#00FF9D]/30 transition-all">
                                                    <input type="checkbox" checked={gridConfig.trailingDown} onChange={e => setGridConfig({ ...gridConfig, trailingDown: e.target.checked })} className="accent-[#00FF9D] w-3 h-3" />
                                                    <span className="font-bold uppercase">Trailing Down</span>
                                                </label>
                                                <div className="relative group">
                                                    <label className={`flex items-center gap-2 text-[10px] text-gray-300 border border-white/5 bg-black/40 p-2 rounded-lg transition-all ${gridConfig.orderSizeType === 'base' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#00FF9D]/30'}`}>
                                                        <input type="checkbox" checked={gridConfig.trailingUp} disabled={gridConfig.orderSizeType === 'base'} onChange={e => setGridConfig({ ...gridConfig, trailingUp: e.target.checked })} className={`accent-[#00FF9D] w-3 h-3 ${gridConfig.orderSizeType === 'base' ? 'cursor-not-allowed' : ''}`} />
                                                        <span className="font-bold uppercase">Trailing Up</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>

                            <div className="space-y-5 mb-6">
                                {/* Details */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block tracking-wider">Symbol</label>
                                        <input
                                            type="text"
                                            value={btSymbol}
                                            onChange={(e) => setBtSymbol(e.target.value.toUpperCase())}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#00FF9D]/50 focus:ring-2 focus:ring-[#00FF9D]/20 outline-none transition-all"
                                            placeholder="BTCUSDT"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block tracking-wider">Interval</label>
                                        <select
                                            value={btInterval}
                                            onChange={(e) => setBtInterval(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#00FF9D]/50 outline-none transition-all"
                                        >
                                            <option value="1m">1m</option>
                                            <option value="15m">15m</option>
                                            <option value="1h">1h</option>
                                            <option value="4h">4h</option>
                                            <option value="1d">1d</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block tracking-wider">Start Time (opt)</label>
                                        <DatePicker
                                            selected={btStartTime}
                                            onChange={(date) => setBtStartTime(date)}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            timeCaption="time"
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none transition-all"
                                            placeholderText="Select Start Time"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block tracking-wider">End Time (opt)</label>
                                        <DatePicker
                                            selected={btEndTime}
                                            onChange={(date) => setBtEndTime(date)}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            timeCaption="time"
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none transition-all"
                                            placeholderText="Select End Time"
                                        />
                                    </div>
                                </div>

                                {/* Quick Date Select */}
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-2 block tracking-wider">Quick Select Preset</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        <button type="button" onClick={() => setQuickDate(1)} className="py-2 rounded-lg text-xs font-bold border transition-all bg-black/20 text-gray-400 border-white/5 hover:border-[#00FF9D]/50 hover:text-[#00FF9D]">1D</button>
                                        <button type="button" onClick={() => setQuickDate(7)} className="py-2 rounded-lg text-xs font-bold border transition-all bg-black/20 text-gray-400 border-white/5 hover:border-[#00FF9D]/50 hover:text-[#00FF9D]">1W</button>
                                        <button type="button" onClick={() => setQuickDate(30)} className="py-2 rounded-lg text-xs font-bold border transition-all bg-black/20 text-gray-400 border-white/5 hover:border-[#00FF9D]/50 hover:text-[#00FF9D]">1M</button>
                                        <button type="button" onClick={() => setQuickDate(90)} className="py-2 rounded-lg text-xs font-bold border transition-all bg-black/20 text-gray-400 border-white/5 hover:border-[#00FF9D]/50 hover:text-[#00FF9D]">3M</button>
                                    </div>
                                </div>

                                {/* Interval Slider */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Playback Speed</label>
                                        <span className="text-[10px] font-mono text-[#00FF9D] font-bold">{btPlaySpeed}ms / tick</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="5000"
                                        step="50"
                                        value={btPlaySpeed}
                                        onChange={(e) => setBtPlaySpeed(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00FF9D]"
                                    />
                                    {btPlaySpeed < 300 && (
                                        <p className="text-[10px] text-yellow-500/80 mt-2 flex items-center gap-1">
                                            <AlertCircle size={10} /> Fast speed may skip chart renders
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {isAutoMoving && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { control } = getUrls();
                                                const url = control.replace('/control/price', '/control/toggle');
                                                await fetch(url, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        [isPaused ? 'resume' : 'pause']: true
                                                    })
                                                });
                                                setIsPaused(!isPaused);
                                                addToast(isPaused ? "Backtest Resumed" : "Backtest Paused", "success");
                                            } catch (e) {
                                                addToast("Failed to toggle pause", "error");
                                            }
                                        }}
                                        className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${isPaused ? 'bg-yellow-500 text-black shadow-yellow-500/20' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 hover:bg-yellow-500/30'}`}
                                    >
                                        {isPaused ? "RESUME" : "PAUSE"}
                                    </button>
                                )}
                                <button
                                    onClick={async () => {
                                        try {
                                            const { control } = getUrls();
                                            const url = control.replace('/control/price', '/control/toggle');
                                            const newState = !isAutoMoving;

                                            // Process Date inputs into MS timestamp if provided
                                            const st = btStartTime ? btStartTime.getTime() : undefined;
                                            const et = btEndTime ? btEndTime.getTime() : undefined;

                                            let botPayload = null;
                                            if (newState && selectedBot === 'grid') {
                                                if (botSetupMode === 'manual') {
                                                    if (!gridConfig.upperPrice || !gridConfig.lowerPrice || parseFloat(gridConfig.upperPrice) <= parseFloat(gridConfig.lowerPrice)) {
                                                        addToast("Please set valid Grid upper and lower prices.", "error");
                                                        return; // prevent starting Backtest
                                                    }
                                                }
                                                botPayload = {
                                                    botType: 'grid',
                                                    setupMode: botSetupMode,
                                                    config: gridConfig
                                                };
                                            } else if (newState && selectedBot === 'dca') {
                                                addToast("DCA Bot is coming soon!", "info");
                                                return;
                                            }

                                            await fetch(url, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    enabled: newState,
                                                    symbol: btSymbol,
                                                    interval: btInterval,
                                                    startTime: st,
                                                    endTime: et,
                                                    playSpeed: btPlaySpeed,
                                                    bot: botPayload
                                                })
                                            });
                                            setIsAutoMoving(newState);
                                            if (!newState) setIsPaused(false);
                                            addToast(newState ? `Backtest Started (${btSymbol})` : "Backtest Stopped", "success");
                                        } catch (e) {
                                            addToast("Failed to toggle backtest", "error");
                                        }
                                    }}
                                    className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${isAutoMoving ? 'flex-[2] bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' : 'w-full bg-[#00FF9D] text-black hover:bg-[#00FF9D]/90 shadow-[#00FF9D]/20'}`}
                                >
                                    {isAutoMoving ? (
                                        <>
                                            <Activity size={18} className="animate-pulse" />
                                            STOP BACKTEST
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={18} />
                                            START BACKTEST
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-[#131517] border border-white/5 rounded-3xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-white">
                                <AlertCircle size={20} className="text-blue-400" /> Usage Guide
                            </h3>
                            <div className="text-sm text-gray-400 space-y-3">
                                <p>1. Ensure <strong>mock_exchange/server.py</strong> is running.</p>
                                <p>2. Configure your bot to connect to the backtest engine.</p>
                                <p>3. Changing the price here will trigger orders if your bot is active and grid lines are crossed.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default BacktestExchange;

