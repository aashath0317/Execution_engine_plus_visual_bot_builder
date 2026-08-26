// src/Dashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    PieChart, Bell, Plus, ChevronUp, Loader2, X, Zap, CheckCircle2, ChevronDown, FileText, CheckSquare, Square, Link as LinkIcon,
    TrendingUp, Activity, Grid, Bot, MoreVertical, Trash2, Pause, Play, Gamepad2, Search, Settings2, Eye, EyeOff
} from 'lucide-react';
import { Area, AreaChart, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import API_BASE_URL from '../../config';
import { getToken } from '../../utils/token';
import ConfigureBotModal from './ConfigureBotModal';
import CreateBotModal from './CreateBotModal';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import PageHeader from '../../components/PageHeader';
import ExchangeFilter from '../../components/ExchangeFilter';


import { useTrading } from '../../context/TradingContext';
import BotSparkline from '../../components/BotSparkline';
import LoadingScreen from '../../components/LoadingScreen';
import useCountUp from '../../hooks/useCountUp';

import { formatTokenPrice } from '../../utils/formatting';
import { Skeleton, SkeletonShimmer, SkeletonText, SkeletonCircle, SkeletonCard } from '../../components/ui/skeleton';

// --- CONSTANTS ---
const EXCHANGES = [
    { id: 'binance', name: 'Binance', logo: '/exchanges_svg/binance.svg' },
    { id: 'bybit', name: 'Bybit', logo: '/exchanges_svg/Bybit.svg' },
    { id: 'okx', name: 'OKX', logo: '/exchanges_svg/okx.svg' },
];



// --- COMPONENT: CONNECT EXCHANGE MODAL ---
const ConnectExchangeModal = ({ isOpen, onClose, onSuccess, defaultIsTestnet = false, selectedExchange, setSelectedExchange }) => {
    const [activeTab, setActiveTab] = useState('manual');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [showPassphrase, setShowPassphrase] = useState(false);
    const [isTestnet, setIsTestnet] = useState(defaultIsTestnet);

    useEffect(() => {
        setIsTestnet(defaultIsTestnet);
    }, [defaultIsTestnet, isOpen]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!apiKey || !apiSecret) return setError("Please enter API Key and Secret");
        if (selectedExchange.id === 'okx' && !passphrase) return setError("Please enter Passphrase");

        setLoading(true);
        setError(null);
        try {
            const finalExchangeName = isTestnet ? `${selectedExchange.id}_paper` : selectedExchange.id;
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/user/exchange`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    exchange_name: finalExchangeName,
                    api_key: apiKey,
                    api_secret: apiSecret,
                    passphrase: passphrase
                })
            });

            if (res.ok) { onSuccess(); onClose(); }
            else {
                const data = await res.json();
                setError(data.message || "Connection failed. Please check your keys.");
            }
        } catch (error) { console.error(error); setError("Error connecting to server."); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
            <div className="bg-[#131517] border border-white/20 w-full max-w-lg rounded-3xl p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
                <h2 className="text-2xl font-bold text-white mb-6">Connect {isTestnet ? 'Paper' : 'Exchange'} API</h2>
                <div className="mb-6 relative">
                    <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Select Exchange</label>
                    <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-[#00FF9D]">
                        <div className="flex items-center gap-3">
                            <img src={selectedExchange.logo} alt={selectedExchange.name} className="h-6 w-6 object-contain" />
                            <span className="font-bold text-white">{selectedExchange.name}</span>
                        </div>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1e22] border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl">
                            {EXCHANGES.map(ex => (
                                <div key={ex.id} onClick={() => { setSelectedExchange(ex); setIsDropdownOpen(false); }} className="flex items-center gap-3 p-3 border border-transparent hover:border-[#00FF9D] rounded-lg cursor-pointer transition-colors">
                                    <img src={ex.logo} alt={ex.name} className="h-6 w-6 object-contain" />
                                    <span className="text-sm font-medium text-gray-200">{ex.name}</span>
                                    {selectedExchange.id === ex.id && <CheckCircle2 size={14} className="text-[#00FF9D] ml-auto" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex bg-[#131517] p-1 rounded-xl mb-6 border border-white/5">
                    <button onClick={() => setActiveTab('fast')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'fast' ? 'bg-[#00FF9D] text-black' : 'text-gray-400 hover:text-white'}`}>Fast Connect</button>
                    <button onClick={() => setActiveTab('manual')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'manual' ? 'bg-[#00FF9D] text-black' : 'text-gray-400 hover:text-white'}`}>Manual Entry</button>
                </div>
                {activeTab === 'manual' && (
                    <div className="space-y-4">
                        <div><label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">API Key</label><input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-[#131517] border border-white/10 rounded-xl p-3 text-white focus:border-[#00FF9D] outline-none" /></div>
                        <div><label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">API Secret</label><div className="relative"><input type={showSecret ? "text" : "password"} value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} className="w-full bg-[#131517] border border-white/10 rounded-xl p-3 text-white focus:border-[#00FF9D] outline-none pr-10" /><button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showSecret ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                        {selectedExchange.id === 'okx' && (<div><label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Passphrase</label><div className="relative"><input type={showPassphrase ? "text" : "password"} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} className="w-full bg-[#131517] border border-white/10 rounded-xl p-3 text-white focus:border-[#00FF9D] outline-none pr-10" /><button type="button" onClick={() => setShowPassphrase(!showPassphrase)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPassphrase ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>)}
                        <div className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${isTestnet ? 'bg-[#E2F708]/10 border-[#E2F708]/30' : 'bg-white/5 border-white/5'}`} onClick={() => setIsTestnet(!isTestnet)}>
                            {isTestnet ? <CheckSquare size={20} className="text-[#E2F708]" /> : <Square size={20} className="text-gray-500" />}
                            <span className={`text-sm font-bold ${isTestnet ? 'text-[#E2F708]' : 'text-gray-400'}`}>Connect to Testnet</span>
                        </div>
                        {error && <div className="text-red-400 text-xs font-bold">{error}</div>}
                        <button onClick={handleSubmit} disabled={loading} className={`w-full font-bold py-3.5 rounded-xl transition-all ${isTestnet ? 'bg-[#E2F708] text-black' : 'bg-[#00FF9D] text-black'}`}>
                            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : `Connect ${isTestnet ? 'Testnet' : 'Exchange'}`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const QUICK_LAUNCH = [
    { id: 'conservative', name: 'Conservative Long', type: 'DCA', desc: 'Low risk, steady growth (DCA)', icon: <TrendingUp size={20} className="text-[#00FF9D]" /> },
    { id: 'sideways', name: 'Sideways Grid', type: 'Grid', desc: 'Profit from volatility (Grid)', icon: <Grid size={20} className="white" /> },
    { id: 'aggressive', name: 'Aggressive Short', type: 'DCA', desc: 'High risk, bear market (DCA)', icon: <TrendingUp size={20} className="text-red-500 rotate-180" /> },
];

// --- COMPONENT: PROFIT WIDGET ---
const DailyProfitWidget = ({ current, percentage, chartData = [], className, style, delay = 0, timeframe, setTimeframe }) => {
    const animatedCurrent = useCountUp(current, 2000, delay);

    // Filter valid data points
    const validData = React.useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        const parsed = chartData.map((d, i) => ({
            ...d,
            value: parseFloat(d.value) || 0,
            date: d.date // assuming "date" field exists
        }));

        // Remove leading zeros for the sparkline area to prevent the flat straight line at the start
        const start = parsed.findIndex(d => d.value !== 0);
        return start !== -1 ? parsed.slice(start) : parsed;
    }, [chartData]);

    return (
        <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col justify-between overflow-hidden ${className || ''}`} style={style}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-sm">Profit</h3>
                    <span className="bg-[#1c1e22] text-gray-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/5">USD</span>
                </div>
                {setTimeframe && (
                    <div className="flex items-center gap-1 bg-[#1c1e22] rounded-md p-0.5 border border-white/5">
                        {['24H', '7D', '30D', 'ALL'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${timeframe === tf ? 'bg-[#00FF9D] text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col mb-4">
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-white tracking-tight">${animatedCurrent.toFixed(2)}</span>
                    <div className="bg-[#00FF9D]/10 px-2 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm transition-colors hover:bg-[#00FF9D]/20">
                        <TrendingUp size={14} className="text-[#00FF9D]" />
                        <span className="text-[#00FF9D] font-medium text-xs tracking-wide">
                            {percentage && !percentage.includes('-') && !percentage.includes('+') ? '+' : ''}{percentage}
                        </span>
                    </div>
                </div>
            </div>

            {/* Area Chart */}
            <div className="flex-1 w-full min-h-[120px] relative -ml-2">
                <ResponsiveContainer width="100%" height="65%">
                    <AreaChart data={validData}>
                        <defs>
                            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00FF9D" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00FF9D" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            hide
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#131517', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ display: 'none' }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Profit']}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#00FF9D"
                            strokeWidth={1}
                            fillOpacity={1}
                            fill="url(#profitGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Skeleton for DailyProfitWidget
const DailyProfitWidgetSkeleton = ({ className, style }) => (
    <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col justify-between overflow-hidden ${className || ''}`} style={style}>
        <div className="flex items-center gap-2 mb-2">
            <Skeleton width="120px" height="14px" />
            <Skeleton width="40px" height="18px" />
        </div>
        <div className="flex flex-col mb-4">
            <div className="flex items-center gap-4">
                <Skeleton width="140px" height="36px" />
                <Skeleton width="80px" height="32px" className="rounded-full" />
            </div>
        </div>
        <div className="flex-1 w-full min-h-[120px] relative">
            <SkeletonShimmer height="100%" />
        </div>
    </div>
);


