
import React, { useState } from 'react';
import { Activity, Zap, Play, CheckCircle2, XCircle, TrendingUp, AlertCircle, RefreshCw, Search, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import API_BASE_URL from '../../config';
import { useToast } from '../../context/ToastContext';
import { getToken } from '../../utils/token';
import DashboardLayout from '../../components/DashboardLayout';
import { getSortedPairs } from '../../data/pairs';
const ALL_PAIRS = getSortedPairs();

const FastBacktest = () => {
    const { addToast } = useToast();

    // Loading & Result States
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [report, setReport] = useState(null);
    const [summary, setSummary] = useState(null);

    // Bot Selection State
    const [selectedBot, setSelectedBot] = useState('grid'); // 'grid' | 'dca'
    const [botSetupMode, setBotSetupMode] = useState('default'); // 'default' | 'manual'

    // Backtest Range Config
    const [btSymbol, setBtSymbol] = useState('BTCUSDT');
    const [btInterval, setBtInterval] = useState('1h');
    const [btStartTime, setBtStartTime] = useState(null);
    const [btEndTime, setBtEndTime] = useState(null);

    // ADD THESE THREE LINES:
    const [isPairOpen, setIsPairOpen] = useState(false);
    const [pairSearch, setPairSearch] = useState('');
    const filteredPairs = ALL_PAIRS.filter(p => p.toLowerCase().includes(pairSearch.toLowerCase()));


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

    const setQuickDate = (days) => {
        const end = new Date();
        const start = new Date(end.getTime() - (days * 24 * 60 * 60 * 1000));
        setBtEndTime(end);
        setBtStartTime(start);
    };

    const runFastBacktest = async () => {
        if (selectedBot === 'dca') {
            addToast("DCA Bot backtesting is coming soon!", "info");
            return;
        }

        if (botSetupMode === 'manual') {
            if (!gridConfig.upperPrice || !gridConfig.lowerPrice || parseFloat(gridConfig.upperPrice) <= parseFloat(gridConfig.lowerPrice)) {
                addToast("Please set valid Grid upper and lower prices.", "error");
                return;
            }
        }

        setLoading(true);
        setReport(null);
        setSummary(null);
        setProgress(0); // Reset progress on new run

        try {
            const token = getToken();
            // Format dates to ISO strings for Python Pydantic model
            let startStr = btStartTime ? btStartTime.toISOString() : "2024-01-01T00:00:00Z";
            let endStr = btEndTime ? btEndTime.toISOString() : new Date().toISOString();

            // Format pair to include slash (BTCUSDT -> BTC/USDT) which python create_config expects
            const formatPair = (symbol) => {
                if (symbol.includes('/')) return symbol;
                if (symbol.endsWith('USDT')) return symbol.replace('USDT', '/USDT');
                if (symbol.endsWith('BNB')) return symbol.replace('BNB', '/BNB');
                return symbol; // fallback
            };

            // Reformat payload accurately to exactly match Python Backend Pydantic FastBacktestRequest
            const payload = {
                exchange: "binance", // Assuming binance or parse from selected exchange map
                pair: formatPair(btSymbol),
                startDate: startStr,
                endDate: endStr,
                investment: parseFloat(gridConfig.investment),
                timeframe: btInterval,
                strategy: {
                    upper_price: parseFloat(gridConfig.upperPrice) || 0,
                    lower_price: parseFloat(gridConfig.lowerPrice) || 0,
                    grids: parseInt(gridConfig.grids),
                    spacing: gridConfig.gridType.toLowerCase(),
                    order_size_type: gridConfig.orderSizeType,
                    profit_mode: gridConfig.profitMode,
                    fiat_profit_style: gridConfig.fiatProfitStyle,
                    profit_split_ratio: parseFloat(gridConfig.profitSplitRatio),
                    trailing_up: gridConfig.trailingUp,
                    trailing_down: gridConfig.trailingDown
                }
            };

            const response = await fetch(`${API_BASE_URL}/user/fast-backtest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || errData.message || 'Failed to start fast backtest');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let finalData = null;

            const handleParsed = (parsed) => {
                if (typeof parsed === "string") {
                    parsed = JSON.parse(parsed);
                }
                if (parsed.error) {
                    throw new Error(parsed.error);
                }
                if (parsed.progress !== undefined) {
                    setProgress(parsed.progress);
                }
                if (parsed.result !== undefined) {
                    finalData = parsed.result;
                }
            };

            const processLine = (line) => {
                const trimmed = line.trim();
                if (!trimmed) return;
                try {
                    handleParsed(JSON.parse(trimmed));
                } catch (e) {
                    if (e.name !== "SyntaxError") throw e;
                    console.warn("Stream parse skip:", trimmed.substring(0, 80));
                }
            };

            let buffer = "";

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) {
                    let chunk = decoder.decode(value, { stream: !streamDone });

                    // Fallback: if backend double-encodes as JSON string, unwrap it
                    if (chunk.startsWith('"') && chunk.endsWith('"')) {
                        try { chunk = JSON.parse(chunk); } catch { /* leave as-is */ }
                    }

                    buffer += chunk;

                    // Split by newlines and process each complete line
                    let newlineIdx;
                    while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
                        const line = buffer.substring(0, newlineIdx);
                        buffer = buffer.substring(newlineIdx + 1);
                        processLine(line);
                    }
                }
            }

            // Process remaining buffer
            if (buffer.trim()) {
                processLine(buffer);
            }

            const data = finalData;

            if (!data || !data.performance_summary) {
                throw new Error("No report generated by the engine.");
            }

            if (data.performance_summary) {
                const ps = data.performance_summary;
                const parsePct = (val) => parseFloat((val || "0").toString().replace("%", ""));

                const finalCap = parseFloat(ps["Final Balance (Fiat)"] || "0");
                const initialCap = parseFloat(gridConfig.investment || 1000);
                const totalProfit = finalCap - initialCap;

                const daysTraded = Math.max(1, Math.ceil((new Date(endStr) - new Date(startStr)) / (1000 * 60 * 60 * 24)));
                const apr = (totalProfit / initialCap) * (365 / daysTraded) * 100;

                const mappedReport = {
                    total_profit: totalProfit,
                    profit_percentage: parsePct(ps["ROI"]),
                    initial_capital: initialCap,
                    final_capital: finalCap,
                    max_drawdown_percentage: parsePct(ps["Max Drawdown"]),
                    win_rate: parsePct(ps["Win Rate"]),
                    total_trades_count: (Number(ps["Number of Buy Trades"]) || 0) + (Number(ps["Number of Sell Trades"]) || 0),
                    winning_trades_count: Number(ps["Number of Buy Trades"]) || 0,
                    losing_trades_count: Number(ps["Number of Sell Trades"]) || 0,
                    apr: apr
                };

                setReport(mappedReport);
                setSummary(null);
                addToast("Backtest completed successfully!", "success");
            } else {
                throw new Error("Invalid response format from engine");
            }

        } catch (error) {
            console.error("Fast Backtest Error:", error);
            addToast(error.message || "An error occurred during backtesting.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout headerSlot={<h1 className="text-xl font-bold text-white tracking-tight">Fast Backtest</h1>}>
            <div className="w-full text-white pb-24">
                {/* Breadcrumb & Status */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-lg font-medium">Tools</span>
                        <span className="text-gray-600 text-lg font-medium">{'>'}</span>
                        <h2 className="text-xl font-medium text-white flex items-center gap-2">
                            <Zap size={20} className="text-[#00FF9D]" /> Fast Backtest
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Results Panel */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {loading ? (
                            <div className="bg-[#131517] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[500px] w-full">
                                <RefreshCw size={48} className="text-[#00FF9D] animate-spin mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {progress < 100 ? `Simulating... ${progress}%` : "Finalizing Report..."}
                                </h3>

                                <div className="w-full max-w-md bg-white/5 rounded-full h-3 mt-4 mb-6 overflow-hidden">
                                    <div
                                        className="bg-[#00FF9D] h-3 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(0, 255, 157, 0.5)' }}
                                    ></div>
                                </div>

                                <p className="text-gray-400 text-sm text-center max-w-sm">
                                    The Python engine is crunching the numbers over historical records at maximum CPU speed.
                                </p>
                            </div>
                        ) : report ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Top Hero Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-[#131517] border border-[#00FF9D]/20 rounded-3xl p-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF9D]/10 rounded-full blur-[60px] pointer-events-none" />
                                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Total Profit</h3>
                                        <div className="relative z-10 flex items-center gap-4">
                                            <h2 className={`text-4xl font-bold font-mono ${report.total_profit >= 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                                {report.total_profit >= 0 ? '+' : ''}{report.total_profit.toFixed(2)} USDT
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">ROI</h3>
                                        <div className="flex items-center gap-3">
                                            <h2 className={`text-4xl font-bold font-mono ${report.profit_percentage >= 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                                {report.profit_percentage >= 0 ? '+' : ''}{report.profit_percentage.toFixed(2)}%
                                            </h2>
                                            <TrendingUp size={24} className={report.profit_percentage >= 0 ? 'text-[#00FF9D]' : 'text-red-500'} />
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Metrics Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-[#131517]/50 border border-white/5 rounded-2xl p-5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Initial Capital</p>
                                        <p className="text-lg font-bold font-mono text-white">{report.initial_capital.toFixed(2)} USDT</p>
                                    </div>
                                    <div className="bg-[#131517]/50 border border-white/5 rounded-2xl p-5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Final Capital</p>
                                        <p className="text-lg font-bold font-mono text-white">{report.final_capital.toFixed(2)} USDT</p>
                                    </div>
                                    <div className="bg-[#131517]/50 border border-white/5 rounded-2xl p-5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Max Drawdown</p>
                                        <p className="text-lg font-bold font-mono text-red-400">{report.max_drawdown_percentage.toFixed(2)}%</p>
                                    </div>
                                    <div className="bg-[#131517]/50 border border-[#00FF9D]/10 rounded-2xl p-5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">APR (Estimated)</p>
                                        <p className={`text-lg font-bold font-mono ${report.apr >= 0 ? 'text-[#00FF9D]' : 'text-red-400'}`}>
                                            {report.apr.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Trade Breakdown */}
                                <div className="bg-[#131517] border border-white/5 rounded-3xl p-6">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <Activity size={16} className="text-blue-400" /> Trade Execution Summary
                                    </h3>
                                    <div className="grid grid-cols-3 divide-x divide-white/5">
                                        <div className="text-center px-4">
                                            <p className="text-3xl font-bold font-mono text-white mb-1">{report.total_trades_count}</p>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Total Fills</p>
                                        </div>
                                        <div className="text-center px-4">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <CheckCircle2 size={16} className="text-[#00FF9D]" />
                                                <p className="text-3xl font-bold font-mono text-[#00FF9D]">{report.winning_trades_count}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Buy FILL</p>
                                        </div>
                                        <div className="text-center px-4">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <XCircle size={16} className="text-red-500" />
                                                <p className="text-3xl font-bold font-mono text-red-500">{report.losing_trades_count}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Sell FILL</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Engine Stats */}
                                {summary && (
                                    <div className="flex gap-4 justify-center">
                                        <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
                                            Processed {summary.candles_processed.toLocaleString()} candles in {summary.duration_ms.toFixed(0)}ms
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-[#131517] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[500px]">
                                <Zap size={64} className="text-gray-800 mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">Ready to Backtest</h3>
                                <p className="text-gray-500 text-sm text-center max-w-sm">
                                    Configure your strategy parameters on the right and click run. The Python engine will return the exact performance trace instantly.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Control Panel */}
                    <div className="space-y-6">
                        <div className="bg-[#131517] border border-white/5 rounded-3xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-white">
                                <Activity size={20} className="text-[#00FF9D]" /> Strategy Config
                            </h3>

                            {/* Bot Selection */}
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
                                        <div className="flex gap-2 mb-2 p-1 bg-black/20 rounded-lg border border-white/5">
                                            <button
                                                onClick={() => setBotSetupMode('default')}
                                                className={`flex-1 py-1 text-[10px] rounded font-bold transition-all ${botSetupMode === 'default' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                Auto
                                            </button>
                                            <button
                                                onClick={() => setBotSetupMode('manual')}
                                                className={`flex-1 py-1 text-[10px] rounded font-bold transition-all ${botSetupMode === 'manual' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                Manual
                                            </button>
                                        </div>

                                        {botSetupMode === 'manual' && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Upper Price</label>
                                                    <input type="number" value={gridConfig.upperPrice} onChange={(e) => setGridConfig({ ...gridConfig, upperPrice: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none" placeholder="High" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Lower Price</label>
                                                    <input type="number" value={gridConfig.lowerPrice} onChange={(e) => setGridConfig({ ...gridConfig, lowerPrice: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none" placeholder="Low" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            {botSetupMode === 'manual' && (
                                                <div>
                                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Grids</label>
                                                    <input type="number" value={gridConfig.grids} onChange={(e) => setGridConfig({ ...gridConfig, grids: parseInt(e.target.value) || 0 })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none" />
                                                </div>
                                            )}
                                            <div className={botSetupMode === 'default' ? "col-span-2" : ""}>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Capital (USDT)</label>
                                                <input type="number" value={gridConfig.investment} onChange={(e) => setGridConfig({ ...gridConfig, investment: parseFloat(e.target.value) || 0 })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none" />
                                            </div>
                                        </div>

                                        {botSetupMode === 'manual' && (
                                            <div>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Grid Type</label>
                                                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                                    {['Arithmetic', 'Geometric'].map(t => (
                                                        <button key={t} onClick={() => { setGridConfig(prev => { let nt = { ...prev, gridType: t }; if (t === 'Arithmetic') nt.orderSizeType = 'base'; return nt; }) }} className={`flex-1 py-1 rounded text-[10px] transition-colors ${gridConfig.gridType === t ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}>
                                                            {t.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Advanced Settings */}
                                        <div className="pt-2 border-t border-white/5 space-y-3">
                                            <div>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Order Size</label>
                                                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                                    <button onClick={() => setGridConfig({ ...gridConfig, orderSizeType: 'quote' })} disabled={gridConfig.gridType === 'Arithmetic'} className={`flex-1 py-1 rounded text-[10px] transition-colors ${(botSetupMode === 'manual' && gridConfig.gridType === 'Arithmetic') ? 'opacity-50 cursor-not-allowed text-gray-600' : gridConfig.orderSizeType === 'quote' ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}>FIXED USDT</button>
                                                    <button onClick={() => setGridConfig({ ...gridConfig, orderSizeType: 'base' })} className={`flex-1 py-1 rounded text-[10px] transition-colors ${gridConfig.orderSizeType === 'base' ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}>FIXED COIN</button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Profit Mode</label>
                                                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                                    {['USDT_ONLY', 'COIN_ONLY', 'HYBRID'].map(m => {
                                                        const isDisabled = gridConfig.orderSizeType === 'base' && m !== 'USDT_ONLY';
                                                        return (
                                                            <button key={m} onClick={() => setGridConfig({ ...gridConfig, profitMode: m })} disabled={isDisabled} className={`flex-1 py-1 rounded text-[10px] transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed text-gray-600' : gridConfig.profitMode === m ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}>
                                                                {m === 'USDT_ONLY' ? 'USDT' : m === 'COIN_ONLY' ? 'COIN' : 'HYBRID'}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {gridConfig.profitMode === 'USDT_ONLY' && (
                                                <div>
                                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Fiat Reserve</label>
                                                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                                        {['INSTANT', 'DELAYED', 'SPLIT'].map(s => {
                                                            const isDisabled = gridConfig.orderSizeType === 'base' && s !== 'INSTANT';
                                                            return (
                                                                <button key={s} onClick={() => setGridConfig({ ...gridConfig, fiatProfitStyle: s })} disabled={isDisabled} className={`flex-1 py-1 rounded text-[10px] transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed text-gray-600' : gridConfig.fiatProfitStyle === s ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400 hover:text-white'}`}>
                                                                    {s}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <label className="flex items-center gap-2 text-[10px] text-gray-300 border border-white/5 bg-black/40 p-2 rounded-lg cursor-pointer hover:border-[#00FF9D]/30 transition-all">
                                                    <input type="checkbox" checked={gridConfig.trailingDown} onChange={e => setGridConfig({ ...gridConfig, trailingDown: e.target.checked })} className="accent-[#00FF9D] w-3 h-3" />
                                                    <span className="font-bold uppercase">Trail Down</span>
                                                </label>
                                                <label className={`flex items-center gap-2 text-[10px] text-gray-300 border border-white/5 bg-black/40 p-2 rounded-lg transition-all ${gridConfig.orderSizeType === 'base' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#00FF9D]/30'}`}>
                                                    <input type="checkbox" checked={gridConfig.trailingUp} disabled={gridConfig.orderSizeType === 'base'} onChange={e => setGridConfig({ ...gridConfig, trailingUp: e.target.checked })} className={`accent-[#00FF9D] w-3 h-3 ${gridConfig.orderSizeType === 'base' ? 'cursor-not-allowed' : ''}`} />
                                                    <span className="font-bold uppercase">Trail Up</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-5 mb-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block tracking-wider">Symbol</label>
                                        <div className="relative">
                                            <div
                                                onClick={() => setIsPairOpen(!isPairOpen)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm flex justify-between items-center cursor-pointer hover:border-[#00FF9D]/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={`/icons/${btSymbol.replace(/USDT|USDC|FDUSD|BUSD/i, '').toLowerCase()}.png`}
                                                        alt={btSymbol}
                                                        className="w-5 h-5 rounded-full"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/icons/btc.png'; }}
                                                    />
                                                    <span>{btSymbol.replace('/', '')}</span>
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
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                        {filteredPairs.map(p => (
                                                            <div
                                                                key={p}
                                                                onClick={() => {
                                                                    setBtSymbol(p);
                                                                    setIsPairOpen(false);
                                                                    setPairSearch('');
                                                                }}
                                                                className="px-4 py-2 hover:bg-white/5 text-xs text-gray-300 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                                                            >
                                                                <img
                                                                    src={`/icons/${p.replace(/USDT|USDC|FDUSD|BUSD/i, '').toLowerCase()}.png`}
                                                                    alt={p}
                                                                    className="w-5 h-5 rounded-full"
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/icons/btc.png'; }}
                                                                />
                                                                <span className="font-bold">{p.replace('/', '')}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block tracking-wider">Candle Timeframe</label>
                                        <select value={btInterval} onChange={(e) => setBtInterval(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#00FF9D]/50 outline-none">
                                            <option value="1m">1m</option>
                                            <option value="15m">15m</option>
                                            <option value="1h">1h</option>
                                            <option value="4h">4h</option>
                                            <option value="1d">1d</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block tracking-wider">Start Time</label>
                                        <DatePicker selected={btStartTime} onChange={(date) => setBtStartTime(date)} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="MMMM d, yyyy h:mm aa" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none" placeholderText="Any" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block tracking-wider">End Time</label>
                                        <DatePicker selected={btEndTime} onChange={(date) => setBtEndTime(date)} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="MMMM d, yyyy h:mm aa" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] focus:border-[#00FF9D]/50 outline-none" placeholderText="Any" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-2 block tracking-wider">Quick Select</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        <button onClick={() => setQuickDate(1)} className="py-2 rounded-lg text-xs font-bold border transition-all bg-black/20 text-gray-400 border-white/5 hover:border-[#00FF9D]/50 hover:text-[#00FF9D]">1D</button>
                                        <button onClick={() => setQuickDate(7)} className="py-2 rounded-lg text-xs font-bold border transition-all bg-black/20 text-gray-400 border-white/5 hover:border-[#00FF9D]/50 hover:text-[#00FF9D]">1W</button>
                                        <button onClick={() => setQuickDate(30)} className="py-2 rounded-lg text-xs font-bold border transition-all bg-black/20 text-gray-400 border-white/5 hover:border-[#00FF9D]/50 hover:text-[#00FF9D]">1M</button>
                                        <button onClick={() => setQuickDate(90)} className="py-2 rounded-lg text-xs font-bold border transition-all bg-black/20 text-gray-400 border-white/5 hover:border-[#00FF9D]/50 hover:text-[#00FF9D]">3M</button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={runFastBacktest}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${loading ? 'bg-[#00FF9D]/50 text-black/50 cursor-not-allowed' : 'bg-[#00FF9D] text-black hover:bg-[#00FF9D]/90 shadow-[#00FF9D]/20'}`}
                            >
                                {loading ? (
                                    <><RefreshCw size={18} className="animate-spin" /> RUNNING...</>
                                ) : (
                                    <><Play size={18} /> START FAST BACKTEST</>
                                )}
                            </button>
                        </div>

                        <div className="bg-[#131517] border border-white/5 rounded-3xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-white">
                                <AlertCircle size={16} className="text-blue-400" /> Need to know
                            </h3>
                            <div className="text-xs text-gray-400 space-y-2">
                                <p>• The fast backtest bypasses network requests and API limits.</p>
                                <p>• Trading fees are automatically calculated using standard exchange rates.</p>
                                <p>• The test reflects your exact real-world config selection.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FastBacktest;