const DailyProfitGoal_Deprecated_v3 = ({ current, target }) => {
    // 270-degree gauge based on standard "horseshoe"
    // Starts at 135 degrees (Bottom Left) and sweeps clockwise to 45 degrees (Bottom Right)
    // Angles for arc path drawing: startAngle=135, endAngle=405. Total 270.

    // Geometry
    const radius = 80;
    const cx = 100;
    const cy = 100;

    // Helper to calculate cartesian coordinates
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const startAngle = 135;
    const endAngle = 405;

    // SVG Path for the background and progress arc
    // Note: SVG y-axis is down, so 90deg is bottom.
    // 135deg is bottom-left quadrant. 405deg (45deg) is bottom-right quadrant.
    // This creates an arc open at the bottom.
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");

    // Dash Array Calculation
    const totalCircumference = 2 * Math.PI * radius;
    const arcLength = (270 / 360) * totalCircumference;
    const progress = Math.min((current / target) * 100, 100);
    const strokeDashoffset = arcLength - (progress / 100) * arcLength;

    return (
        <div className="bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-white">
                <ChevronDown size={20} className="rotate-90" />
            </div>
            <h3 className="absolute top-6 left-6 text-white font-bold text-lg">Daily Profit Goal</h3>

            <div className="relative w-64 h-64 mt-4 flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00FF9D" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#00FF9D" />
                        </linearGradient>
                    </defs>

                    {/* Background Arc */}
                    <path
                        d={d}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Progress Arc */}
                    <path
                        d={d}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <TrendingUp size={28} className="text-[#00FF9D] mb-2 drop-shadow-[0_0_10px_rgba(0,255,157,0.5)]" />
                    <span className="text-4xl font-bold text-white tracking-tight drop-shadow-lg scale-90">${current.toFixed(2)}</span>
                    <span className={`text-sm font-bold mt-2 ${parseFloat(percentage || "0") >= 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                        {parseFloat(percentage || "0") >= 0 ? '+' : ''}{percentage || "0%"}
                    </span>
                </div>

                {/* Labels */}
                <span className="absolute bottom-12 left-6 text-[10px] text-gray-500 font-bold">0%</span>
                <span className="absolute bottom-12 right-6 text-[10px] text-gray-500 font-bold">100%</span>
            </div>

            <div className="absolute bottom-6 flex flex-col items-center">
                <div className="text-[#00FF9D] text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                    {progress.toFixed(0)}% Complete
                </div>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Target: ${target.toFixed(2)}</span>
            </div>
        </div>
    );
};
const DailyProfitGoal_Deprecated_v2 = ({ current, target }) => {
    // 270-degree gauge based on standard "horseshoe"
    // Starts at 135 degrees (Bottom Left) and sweeps clockwise to 45 degrees (Bottom Right)
    // Angles for arc path drawing: startAngle=135, endAngle=405. Total 270.

    // Geometry
    const radius = 80;
    const cx = 100;
    const cy = 100;

    // Helper to calculate cartesian coordinates
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const startAngle = 135;
    const endAngle = 405;

    // SVG Path for the background and progress arc
    // Note: SVG y-axis is down, so 90deg is bottom.
    // 135deg is bottom-left quadrant. 405deg (45deg) is bottom-right quadrant.
    // This creates an arc open at the bottom.
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");

    // Dash Array Calculation
    const totalCircumference = 2 * Math.PI * radius;
    const arcLength = (270 / 360) * totalCircumference;
    const progress = Math.min((current / target) * 100, 100);
    const strokeDashoffset = arcLength - (progress / 100) * arcLength;

    return (
        <div className="bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-white">
                <ChevronDown size={20} className="rotate-90" />
            </div>
            <h3 className="absolute top-6 left-6 text-white font-bold text-lg">Daily Profit Goal</h3>

            <div className="relative w-64 h-64 mt-4 flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00FF9D" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#00FF9D" />
                        </linearGradient>
                    </defs>

                    {/* Background Arc */}
                    <path
                        d={d}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Progress Arc */}
                    <path
                        d={d}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <TrendingUp size={28} className="text-[#00FF9D] mb-2 drop-shadow-[0_0_10px_rgba(0,255,157,0.5)]" />
                    <span className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">${current.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Target: ${target.toFixed(2)}</span>
                </div>

                {/* Labels */}
                <span className="absolute bottom-16 left-10 text-[10px] text-gray-600 font-bold">0%</span>
                <span className="absolute bottom-16 right-10 text-[10px] text-gray-600 font-bold">100%</span>
            </div>

            <div className="absolute bottom-6 text-[#00FF9D] text-xs font-bold uppercase tracking-widest opacity-80">
                {progress.toFixed(0)}% Complete
            </div>
        </div>
    );
};
const DailyProfitGoal_Deprecated = ({ current, target }) => {
    const progress = Math.min((current / target) * 100, 100);
    const radius = 80;
    const arcLength = Math.PI * radius; // Half circle
    const strokeDashoffset = arcLength - (progress / 100) * arcLength;

    return (
        <div className="bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-white">
                <ChevronDown size={20} className="rotate-90" />
            </div>
            <h3 className="absolute top-6 left-6 text-white font-bold text-lg">Daily Profit Goal</h3>

            <div className="relative w-64 h-32 mt-12 flex items-end justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
                    {/* Background Arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Progress Arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#00FF9D"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute bottom-0 mb-4 text-center">
                    <TrendingUp size={24} className="text-[#00FF9D] mx-auto mb-1" />
                    <span className="text-3xl font-bold text-white block">${current.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Target: ${target.toFixed(2)}</span>
                </div>

                {/* Labels */}
                <div className="absolute -bottom-6 w-full flex justify-between px-6 text-[10px] text-gray-600 font-bold uppercase">
                    <span>0%</span>
                    <span>100%</span>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: ACTIVE BOTS WIDGET ---
const ActiveBotsWidget = ({ dcaCount, gridCount, bots = [], className, style, delay = 0 }) => {
    const animatedDca = useCountUp(dcaCount, 2000, delay);
    const animatedGrid = useCountUp(gridCount, 2000, delay);
    const [timeRange, setTimeRange] = React.useState('D'); // D, W, M

    // Prepare chart data for running bots and assign custom names
    const runningBots = bots.filter(b => ['active', 'running', 'Running'].includes(b.status));

    // Assign custom names (e.g., Grid bot - g1, DCA - d1)
    const customizedBots = React.useMemo(() => {
        let gCount = 0;
        let dCount = 0;
        return runningBots.map(b => {
            let name = b.pair || 'Bot';
            let shortName = name;

            // Determine type based on strategy or other props if available.
            // Assuming we can infer from existing data or just default to unknown if not explicit.
            // If the bot object has a 'strategy' field, use it. Otherwise, guess or generic.
            // For now, let's assume we can treat all as generic if type is missing, 
            // but the user specific "Grid bot" and "DCA".
            // Since we don't have explicit strategy type in the `bots` prop here (it's just a list),
            // we'll simulate it or use available fields. 
            // *correction*: The previous code didn't differentiate strategies in the `bots` array.
            // Let's assume 'grid' or 'dca' might be in the bot object, otherwise generic.

            const type = (b.strategy || '').toLowerCase();
            if (type.includes('grid')) {
                gCount++;
                name = `Grid bot - g${gCount}`;
                shortName = `g${gCount}`;
            } else if (type.includes('dca')) {
                dCount++;
                name = `DCA - d${dCount}`;
                shortName = `d${dCount}`;
            } else {
                // Fallback if strategy not explicit, treat as generic or random for demo if needed,
                // or just use pair name.
                // let's try to detect from pair or id if possible, otherwise just 'Bot'.
                // Actually, let's just increment a generic counter if we can't tell.
                if (gridCount > 0 && dcaCount === 0) { // If only grid bots exist
                    gCount++;
                    name = `Grid bot - g${gCount}`;
                    shortName = `g${gCount}`;
                } else if (dcaCount > 0 && gridCount === 0) {
                    dCount++;
                    name = `DCA - d${dCount}`;
                    shortName = `d${dCount}`;
                } else {
                    // Mixed or unknown, use generic
                    name = `Bot ${b.id.substring(0, 4)}`;
                    shortName = `b-${b.id.substring(0, 2)}`;
                }
            }

            return { ...b, displayName: name, shortName: shortName, color: type.includes('grid') ? '#8B5CF6' : '#00FF9D' }; // Example colors
        });
    }, [runningBots, dcaCount, gridCount]);

    const chartData = React.useMemo(() => {
        if (!customizedBots || customizedBots.length === 0) return [];

        let maxLen = 0;
        customizedBots.forEach(b => {
            const spark = b.sparkline || [];
            if (spark.length > maxLen) maxLen = spark.length;
        });
        if (maxLen === 0) return [];

        const data = [];
        for (let i = 0; i < maxLen; i++) {
            const point = { index: i };
            customizedBots.forEach(b => {
                const spark = b.sparkline || [];
                // Align to end (most recent data is at the end)
                // If lengths differ, align right?
                // Sparklines usually come as [oldest ... newest].
                // If we have different lengths, the newest data is at length-1.
                // Let's verify standard behavior. If index i is time, we align i?
                // Let's assume align by start for now or standard index match.
                const val = spark[i] ? spark[i].value : null;
                if (val !== null) point[b.displayName] = val;
            });
            if (Object.keys(point).length > 1) data.push(point);
        }
        return data;
    }, [customizedBots]);

    // Neon colors
    const colors = ['#00FF9D', '#D946EF', '#F59E0B', '#3B82F6'];

    return (
        <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col ${className || ''}`} style={style}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium text-sm">Active Bots</h3>
                <span className="bg-[#00FF9D]/10 text-[#00FF9D] text-[10px] font-bold px-2 py-0.5 rounded uppercase">Running</span>
            </div>

            {(dcaCount > 0 || gridCount > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {dcaCount > 0 && (
                        <div className="bg-[#1c1e22] border border-white/5 rounded-2xl p-4 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={14} className="text-gray-500" />
                                <span className="text-xs text-gray-400 font-bold uppercase">DCA</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white">{animatedDca.toFixed(0)}</span>
                            </div>
                        </div>
                    )}
                    {gridCount > 0 && (
                        <div className="bg-[#1c1e22] border border-white/5 rounded-2xl p-4 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <Grid size={14} className="text-gray-500" />
                                <span className="text-xs text-gray-400 font-bold uppercase">Grid</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white">{animatedGrid.toFixed(0)}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}


        </div>
    );
};

// Skeleton for ActiveBotsWidget
const ActiveBotsWidgetSkeleton = ({ className, style }) => (
    <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col ${className || ''}`} style={style}>
        <div className="flex justify-between items-center mb-6">
            <Skeleton width="100px" height="14px" />
            <Skeleton width="70px" height="20px" className="rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1c1e22] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton circle width="14px" height="14px" />
                    <Skeleton width="40px" height="12px" />
                </div>
                <Skeleton width="50px" height="32px" />
            </div>
            <div className="bg-[#1c1e22] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton circle width="14px" height="14px" />
                    <Skeleton width="40px" height="12px" />
                </div>
                <Skeleton width="50px" height="32px" />
            </div>
        </div>
    </div>
);

// --- COMPONENT: TOTAL BALANCE WIDGET ---
const TotalBalanceWidget = ({ balance, change, changePercent, available, locked, onRefresh, className, style, delay = 0 }) => {
    const animatedBalance = useCountUp(balance, 2000, delay);
    const animatedChange = useCountUp(change, 2000, delay);
    const animatedAvailable = useCountUp(available, 2000, delay);
    const animatedLocked = useCountUp(locked, 2000, delay);

    return (
        <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col ${className || ''}`} style={style}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-sm">Total Portfolio Value</h3>
                    <span className="bg-[#1c1e22] text-gray-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/5">USD</span>
                </div>
            </div>

            <div className="flex flex-col mb-6">
                <div className="flex items-center gap-4 mb-1">
                    <div className="text-4xl font-bold text-white tracking-tight leading-none">
                        ${animatedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="bg-[#00FF9D]/10 px-2 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm transition-colors hover:bg-[#00FF9D]/20">
                        <TrendingUp size={14} className="text-[#00FF9D]" />
                        <span className="text-[#00FF9D] font-medium text-xs tracking-wide">
                            {parseFloat(changePercent) >= 0 ? '+' : ''}{changePercent}%
                        </span>
                    </div>
                </div>
                <div className="text-sm font-medium text-blue-500">
                    +${animatedChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (24h)
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#1c1e22] border border-white/5 rounded-2xl p-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Available</span>
                    <span className="text-lg font-bold text-white">${animatedAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-[#1c1e22] border border-white/5 rounded-2xl p-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Locked</span>
                    <span className="text-lg font-bold text-white">${animatedLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
    );
};

// Skeleton for TotalBalanceWidget
const TotalBalanceWidgetSkeleton = ({ className, style }) => (
    <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col ${className || ''}`} style={style}>
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <Skeleton width="150px" height="14px" />
                <Skeleton width="40px" height="18px" />
            </div>
        </div>
        <div className="flex flex-col mb-6">
            <div className="flex items-center gap-4 mb-1">
                <Skeleton width="200px" height="40px" />
                <Skeleton width="90px" height="32px" className="rounded-full" />
            </div>
            <Skeleton width="120px" height="20px" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-[#1c1e22] border border-white/5 rounded-2xl p-2">
                <Skeleton width="60px" height="10px" className="mb-1" />
                <Skeleton width="80px" height="24px" />
            </div>
            <div className="bg-[#1c1e22] border border-white/5 rounded-2xl p-2">
                <Skeleton width="50px" height="10px" className="mb-1" />
                <Skeleton width="80px" height="24px" />
            </div>
        </div>
    </div>
);

// --- COMPONENT: CONNECT STATE SKELETON ---
const DashboardConnectSkeleton = () => (
    <div className="animate-in fade-in duration-500">
        {/* Hero Banner Skeleton */}
        <div className="rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden border border-white/10 bg-[#00FF9D]/5 h-72 md:h-80 flex flex-col justify-center">
            <div className="max-w-xl relative z-10">
                <SkeletonShimmer width="60%" height="40px" className="mb-4" />
                <div className="space-y-2 mb-8">
                    <SkeletonShimmer width="100%" height="12px" />
                    <SkeletonShimmer width="80%" height="12px" />
                </div>
                <Skeleton width="200px" height="48px" className="rounded-full" />
            </div>
            {/* Shouting man placeholder */}
            <div className="absolute right-0 bottom-0 md:-bottom-8 top-0 w-1/3 flex items-end justify-center pointer-events-none opacity-20">
                <SkeletonShimmer width="80%" height="90%" className="rounded-t-full" />
            </div>
        </div>

        {/* Top Exchanges Skeleton */}
        <div className="bg-[#0A1014] rounded-3xl p-6 md:p-8 border border-white/10 mb-8">
            <SkeletonShimmer width="200px" height="24px" className="mb-8" />
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-[#131B1F] border border-white/5 rounded-xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="col-span-3 flex items-center gap-4">
                            <SkeletonCircle size="32px" />
                            <Skeleton width="100px" height="20px" />
                        </div>
                        <div className="col-span-3 hidden md:block">
                            <Skeleton width="150px" height="14px" />
                        </div>
                        <div className="col-span-2 hidden md:block">
                            <Skeleton width="50px" height="14px" />
                        </div>
                        <div className="col-span-4 flex justify-center md:justify-end gap-4">
                            <Skeleton width="120px" height="40px" className="rounded-full" />
                            <Skeleton width="120px" height="40px" className="rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Bots Section Skeleton */}
        <section className="bg-[#0A1014] rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden">
            <SkeletonShimmer width="150px" height="24px" className="mb-6" />
            <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-[#131B1F] rounded-2xl p-6 border border-white/5 h-48">
                        <SkeletonCircle size="48px" className="mb-4" />
                        <Skeleton width="120px" height="20px" className="mb-2" />
                        <Skeleton width="100%" height="32px" />
                    </div>
                ))}
            </div>
        </section>
    </div>
);



// --- COMPONENT: QUICK LAUNCH WIDGET ---
const QuickLaunchWidget = ({ onSelect, className, style, userEmail }) => {
    return (
        <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full flex flex-col ${className || ''}`} style={style}>
            <h3 className="text-white font-medium text-sm mb-2">Quick Launch</h3>
            <p className="text-xs text-gray-500 mb-6 font-medium">Start a pre-configured bot instantly</p>

            <div className="space-y-3">
                {QUICK_LAUNCH.map((bot) => (
                    <div
                        key={bot.id}
                        onClick={() => onSelect(bot)}
                        className="bg-[#1c1e22] border border-white/5 rounded-2xl p-4 flex items-center justify-between group cursor-pointer transition-all w-[100%]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#131517] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                {bot.icon}
                            </div>
                            <div>
                                <h4 className="text-white font-medium text-sm">{bot.name}</h4>
                                <p className="text-[10px] text-gray-500">{bot.desc}</p>
                            </div>
                        </div>
                        <ChevronDown size={16} className="-rotate-90 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 py-3 border border-white/5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:border-[#00FF9D] transition-all flex items-center justify-center gap-2">
                <Grid size={14} /> Advanced Configuration
            </button>


        </div>
    );
};

// Skeleton for QuickLaunchWidget
const QuickLaunchWidgetSkeleton = ({ className, style }) => (
    <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative h-full ${className || ''}`} style={style}>
        <Skeleton width="100px" height="14px" className="mb-6" />
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#1c1e22] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                    <Skeleton circle width="40px" height="40px" />
                    <div className="flex-1">
                        <Skeleton width="120px" height="14px" className="mb-2" />
                        <Skeleton width="100%" height="10px" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- SUBSIDIARY COMPONENT: OPERATION ROW ---
const OperationRow = ({ op, index }) => {
    const isBuy = op.side === 'buy';
    const rowDelay = index * 150;
    const profit = op.profit !== undefined ? op.profit : 0;
    const animatedProfit = useCountUp(profit, 1500, 999999);
    const [isExpanded, setIsExpanded] = useState(false);

    const baseCurrency = (op.pair || '').split('/')[0] || 'UNKNOWN';
    const quoteCurrency = (op.pair || '').split('/')[1] || 'USDT';
    
    const feeValue = (() => {
        if (!op.fee) return "0.00";
        if (op.fee_currency === baseCurrency && op.price > 0) {
            return (op.fee * op.price).toFixed(4);
        }
        return parseFloat(op.fee).toFixed(8).replace(/\.?0+$/, "");
    })();
    
    const feeCurrency = (() => {
        if (!op.fee) return (isBuy ? baseCurrency : quoteCurrency) || 'USDT';
        if (op.fee_currency === baseCurrency) return quoteCurrency;
        return op.fee_currency || (isBuy ? baseCurrency : quoteCurrency);
    })();

    return (
        <>
            <tr
                className="group transition-all cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <td className="py-4 text-[11px] text-gray-400 font-medium whitespace-nowrap align-top md:align-middle">
                    <div className="flex flex-col">
                        <span className="md:hidden text-[10px] text-gray-500 mb-1">Fill time</span>
                        <span className="text-white md:text-gray-400 font-bold md:font-medium text-sm md:text-[11px]">
                            {new Date(op.timestamp).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {/* Mobile Pair & Side display */}
                        <div className="md:hidden flex items-center gap-2 mt-4 mb-1">
                            <span className="text-lg font-bold text-white">{op.pair}</span>
                        </div>
                        <div className="md:hidden flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isBuy ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-red-500/10 text-red-500'}`}>
                                {isBuy ? 'Buy' : 'Sell'}
                            </span>
                            <span className="text-[10px] text-gray-500">
                                {new Date(op.timestamp).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase ${isBuy ? 'text-[#00FF9D]' : 'text-red-500'}`}>{isBuy ? 'BUY' : 'SELL'}</span>
                    </div>
                </td>
                <td className="py-4 hidden md:table-cell">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase">{op.pair}</span>
                    </div>
                </td>
                <td className="py-4 hidden md:table-cell">
                    <span className="text-xs font-bold text-white">${formatTokenPrice(op.price)}</span>
                </td>
                <td className="py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">{parseFloat(op.qty || op.amount || 0).toFixed(6)}</span>
                        <span className="text-[10px] text-gray-500">{op.symbol || baseCurrency}</span>
                    </div>
                </td>
                <td className="py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">{feeValue}</span>
                        <span className="text-[10px] text-gray-500">{feeCurrency}</span>
                    </div>
                </td>
                <td className="py-4 text-right md:text-left align-top md:align-middle">
                    <div className="flex flex-col items-end md:items-start">
                        <span className="md:hidden text-[10px] text-gray-500 mb-1">Grid profit({quoteCurrency})</span>
                        <div className="flex items-center gap-1">
                            <span className={`text-sm md:text-xs font-bold ${profit > 0 ? 'text-[#00FF9D]' : 'text-gray-500'}`}>
                                {profit > 0 ? `+${profit.toFixed(4)}` : '-'}
                            </span>
                            <ChevronDown size={16} className={`md:hidden text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                </td>
                <td className="py-2 text-center hidden md:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${op.status === 'COMPLETED' ? 'bg-[#00FF9D]/10 border-[#00FF9D]/20 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                        {op.status || 'COMPLETE'}
                    </span>
                </td>
            </tr>
            {/* Expanded Mobile Details */}
            {isExpanded && (
                <tr className="md:hidden border-b border-white/5">
                    <td colSpan="8" className="px-4 pb-6 pt-2">
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-[11px] text-gray-500 mb-1">Order price ({quoteCurrency})</p>
                                <p className="text-sm font-bold text-white">{formatTokenPrice(op.price)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 mb-1">Order amount ({baseCurrency})</p>
                                <p className="text-sm font-bold text-white">{parseFloat(op.qty || op.amount || 0).toFixed(6)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 mb-1">Fee ({feeCurrency})</p>
                                <p className="text-sm font-bold text-white">-{feeValue}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 mb-1">Fee rebate ({quoteCurrency})</p>
                                <p className="text-sm font-bold text-white">0</p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// --- COMPONENT: LATEST OPERATIONS TABLE ---
const LatestOperations = ({ operations, onNavigate, className, style }) => {
    return (
        <div
            className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative overflow-hidden ${className || ''}`}
            style={style}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium text-sm">Latest Operations</h3>
                <button onClick={onNavigate} className="text-xs text-gray-500 font-bold hover:text-white transition-colors flex items-center gap-1">
                </button>
            </div>

            <div className={`overflow-x-auto custom-scrollbar no-scrollbar`}>
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] text-gray-600 font-medium uppercase tracking-wider border-b border-white/5">
                            <th className="pb-4 font-medium w-auto md:w-[12%]">Time</th>
                            <th className="pb-4 font-medium w-[8%] hidden md:table-cell">Side</th>
                            <th className="pb-4 font-medium w-[12%] hidden md:table-cell">Pair</th>
                            <th className="pb-4 font-medium w-[14%] hidden md:table-cell">Price</th>
                            <th className="pb-4 font-medium w-[16%] hidden md:table-cell">Amount</th>
                            <th className="pb-4 font-medium w-[14%] hidden md:table-cell">Fee</th>
                            <th className="pb-4 font-medium text-right md:text-left w-auto md:w-[14%]">Grid Profit</th>
                            <th className="pb-4 font-medium text-center w-[10%] hidden md:table-cell">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {operations.length > 0 ? operations.map((op, i) => (
                            <OperationRow key={i} op={op} index={i} />
                        )) : (
                            <tr><td colSpan="8" className="py-10 text-center text-xs text-gray-500 italic">No recent operations found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Skeleton for LatestOperations
const LatestOperationsSkeleton = ({ className, style }) => (
    <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 relative overflow-hidden ${className || ''}`} style={style}>
        <div className="flex justify-between items-center mb-6">
            <Skeleton width="140px" height="14px" />
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] text-gray-600 font-medium uppercase tracking-wider border-b border-white/5">
                        <th className="pb-4"><Skeleton width="40px" height="10px" /></th>
                        <th className="pb-4"><Skeleton width="30px" height="10px" /></th>
                        <th className="pb-4"><Skeleton width="50px" height="10px" /></th>
                        <th className="pb-4"><Skeleton width="40px" height="10px" /></th>
                        <th className="pb-4"><Skeleton width="60px" height="10px" /></th>
                        <th className="pb-4"><Skeleton width="40px" height="10px" /></th>
                        <th className="pb-4"><Skeleton width="70px" height="10px" /></th>
                        <th className="pb-4"><Skeleton width="50px" height="10px" /></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i}>
                            <td className="py-4"><Skeleton width="60px" height="12px" /></td>
                            <td className="py-4"><Skeleton width="40px" height="16px" className="rounded" /></td>
                            <td className="py-4"><Skeleton width="80px" height="12px" /></td>
                            <td className="py-4"><Skeleton width="70px" height="12px" /></td>
                            <td className="py-4"><Skeleton width="90px" height="12px" /></td>
                            <td className="py-4"><Skeleton width="60px" height="12px" /></td>
                            <td className="py-4"><Skeleton width="50px" height="12px" /></td>
                            <td className="py-4"><Skeleton width="80px" height="16px" className="rounded" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// --- COMPONENT: LIVE TICKER REMOVED (Moved to Global Layout) ---

// ... (Existing StatCard, BotCard etc) ...

// ... (Keep ConnectApiOverlay, Sparkline, PerformanceChart, StatCard, BotCard as previously defined) ...
const ConnectApiOverlay = ({ onConnect, title = "Connect", isConnected }) => {
    if (isConnected) return null;
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#131517] transition-all rounded-3xl border border-white/5">
            <div className="text-center animate-in fade-in zoom-in duration-300">
                <button onClick={(e) => { e.stopPropagation(); onConnect(); }} className="bg-[#00FF9D] hover:bg-[#00cc7d] text-black font-bold py-3 px-8 rounded-full text-sm transition-all flex items-center gap-2 mx-auto scale-105 hover:scale-110 active:scale-100">
                    <Plus size={16} strokeWidth={3} /> {title}
                </button>
            </div>
        </div>
    );
};

const isInvalidBot = (type) => { if (!type) return true; const t = type.toString().toUpperCase().trim(); return t === 'SKIPPED'; };

const Sparkline = ({ color, isConnected }) => (
    <div className="relative h-12 w-full overflow-hidden opacity-80 mt-2">
        {isConnected && (<><div className="absolute right-0 top-[40%] w-2 h-2 rounded-full z-10 animate-pulse" style={{ backgroundColor: color }}></div><svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none"><defs><linearGradient id={`sparkGradient-${color}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs><path d="M0,30 L10,20 L20,35 L30,15 L40,25 L50,10 L60,30 L70,20 L80,5 L90,25 L100,20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M0,30 L10,20 L20,35 L30,15 L40,25 L50,10 L60,30 L70,20 L80,5 L90,25 L100,20 V40 H0 Z" fill={`url(#sparkGradient-${color})`} stroke="none" /></svg></>)}
    </div>
);

const PerformanceChart = ({ isConnected, themeColor, data = [] }) => {
    // 1. Handle Empty/Loading Data
    if (!isConnected || !data || data.length === 0) {
        return (
            <div className="w-full h-72 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                <p className="text-gray-600 text-xs">Waiting for data...</p>
            </div>
        );
    }

    // 2. Prepare Data Points for SVG
    const width = 800;
    const height = 300;
    const padding = 20;

    // Find range
    const values = data.map(d => d.value);
    const minVal = Math.min(...values) * 0.95; // 5% buffer
    const maxVal = Math.max(...values) * 1.05;
    const range = maxVal - minVal || 1; // Avoid divide by zero

    // Map data to coordinates
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - minVal) / range) * height;
        return `${x},${y}`;
    });

    const linePath = `M ${points.join(' L ')}`;
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    // Generate Y-Axis Labels (5 ticks)
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => {
        const val = minVal + (t * range);
        return { y: height - (t * height), label: val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0) };
    });

    // Generate X-Axis Labels (Every 5th point)
    const xTicks = data.filter((_, i) => i % 5 === 0).map((d, i) => ({
        x: (data.indexOf(d) / (data.length - 1)) * width,
        label: d.date
    }));

    return (
        <div className="w-full h-72 relative flex flex-col">
            <div className="flex-1 relative flex">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between text-[10px] text-gray-500 font-medium h-full pr-4 w-12 text-right absolute -left-2 top-0 bottom-0 py-2">
                    {yTicks.reverse().map((t, i) => (
                        <span key={i} style={{ position: 'absolute', top: t.y - 10, right: 0 }}>{t.label}</span>
                    ))}
                </div>

                {/* Chart Area */}
                <div className="flex-1 relative border-l border-white/5 ml-12 overflow-hidden">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                        <div key={i} className="absolute w-full border-t border-white/5" style={{ top: `${t * 100}%` }}></div>
                    ))}

                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute inset-0" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="mainChartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor={themeColor} stopOpacity="0.1" />
                                <stop offset="100%" stopColor={themeColor} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={areaPath} fill="url(#mainChartGradient)" stroke="none" />
                        <path d={linePath} fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] text-gray-500 mt-2 pl-12 pt-2 border-t border-white/5">
                {xTicks.map((t, i) => (
                    <span key={i}>{t.label}</span>
                ))}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, percentage, icon, isConnected, onConnect, themeColor }) => (
    <div className={`bg-[#131517] rounded-3xl p-6 border border-[#00FF9D]/30 relative overflow-hidden group transition-all duration-300 h-32 flex flex-col justify-between hover:border-[${themeColor}]/50`}>
        {!isConnected && <ConnectApiOverlay onConnect={onConnect} title="Connect API" isConnected={isConnected} />}

        <div className={`${!isConnected ? 'filter blur-[3px] opacity-30 pointer-events-none select-none' : ''} transition-all h-full flex flex-col justify-center`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-[#131B1F] flex items-center justify-center text-white border border-white/5`}>
                        {icon}
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                </div>
                {isConnected && <ChevronUp size={16} color={themeColor} />}
            </div>

            <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded bg-[#131B1F] ${isConnected ? '' : 'text-gray-600'}`} style={isConnected ? { color: themeColor } : {}}>
                    {percentage}
                </span>
            </div>
        </div>
    </div>
);

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

const BotCard = ({ bot, isConnected, onConnect, themeColor, onClick, className, style, chartDelay = 0, onToggle, onDelete }) => {
    const isPlaceholder = isInvalidBot(bot.bot_type);
    let config = {}; if (typeof bot.config === 'string') { try { config = JSON.parse(bot.config); } catch (e) { } } else { config = bot.config || {}; }
    const mode = config.mode || 'live';
    const isPaper = mode === 'paper';
    const profit = parseFloat(bot.total_profit || 0);
    const profitCoin = parseFloat(bot.total_profit_coin || 0);
    const isPositive = profit >= 0 || profitCoin > 0;
    const profitMode = config.strategy?.profit_mode || config.profitMode || config.profit_mode || 'USDT_ONLY';

    // Animation Hook for Profit
    const animatedProfit = useCountUp(profit, 2000, chartDelay);

    // Menu State
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Formatting
    let displayProfit = isPlaceholder ? '$0.00' : "----";
    const estimatedPrice = bot.current_price || (config.strategy?.upper_price && config.strategy?.lower_price ? (config.strategy.upper_price + config.strategy.lower_price) / 2 : 0);
    const profitCoinValue = profitCoin * estimatedPrice;

    if (isConnected && !isPlaceholder) {
        if (profitMode === 'COIN_ONLY' || (profitCoin > 0 && profit === 0 && profitMode !== 'HYBRID')) {
            displayProfit = `${profitCoin >= 0 ? '+' : ''}${profitCoin.toFixed(4)} ${bot.coin_symbol || config.pair?.split('/')[0] || ''}`;
        } else if (profitMode === 'HYBRID' || (profitCoin > 0 && profit > 0)) {
            // Show both, or just keep fiat as primary and coin as secondary in the component rendering
            displayProfit = "HYBRID_DISPLAY"; // Special flag
        } else {
            displayProfit = `${animatedProfit >= 0 ? '+' : '-'}$${Math.abs(animatedProfit).toFixed(2)}`;
        }
    }

    const pair = config.pair || bot.pair || 'UNKNOWN/USD';
    const baseSymbol = pair.split('/')[0].toLowerCase();
    const iconPath = `/icons/${baseSymbol}.png`;

    const handleClick = (e) => {
        if (!isConnected && !isPlaceholder) { e.stopPropagation(); onConnect(); return; }
        if (isPlaceholder) return;
        if (onClick) onClick(bot);
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleAction = (e, action) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        if (action === 'toggle' && onToggle) onToggle(bot);
        if (action === 'delete' && onDelete) onDelete(bot);
    };

    const isRunning = ['active', 'running', 'RUNNING'].includes(bot.status);
    const botType = (bot.bot_type || '').toUpperCase();
    const isGrid = botType.includes('GRID');
    const isDca = botType.includes('DCA');

    return (
        <div
            onClick={handleClick}
            className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-[#131B1F] p-4 rounded-xl border border-white/5 hover:border-[#00FF9D]/30 transition group cursor-pointer relative overflow-hidden ${className || ''}`}
            style={style}
        >
            {!isConnected && !isPlaceholder && <ConnectApiOverlay onConnect={onConnect} title="Connect" isConnected={isConnected} />}

            {/* Left: Icon & Info */}
            <div className={`flex items-center gap-4 w-full md:w-1/4 mb-4 md:mb-0 ${!isConnected && !isPlaceholder ? 'blur-sm opacity-50' : ''}`}>
                <div className="w-10 h-10 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-white/5 shrink-0 relative">
                    <img
                        src={iconPath}
                        alt={baseSymbol}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/icons/btc.png'; }}
                    />
                    <ExchangeBadge exchange={bot.exchange_name} className="md:-bottom-1 md:-right-1" />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">{bot.bot_name || `${pair} Grid`}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#00FF9D] shadow-[0_0_5px_lime]' : 'bg-yellow-500'}`}></div>
                        <span className={`text-[10px] font-mono ${isRunning ? 'text-gray-400' : 'text-yellow-500'}`}>
                            {isRunning ? 'Running' : (bot.status || 'Stopped')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle: Sparkline */}
            <div className={`hidden md:block flex-[0.4] h-12 px-8 ${!isConnected && !isPlaceholder ? 'blur-sm opacity-50' : ''}`}>
                <BotSparkline color={isPositive ? themeColor : "#EF4444"} data={bot.sparkline || []} delay={chartDelay} />
            </div>

            {/* Right Section: Values & Actions */}
            <div className={`flex items-center justify-between gap-1 md:gap-4 shrink-0 w-full md:w-auto mt-2 md:mt-0 ${!isConnected && !isPlaceholder ? 'blur-sm opacity-50' : ''}`}>
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
                            <p className={`text-sm font-bold ${animatedProfit >= 0 ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                                {animatedProfit >= 0 ? '+' : '-'}${Math.abs(animatedProfit).toFixed(2)}
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
                            if (onClick) onClick(bot);
                        }}
                        className="p-2 rounded-xl text-gray-500 hover:text-[#00FF9D] hover:bg-[#00FF9D]/10 transition-all duration-300"
                        title="Bot Settings"
                    >
                        <Settings2 size={18} />
                    </button>
                    <button
                        onClick={(e) => handleAction(e, 'toggle')}
                        className={`p-2 rounded-xl transition-all duration-300 ${isRunning ? 'text-red-400 hover:bg-red-500/10' : 'text-[#00FF9D] hover:bg-[#00FF9D]/10'}`}
                        title={isRunning ? "Stop Bot" : "Start Bot"}
                    >
                        {isRunning ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button
                        onClick={(e) => handleAction(e, 'delete')}
                        className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                        title="Delete Bot"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Skeleton for BotCard
const BotCardSkeleton = ({ className, style }) => (
    <div className={`flex flex-col md:flex-row justify-between items-center bg-[#131B1F] p-4 rounded-xl border border-white/5 relative overflow-hidden ${className || ''}`} style={style}>
        {/* Left */}
        <div className="flex items-center gap-4 w-full md:w-1/4 mb-4 md:mb-0">
            <Skeleton circle width="40px" height="40px" />
            <div>
                <Skeleton width="100px" height="14px" className="mb-1" />
                <Skeleton width="60px" height="10px" />
            </div>
        </div>

        {/* Middle */}
        <div className="hidden md:block flex-[0.4] h-12 px-8">
            <SkeletonShimmer height="100%" />
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 shrink-0">
            <div className="text-right flex flex-col items-end w-28">
                <Skeleton width="50px" height="8px" className="mb-1" />
                <Skeleton width="60px" height="14px" />
            </div>
            <div className="text-right flex flex-col items-end w-28">
                <Skeleton width="50px" height="8px" className="mb-1" />
                <Skeleton width="60px" height="14px" />
            </div>
            <div className="flex gap-2 ml-4">
                <Skeleton width="34px" height="34px" className="rounded-xl" />
                <Skeleton width="34px" height="34px" className="rounded-xl" />
                <Skeleton width="34px" height="34px" className="rounded-xl" />
            </div>
        </div>
    </div>
);


// --- MAIN DASHBOARD COMPONENT ---

const Dashboard = () => {
    const navigate = useNavigate();
    const { isPaperTrading } = useTrading();

    const [loading, setLoading] = useState(true);
    const [hasExchange, setHasExchange] = useState(() => {
        return localStorage.getItem('hasExchange') === 'true';
    });
    const [bypassConnect, setBypassConnect] = useState(false);
    const [user, setUser] = useState({ name: "Trader", plan: "Pro Plan Active" });
    const [isNavOpen, setIsNavOpen] = useState(false);

    // Modals
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [selectedBotType, setSelectedBotType] = useState('SPOT GRID');
    const [connectModalTestnetDefault, setConnectModalTestnetDefault] = useState(false);
    const [selectedExchange, setSelectedExchange] = useState(EXCHANGES[0]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
    const [profitTimeframe, setProfitTimeframe] = useState('24H');
    const profitTimeframeRef = useRef(profitTimeframe);

    useEffect(() => {
        profitTimeframeRef.current = profitTimeframe;
    }, [profitTimeframe]);

    // Data State
    const [statsData, setStatsData] = useState({
        daily: { value: "$0.00", percentage: "0.00%", current: 0, target: 500 },
        monthly: { value: "$0.00", percentage: "0.00%" },
        assets: { value: "$0.00", percentage: "0.00%", available: 0, locked: 0 }
    });
    const [activeBots, setActiveBots] = useState([]);
    const [botCounts, setBotCounts] = useState({ dca: 0, grid: 0, totalFunds: 0 });
    const [chartData, setChartData] = useState([]);
    const [recentOperations, setRecentOperations] = useState([]);
    const [activeBotTab, setActiveBotTab] = useState('All Bots');
    // Global Search & Filter from Context
    const { searchQuery, exchangeFilter, setExchangeFilter, connectedExchanges } = useTrading();




    // Derived: Get unique exchanges from active bots AND connected exchanges
    const uniqueExchanges = new Set([
        ...connectedExchanges.map(e => e.exchange_name ? e.exchange_name.toUpperCase().replace('_PAPER', '') : ''),
        ...activeBots.map(b => b.exchange_name ? b.exchange_name.toUpperCase().replace('_PAPER', '') : 'UNKNOWN')
    ].filter(Boolean));
    const availableFilters = ['ALL', ...Array.from(uniqueExchanges)];


    // Persist filter


    const fetchData = async (background = false) => {
        const token = getToken();
        if (!token) return;

        if (!background) setLoading(true);

        // Enforce minimum load time for initial load (2.5s) to ensure smooth animation start
        const minDelayPromise = !background ? new Promise(resolve => setTimeout(resolve, 2500)) : Promise.resolve();

        try {
            // 1. Fetch User Info
            const userRes = await fetch(`${API_BASE_URL}/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let userDataObj = null;
            if (userRes.ok) {
                userDataObj = await userRes.json();
                setUser(userDataObj);

                const isPaper = isPaperTrading;
                const isConnected = isPaper ? userDataObj.hasPaperExchange : userDataObj.hasLiveExchange;
                setHasExchange(isConnected);
                localStorage.setItem('hasExchange', isConnected);
            }

            if (userRes.ok) {
                const queryMode = isPaperTrading ? 'paper' : 'live';

                // 2. Fetch Dashboard Stats
                await fetchDashboardStats(token, queryMode);

                // 3. Fetch Bots & Aggregate Operations
                // END OF Fetch Dashboard Stats

                // 3. Fetch Bots & Aggregate Operations
                const botsRes = await fetch(`${API_BASE_URL}/user/bots?mode=${queryMode}&exchange=${encodeURIComponent(exchangeFilter)}&_t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
                });

                if (botsRes.ok) {
                    const botsData = await botsRes.json();
                    const realBots = botsData.filter(b => b.bot_type !== 'SKIPPED' && b.bot_name !== 'Imported Strategy');
                    setActiveBots(realBots);

                    // [FIX] Force connection state if valid bots exist in paper mode
                    if (isPaperTrading && realBots.length > 0) {
                        setHasExchange(true);
                    }
                    let dca = 0, grid = 0, funds = 0;
                    let allTrades = [];

                    realBots.forEach(bot => {
                        const type = (bot.bot_type || '').toUpperCase();
                        if (type.includes('DCA')) dca++;
                        else if (type.includes('GRID')) grid++;

                        const config = typeof bot.config === 'string' ? JSON.parse(bot.config || '{ }') : bot.config;
                        funds += parseFloat(config.investment || bot.invested_capital || 0);

                        if (bot.recent_trades) {
                            allTrades.push(...bot.recent_trades.map(t => ({
                                ...t,
                                bot_name: bot.bot_id || bot.id,
                                bot_type: type.includes('GRID') ? 'Grid' : 'DCA',
                                pair: config.pair || bot.pair || 'UNKNOWN/USDT'
                            })));
                        }
                    });

                    setBotCounts({ dca, grid, totalFunds: funds });
                    setRecentOperations(allTrades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10));
                }
            }

        } catch (err) {
            console.error(err);
        } finally {
            if (!background) {
                // Wait for the minimum delay to ensure the loading screen stays long enough
                await minDelayPromise;
                setLoading(false);
            }
        }
    };

    const fetchDashboardStats = async (tokenOverride = null, queryModeOverride = null) => {
        const token = tokenOverride || getToken();
        if (!token) return;
        const queryMode = queryModeOverride || (isPaperTrading ? 'paper' : 'live');

        try {
            const currentProfitTimeframe = profitTimeframeRef.current || '24H';
            const dashRes = await fetch(`${API_BASE_URL}/user/dashboard?mode=${queryMode}&timeframe=${currentProfitTimeframe.toLowerCase()}&exchange=${encodeURIComponent(exchangeFilter)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let dailyRes = null;
            if (currentProfitTimeframe === '24H') {
                dailyRes = await fetch(`${API_BASE_URL}/user/daily-stats?mode=${queryMode}&exchange=${encodeURIComponent(exchangeFilter)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            if (dashRes.ok) {
                const dashData = await dashRes.json();
                let dailyValue = dashData.stats[0]?.value || '$0.00';
                let dailyPercentage = dashData.stats[0]?.percentage || '0.00%';

                if (dailyRes && dailyRes.ok) {
                    const dailyData = await dailyRes.json();
                    let foundProfit = null;
                    const candidates = [
                        dailyData?.todayProfit, dailyData?.todayProfitFormatted,
                        dailyData?.data?.todayProfit, dailyData?.data?.totalProfit, dailyData?.totalProfit
                    ];
                    for (const val of candidates) {
                        if (val !== undefined && val !== null) { foundProfit = val; break; }
                    }

                    if (foundProfit !== null) {
                        const profitNum = typeof foundProfit === 'string' ? parseFloat(foundProfit.replace(/[^0-9.-]+/g, "")) : foundProfit;
                        dailyValue = `$${profitNum.toFixed(2)}`;
                        dailyPercentage = dailyData?.todayYield ? `${dailyData.todayYield}%` : "0%";
                    }
                }

                setStatsData({
                    daily: {
                        value: dailyValue,
                        percentage: dailyPercentage,
                        current: parseFloat(dailyValue.replace(/[^0-9.-]+/g, "") || 0),
                        target: 200
                    },
                    monthly: { value: dashData.stats[1].value, percentage: dashData.stats[1].percentage },
                    assets: {
                        value: dashData.stats[2].value,
                        percentage: dashData.stats[2].percentage,
                        available: dashData.balances?.available || 0,
                        locked: dashData.balances?.locked || 0
                    }
                });
                setChartData(dashData.chartData || []);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(() => fetchData(true), 15000);
        return () => clearInterval(intervalId);
    }, [isPaperTrading, exchangeFilter]);

    useEffect(() => {
        fetchDashboardStats();
    }, [profitTimeframe]);


    const handleBotSelect = (botType) => {
        if (botType && botType.toUpperCase().includes('GRID')) {
            navigate('/dashboard/deploy');
            setIsCreateModalOpen(false);
        } else {
            setSelectedBotType(botType);
            setIsCreateModalOpen(false);
            setIsConfigModalOpen(true);
        }
    };

    const filteredBots = activeBots.filter(bot => {
        const query = searchQuery.toLowerCase();
        const nameMatch = (bot.pair || '').toLowerCase().includes(query) || (bot.bot_type || '').toLowerCase().includes(query) || (bot.id || '').toLowerCase().includes(query);

        if (exchangeFilter === 'ALL') return nameMatch;
        const exName = bot.exchange_name ? bot.exchange_name.toUpperCase().replace('_PAPER', '') : 'UNKNOWN';
        return exName === exchangeFilter && nameMatch;
    });

    const validBots = filteredBots.filter(bot => {
        if (isInvalidBot(bot.bot_type)) return false;
        if (activeBotTab === 'Grid Strategy') return (bot.bot_type || '').toUpperCase().includes('GRID');
        return true;
    });

    const headerFilter = availableFilters.length > 1 && (
        <ExchangeFilter
            isLoading={loading}
            options={availableFilters}
            selected={exchangeFilter}
            onSelect={setExchangeFilter}
        />
    );


    const handleToggleBot = async (bot) => {
        if (!bot) return;
        const token = getToken();
        // Optimistic UI update could be done here, but for safety we'll just trigger refresh
        try {
            const res = await fetch(`${API_BASE_URL}/user/bot/${bot.bot_id || bot.id}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Background refresh to update status
                fetchData(true);
            } else {
                alert("Failed to toggle bot status");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteBot = async (bot) => {
        if (!window.confirm("Are you sure you want to delete this bot?")) return;
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/user/bot/${bot.bot_id || bot.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData(true);
            } else {
                alert("Failed to delete bot");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <DashboardLayout isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} headerSlot={headerFilter} isLoading={loading}>
            {/* --- TOP HEADER / GREETING REMOVED --- */}

            {loading ? (
                hasExchange ? (
                    <div className="pb-24 space-y-8">
                        <div className="hidden md:flex items-center gap-2 mb-6 px-2 md:px-0">
                            <SkeletonShimmer width="64px" height="20px" className="rounded" />
                            <span className="text-gray-600 text-lg font-medium">{'>'}</span>
                            <SkeletonShimmer width="96px" height="20px" className="rounded" />
                        </div>

                        {/* --- ROW 1: TOP WIDGETS --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <DailyProfitWidgetSkeleton />
                            <TotalBalanceWidgetSkeleton />
                            <ActiveBotsWidgetSkeleton />
                        </div>

                        {/* --- ROW 2: BOTS --- */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Active Bots Skeleton */}
                            <section className="bg-[#131517] rounded-3xl p-6 border border-white/5 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col gap-4">
                                        <Skeleton width="120px" height="24px" className="mb-1" />
                                        <div className="flex items-center gap-4">
                                            <Skeleton width="60px" height="16px" />
                                            <Skeleton width="80px" height="16px" />
                                            <Skeleton width="80px" height="16px" />
                                        </div>
                                    </div>
                                    <Skeleton width="100px" height="36px" className="rounded-xl" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <BotCardSkeleton key={i} />
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* --- ROW 3: LATEST OPERATIONS --- */}
                        <LatestOperationsSkeleton />
                    </div>
                ) : (
                    <DashboardConnectSkeleton />
                )
            ) : (!hasExchange && !bypassConnect) ? (
                /* --- EMPTY STATE / CONNECT PROMPT --- */
                <div className="">
                    {/* Hero Banner */}
                    <div className={`rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden border border-white/10 bg-[#00FF9D]/5`}>
                        <div className="max-w-xl relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Connect an exchange!</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Experience rapid trade execution with a variety of DCA, Signal, GRID Bots, and SmartTrade options.
                                Connect your preferred exchange to start automating your trades today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/exchanges')}
                                    className={`px-8 py-3 rounded-full font-medium text-black transition-all hover:scale-105 active:scale-95 bg-[#00FF9D] hover:opacity-90 shadow-lg whitespace-nowrap`}
                                >
                                    View all exchanges
                                </button>
                                <button
                                    onClick={() => setBypassConnect(true)}
                                    className={`px-8 py-3 rounded-full font-medium text-white transition-all hover:scale-105 active:scale-95 bg-white/10 hover:bg-white/20 border border-white/10 whitespace-nowrap`}
                                >
                                    Go to dashboard
                                </button>
                            </div>
                        </div>

                        {/* Creative Logo Placement */}
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden">
                            {/* Binance - Top Right, Faded */}
                            <img
                                src="/exchanges_org_logo/BINANCE.png"
                                alt="Binance"
                                className="absolute -top-10 -right-10 w-40 h-40 object-contain opacity-5 blur-[1px] rotate-12"
                            />
                            {/* OKX - Bottom Right, Faded */}
                            <img
                                src="/exchanges_org_logo/OKX.png"
                                alt="OKX"
                                className="absolute -bottom-5 -right-5 w-32 h-32 object-contain opacity-5 blur-[1px] -rotate-12 rounded-full"
                            />
                            {/* Bybit - Center Right, Faded */}
                            <img
                                src="/exchanges_org_logo/BYBIT.png"
                                alt="Bybit"
                                className="absolute top-1/2 right-20 -translate-y-1/2 w-28 h-28 object-contain opacity-5 blur-[0.5px] rotate-6"
                            />
                            {/* Coinbase - Floating near text */}
                            <img
                                src="/exchanges_org_logo/COINBASE.png"
                                alt="Coinbase"
                                className="absolute bottom-20 right-48 w-24 h-24 object-contain opacity-5 blur-[0.5px] -rotate-6"
                            />
                        </div>

                    </div>

                    {/* Top Exchanges List */}
                    <div className="bg-[#0A1014] rounded-3xl p-8 mb-8 relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#00FF9D]/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
                        <h3 className="text-xl font-medium text-white mb-6 relative z-10">Top exchanges for your country</h3>

                        <div className="hidden md:grid grid-cols-12 gap-4 text-xs text-gray-500 px-4 pb-2 relative z-10">
                            <div className="col-span-3">Exchange</div>
                            <div className="col-span-3">Order types</div>
                            <div className="col-span-2">Trading Pairs</div>
                            <div className="col-span-2 text-center">Connect Existing account</div>
                            <div className="col-span-2 text-center">Create New account</div>
                        </div>

                        <div className="space-y-2">
                            {EXCHANGES.map((ex) => (
                                <div key={ex.id} className="bg-[#131B1F] border border-white/5 rounded-xl p-4 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center group hover:border-white/10 transition-all">
                                    <div className="md:col-span-3 flex items-center gap-4 w-full">
                                        <div className="w-10 h-10 rounded-full bg-[#1A2023] border border-white/5 flex items-center justify-center shrink-0 p-1.5 shadow-sm overflow-hidden">
                                            <img src={ex.logo} alt={ex.name} className="w-full h-full object-contain" />
                                        </div>
                                        <span className="font-bold text-white text-lg">{ex.name}</span>
                                    </div>
                                    <div className="md:col-span-3 text-gray-400 text-sm">Spot | Future | Margin</div>
                                    <div className="md:col-span-2 text-white font-mono text-sm hidden md:block">3052</div>

                                    {/* Action Buttons */}
                                    <div className="w-full md:col-span-4 flex flex-row gap-2 mt-2 md:mt-0">
                                        <button
                                            onClick={() => { setSelectedExchange(ex); setConnectModalTestnetDefault(isPaperTrading); setIsConnectModalOpen(true); }}
                                            className="flex-1 md:w-36 py-2.5 md:py-2 border border-white text-white text-sm font-bold rounded-xl md:rounded-full hover:bg-white/10 transition flex items-center justify-center gap-2"
                                        >
                                            <LinkIcon size={16} />
                                            Connect
                                        </button>
                                        <button className={`flex-1 md:w-36 py-2.5 md:py-2 text-black text-sm font-bold rounded-xl md:rounded-full transition flex items-center justify-center gap-1 bg-[#00FF9D] hover:opacity-90`}>
                                            <Plus size={16} />
                                            Create
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-center">
                            <button onClick={() => navigate('/my-exchanges')} className="text-gray-500 hover:text-white text-sm transition-colors">Show More</button>
                        </div>
                    </div>

                    {/* Bots Section (Still Visible below) */}
                    <section className={`bg-[#0A1014] rounded-3xl p-6 md:p-8 border border-white/5 relative transition-colors overflow-hidden`}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FF9D]/5 rounded-full blur-[120px] pointer-events-none"></div>
                        <h2 className="text-lg font-bold text-white mb-6 relative z-10">Bots for you</h2>
                        <div className="grid md:grid-cols-3 gap-6 relative z-10">
                            {/* Grid Bot - Active */}
                            <div className={`bg-[#131B1F] rounded-2xl p-6 border border-white/5 hover:border-[#00FF9D] hover:shadow-[0_0_20px_rgba(0,255,157,0.05)] transition-all cursor-pointer group`} onClick={() => setIsCreateModalOpen(true)}>
                                <div className={`w-12 h-12 bg-[#1A2023] rounded-xl flex items-center justify-center mb-4 text-[#00FF9D] group-hover:scale-110 transition-transform`}>
                                    <Zap size={24} />
                                </div>
                                <h3 className="font-bold text-white mb-1">Grid Bot</h3>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">Capitalize on market volatility by placing buy and sell orders at preset intervals.</p>
                                <span className={`text-xs text-[#00FF9D] font-bold`}>Start Bot &rarr;</span>
                            </div>

                            {/* DCA Bot - Coming Soon */}
                            <div className="bg-[#131B1F] rounded-2xl p-6 border border-white/5 opacity-60 cursor-not-allowed group">
                                <div className="w-12 h-12 bg-[#1A2023] rounded-xl flex items-center justify-center mb-4 text-gray-500">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 className="font-bold text-white mb-1">DCA Bot</h3>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">Dollar Cost Averaging to accumulate assets over time, reducing the impact of volatility.</p>
                                <span className="text-xs text-gray-500 font-bold border border-gray-600 px-2 py-1 rounded">Coming Soon</span>
                            </div>

                            {/* Signal Bot - Coming Soon */}
                            <div className="bg-[#131B1F] rounded-2xl p-6 border border-white/5 opacity-60 cursor-not-allowed group">
                                <div className="w-12 h-12 bg-[#1A2023] rounded-xl flex items-center justify-center mb-4 text-gray-500">
                                    <FileText size={24} />
                                </div>
                                <h3 className="font-bold text-white mb-1">Signal Bot</h3>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">Execute trades automatically based on signals from TradingView or custom webhooks.</p>
                                <span className="text-xs text-gray-500 font-bold border border-gray-600 px-2 py-1 rounded">Coming Soon</span>
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="pb-24 space-y-8">
                    <PageHeader category="General" title="Overview" />

                    {/* --- ROW 1: TOP WIDGETS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <DailyProfitWidget
                            current={statsData.daily.current}
                            percentage={statsData.daily.percentage}
                            chartData={chartData}
                            timeframe={profitTimeframe}
                            setTimeframe={setProfitTimeframe}
                            delay={0}
                        />
                        <TotalBalanceWidget
                            balance={parseFloat(statsData.assets.value.replace(/[^0-9.-]+/g, "") || 0)}
                            change={statsData.daily.current}
                            changePercent={(() => {
                                const total = parseFloat(statsData.assets.value.replace(/[^0-9.-]+/g, "") || 0);
                                const profit = statsData.daily.current;
                                const oldBalance = total - profit;
                                if (oldBalance <= 0) return 0; // Avoid division by zero or negative base
                                return ((profit / oldBalance) * 100).toFixed(2);
                            })()}
                            available={statsData.assets.available}
                            locked={statsData.assets.locked}
                            onRefresh={() => fetchData(true)}
                            delay={0}
                        />
                        <ActiveBotsWidget
                            dcaCount={botCounts.dca}
                            gridCount={botCounts.grid}
                            bots={activeBots}
                            delay={0}
                        />
                    </div>

                    {/* --- ROW 2: BOTS --- */}
                    <div className="grid grid-cols-1 gap-6">
                        <section className="bg-[#131517] rounded-3xl p-6 border border-white/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-white font-medium text-[22px] whitespace-nowrap">Active Bots</h3>
                                </div>
                                <nav className="flex items-center gap-6 overflow-x-auto custom-scrollbar w-full md:w-auto mt-2 md:mt-0">
                                    {['All Bots', 'Grid Strategy'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveBotTab(tab)}
                                            className={`text-sm font-medium transition-colors whitespace-nowrap ${activeBotTab === tab ? 'text-[#00FF9D] pb-1 border-b-2 border-[#00FF9D]' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="flex flex-col gap-4">
                                {loading ? (
                                    // Show skeleton bot cards during loading
                                    [1, 2, 3].map((i) => (
                                        <BotCardSkeleton
                                            key={i}
                                        />
                                    ))
                                ) : validBots.length > 0 ? (
                                    validBots.map((bot, index) => {
                                        // Card delay: 1200 + index*300
                                        // Chart delay: Card Delay + 800ms (card animation duration)
                                        const cardDelay = 1200 + (index * 300);
                                        const chartDelay = cardDelay + 800;

                                        return (
                                            <BotCard
                                                key={bot.bot_id || bot.id || index}
                                                bot={bot}
                                                isConnected={hasExchange}
                                                onConnect={() => { setConnectModalTestnetDefault(isPaperTrading); setIsConnectModalOpen(true); }}
                                                themeColor="#00FF9D"
                                                onClick={(b) => navigate(`/dashboard/bot/${b.bot_id || b.id}`)}
                                                chartDelay={0}
                                                onToggle={handleToggleBot}
                                                onDelete={handleDeleteBot}
                                            />
                                        )
                                    })
                                ) : (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-[#131517] border border-dashed border-white/10 rounded-2xl transition-colors hover:border-white/20">
                                        <Bot size={48} className="text-gray-700 mb-4" />
                                        <p className="text-gray-500 font-bold">No active bots found</p>
                                    </div>
                                )}
                            </div>

                            {/* + New Bot Button previously here was moved to the header */}
                        </section>
                    </div>

                    {/* --- ROW 3: LATEST OPERATIONS --- */}
                    {loading ? (
                        <LatestOperationsSkeleton />
                    ) : (
                        <LatestOperations
                            operations={recentOperations}
                            onNavigate={() => navigate('/history')}
                        />
                    )}


                </div>
            )
            }

            {/* --- GLOBAL COMPONENTS --- */}
            {/* LiveTicker moved to DashboardLayout */}

            <ConnectExchangeModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                onSuccess={() => fetchData(true)}
                defaultIsTestnet={connectModalTestnetDefault}
                selectedExchange={selectedExchange}
                setSelectedExchange={setSelectedExchange}
            />

            <CreateBotModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSelect={handleBotSelect}
            />

            <ConfigureBotModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                botType={selectedBotType}
                onSuccess={fetchData}
            />

            {/* Mobile FAB for Create Bot removed */}
        </DashboardLayout >
    );
};

const DashboardStyles = () => (
    <style>{`
        
        @keyframes skeleton-shimmer {
            0% {
                transform: translateX(-100%);
            }
            100% {
                transform: translateX(100%);
            }
        }
        .skeleton-shimmer {
            background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.05) 50%,
                transparent 100%
            );
            animation: skeleton-shimmer 2s infinite;
        }
    `}</style>
);

const DashboardPage = () => (
    <>
        <DashboardStyles />
        <Dashboard />
    </>
);

export default DashboardPage;
