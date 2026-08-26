import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight,
    Loader2, MoreVertical, Search, Filter, Bitcoin, Activity, PieChart as PieChartIcon, ChevronDown, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import API_BASE_URL from '../../config';
import DashboardLayout from '../../components/DashboardLayout';
import CreateBotModal from './CreateBotModal';
import { useTrading } from '../../context/TradingContext';
import { getToken } from '../../utils/token';
import useCountUp from '../../hooks/useCountUp';
import { PortfolioSkeleton } from './PortfolioSkeleton';
import PageHeader from '../../components/PageHeader';
import ExchangeFilter from '../../components/ExchangeFilter';



// --- CONSTANTS & HELPERS ---
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ffffff'];

// Generate consistent fake history data if API is missing it
const generateFakeHistory = (points = 30, trend = 'up') => {
    let data = [];
    let val = 10000;
    for (let i = 0; i < points; i++) {
        const change = (Math.random() - (trend === 'up' ? 0.4 : 0.6)) * 500;
        val += change;
        const d = new Date();
        d.setDate(d.getDate() - (points - i)); // Fake dates going backwards
        data.push({ timestamp: d.getTime(), name: d.toISOString(), value: Math.max(0, val) });
    }
    return data;
};



const EmptyState = ({ navigate }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-[#152321] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,157,0.1)]">
            <Wallet size={48} className="text-[#00FF9D]" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">No Portfolio Data</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
            Connect an exchange to see your portfolio analytics, net worth, and asset allocation in real-time.
        </p>
        <button
            onClick={() => navigate('/my-exchanges')}
            className="px-8 py-3 bg-[#00FF9D] text-black font-bold rounded-full hover:bg-[#00CC7D] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,255,157,0.4)]"
        >
            Connect Exchange
        </button>
    </div>
);

// --- SMALL COMPONENTS ---
const ExchangeBadge = ({ exchange, className = "" }) => {
    if (!exchange) return null;
    const exName = exchange.toLowerCase().replace('_paper', '');

    // Attempt multiple path variations for robustness
    const paths = [
        `/exchanges_svg/${exName.charAt(0).toUpperCase() + exName.slice(1)}.svg`, // Bybit.svg
        `/exchanges_svg/${exName}.svg`, // binance.svg, okx.svg
        `/exchanges_svg/${exName.charAt(0).toUpperCase() + exName.slice(1).replace('base', 'Base')}.svg`, // CoinBase.svg
        `/exchanges_svg/${exchange.toUpperCase().replace('_PAPER', '')}.svg` // BYBIT.svg (fallback)
    ];

    return (
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#131517] border border-white/10 flex items-center justify-center overflow-hidden p-0.5 shadow-lg z-30 ${className}`}>
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

const Card = ({ children, className = '' }) => (
    <div className={`bg-[#131517] border border-white/5 rounded-3xl p-6 ${className}`}>
        {children}
    </div>
);

const BalanceCard = ({ totalValue, changePercent, assets = [] }) => {
    const animatedTotal = useCountUp(totalValue, 2000);
    const isPositive = changePercent >= 0;

    return (
        <Card className="flex flex-col justify-between relative overflow-hidden h-full min-h-[180px]">
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-2 text-gray-400 font-medium">
                    <Wallet size={16} />
                    <span>Balance</span>
                </div>
            </div>

            <div className="z-10 mt-4">
                <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-2">
                    ${animatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${isPositive ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-red-500/10 text-red-500'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(changePercent).toFixed(2)}%
                    </div>
                    {/* Simulated PnL Value */}
                    <span className="text-gray-500 text-sm font-medium">
                        {isPositive ? '+' : '-'}${Math.abs(totalValue * (changePercent / 100)).toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-between z-10 w-full">
                <span className="text-xs text-gray-500 font-medium tracking-wider">Assets</span>

                {/* Interactive Asset Stack */}
                <div className="relative h-6 flex items-center justify-end group min-w-[100px]">
                    <div className="flex items-center flex-row-reverse">
                        {/* Hidden Count Badge (Fades out on hover) */}
                        {assets.length > 3 && (
                            <div className="relative w-6 h-6 rounded-full bg-[#2A2D31] border border-[#131517] flex items-center justify-center text-[8px] text-white font-bold transition-all duration-300 -ml-2 group-hover:opacity-0 group-hover:scale-0 z-20">
                                +{assets.length - 3}
                            </div>
                        )}

                        {/* Assets List (Slides out on hover) */}
                        <div className="flex items-center flex-row-reverse transition-all duration-500 ease-out">
                            {assets.slice(0, 8).map((a, i) => (
                                <div
                                    key={i}
                                    className={`
                                        w-5 h-5 rounded-full bg-[#1E302D] border border-[#131517] flex items-center justify-center text-[10px] text-gray-400
                                        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                        relative z-10 shrink-0 overflow-hidden
                                        ${i > 0 ? '-ml-2 group-hover:ml-1' : ''}
                                        ${i >= 3 ? 'w-0 opacity-0 border-0 -ml-0 group-hover:w-5 group-hover:opacity-100 group-hover:border group-hover:ml-1' : ''}
                                        group-hover:translate-x-0
                                    `}
                                    style={{
                                        transitionDelay: `${i * 30}ms`,
                                        zIndex: assets.length - i
                                    }}
                                >
                                    <img
                                        src={`https://assets.coincap.io/assets/icons/${a?.symbol?.toLowerCase()}@2x.png`}
                                        alt={a.symbol}
                                        className="w-full h-full object-contain rounded-full opacity-80"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF9D]/5 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        </Card>
    );
};

const AssetCard = ({ asset }) => {
    // Generate fake sparkline if no history (24h style)
    const history = useMemo(() => {
        if (!asset.history || asset.history.length === 0) {
            return generateFakeHistory(24, (asset.change || 0) >= 0 ? 'up' : 'down');
        }
        return asset.history;
    }, [asset]);
    const isPositive = (asset.change || 0) >= 0;

    // Correct Data Mapping:
    const tokenAmount = asset.balance || 0;
    const usdValue = asset.value || 0;

    return (
        <Card className="flex flex-col justify-between h-full min-h-[160px] relative group overflow-hidden">
            {/* Header: Logo + Name */}
            <div className="flex justify-between items-start z-10 mb-2 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 relative">
                        <img
                            src={`https://assets.coincap.io/assets/icons/${asset?.symbol?.toLowerCase()}@2x.png`}
                            alt={asset.symbol}
                            className="w-5 h-5 object-contain rounded-full"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <ExchangeBadge exchange={asset.exchange} />
                    </div>
                </div>
            </div>

            {/* Main: Amount + % */}
            <div className="z-10 mb-4 px-1">
                <div className="flex flex-col gap-1 mb-1">
                    <div className="text-3xl font-medium text-white tracking-tight">
                        {tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {asset.symbol}
                    </div>
                    <div className={`w-fit px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${isPositive ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-red-500/10 text-red-500'}`}>
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(asset.change || 0).toFixed(2)}%
                    </div>
                </div>

                {/* Sub: USD Value */}
                <div className="text-gray-500 font-medium text-xs">
                    ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </div>

            {/* Chart (Line Chart, Always Visible, Bottom) */}
            <div className="h-16 w-full mt-auto z-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id={`grad-${asset.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isPositive ? '#00FF9D' : '#EF4444'} stopOpacity={0.2} />
                                <stop offset="100%" stopColor={isPositive ? '#00FF9D' : '#EF4444'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? '#00FF9D' : '#EF4444'}
                            strokeWidth={2}
                            fill={`url(#grad-${asset.symbol})`}
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const AddActionCard = ({ onClick }) => (
    <>
        {/* Desktop View: Dashed Empty Card */}
        <div
            onClick={onClick}
            className="hidden md:flex h-full min-h-[180px] rounded-3xl border border-dashed border-white/10 bg-transparent flex-col items-center justify-center cursor-pointer transition-all group hover:bg-white/[0.02]"
        >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} className="text-gray-400 group-hover:text-[#00FF9D]" />
            </div>
        </div>

        {/* Mobile View: Floating Action Button (FAB) */}
        <div className="md:hidden fixed bottom-6 right-6 z-[60]">
            <button
                onClick={onClick}
                className="w-14 h-14 rounded-full bg-[#00FF9D] hover:bg-[#00FF9D]/90 flex items-center justify-center text-black shadow-[0_4px_20px_rgba(0,255,157,0.4)] transition-transform active:scale-95"
            >
                <Plus size={32} strokeWidth={3} />
            </button>
        </div>
    </>
);

const PortfolioChart = ({ history, timeRange, setTimeRange }) => {
    // Generate data if empty
    const data = useMemo(() => {
        if (history && history.length > 0) return history;
        // Return flat zero line if no real history data
        return [
            { timestamp: Date.now() - 86400000, name: new Date(Date.now() - 86400000).toISOString(), value: 0 },
            { timestamp: Date.now(), name: new Date().toISOString(), value: 0 }
        ];
    }, [history]);

    return (
        <Card className="col-span-1 lg:col-span-2 min-h-[400px] flex flex-col h-full relative group">
            <div className="flex items-center justify-between mb-2 z-10">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-gray-400" />
                    <h3 className="text-white font-medium">Balance Performance</h3>
                </div>
                {setTimeRange && (
                    <div className="flex items-center gap-2 bg-[#1c1e22] rounded-lg p-1 border border-white/5">
                        {['24H', '7D'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeRange(tf)}
                                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${timeRange === tf ? 'bg-[#00FF9D] text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 w-full -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                        <defs>
                            <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00FF94" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            tickCount={7}
                            tickFormatter={(val) => {
                                try {
                                    const d = new Date(val);
                                    if (!isNaN(d.getTime())) {
                                        if (timeRange === '24H') {
                                            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                        } else {
                                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        }
                                    }
                                } catch (e) { }
                                return val;
                            }}
                            dy={10}
                            minTickGap={15} // Reduced tick gap to allow more labels
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(0)}`}
                            dx={10}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-[#131517] border border-white/10 rounded-xl px-4 py-2 text-white font-medium shadow-xl">
                                            ${parseFloat(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#00FF94"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMain)"
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>


        </Card>
    );
};

// Custom Label for Pie Chart (Icon)
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index, payload }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show icon for segments that are large enough (e.g. > 5%) to avoid crowding
    // But since we slice top 4, it should be fine.

    return (
        <foreignObject x={x - 10} y={y - 10} width={20} height={20}>
            <div
                className="w-5 h-5 rounded-full bg-[#0E0F11] flex items-center justify-center border border-white/10 shadow-lg overflow-hidden transition-all duration-500 ease-out"
                style={{
                    animation: 'fadeInScale 0.5s ease-out forwards',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    transform: 'scale(0)'
                }}
            >
                <style>
                    {`
                        @keyframes fadeInScale {
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                    `}
                </style>
                <img
                    src={`https://assets.coincap.io/assets/icons/${payload.symbol?.toLowerCase()}@2x.png`}
                    alt={payload.symbol}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </div>
        </foreignObject>
    );
};

// Brand Colors for Top Assets
const ASSET_COLORS = {
    BTC: '#F7931A',
    ETH: '#627EEA',
    USDT: '#26A17B',
    BNB: '#F3BA2F',
    SOL: '#9945FF',
    XRP: '#23292F',
    ADA: '#0033AD',
    DOGE: '#C2A633',
    DOT: '#E6007A',
    USDC: '#2775CA',
};

// Full cryptocurrency names mapping
const ASSET_NAMES = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether',
    BNB: 'Binance Coin',
    SOL: 'Solana',
    XRP: 'Ripple',
    ADA: 'Cardano',
    DOGE: 'Dogecoin',
    DOT: 'Polkadot',
    USDC: 'USD Coin',
    MATIC: 'Polygon',
    AVAX: 'Avalanche',
    LINK: 'Chainlink',
    UNI: 'Uniswap',
    ATOM: 'Cosmos',
    LTC: 'Litecoin',
    BCH: 'Bitcoin Cash',
    NEAR: 'NEAR Protocol',
    APT: 'Aptos',
    ARB: 'Arbitrum',
};

const AllocationRing = ({ assets, totalValue }) => {
    // Prepare data: Top 4 for Chart, All for List
    const data = useMemo(() => {
        let source = assets || [];
        source = source.filter(a => (a.value || 0) > 0.01);
        const sorted = [...source].sort((a, b) => (b.value || 0) - (a.value || 0));
        return sorted.map((a, i) => ({
            ...a,
            fill: ASSET_COLORS[a.symbol?.toUpperCase()] || COLORS[i % COLORS.length],
            percent: totalValue > 0 ? ((a.value || 0) / totalValue) * 100 : 0
        }));
    }, [assets, totalValue]);

    const chartData = data.filter(d => d.value > 0).slice(0, 4);
    const isEmpty = chartData.length === 0;

    return (
        <Card className="flex flex-col h-full min-h-[600px] p-6 bg-[#0E0F11] border border-white/5 rounded-3xl relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <PieChartIcon size={18} className="text-gray-400" />
                    <h3 className="text-white font-medium">Assets Allocation</h3>
                </div>
            </div>

            {/* Donut Chart Section */}
            <div className="relative w-full aspect-square max-h-[320px] mx-auto my-4 flex items-center justify-center">
                {isEmpty ? (
                    /* Empty state: gray placeholder ring */
                    <div className="relative w-[232px] h-[232px]">
                        <div className="w-full h-full rounded-full border-[6px] border-white/5" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-gray-500 text-xs font-medium mb-1">Total Balance</span>
                            <span className="text-3xl font-bold text-white tracking-tight">$0</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    {chartData.map((entry, index) => (
                                        <linearGradient id={`gradient-${entry.symbol}`} key={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                                            <stop offset="100%" stopColor={entry.fill} stopOpacity={0.3} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={chartData}
                                    innerRadius={110}
                                    outerRadius={116}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={10}
                                    startAngle={90}
                                    endAngle={-270}
                                    label={renderCustomizedLabel}
                                    labelLine={false}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#gradient-${entry.symbol})`} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0A1014', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                                    formatter={(val) => `$${val.toLocaleString()}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-gray-500 text-xs font-medium mb-1">Total Balance</span>
                            <span className="text-3xl font-bold text-white tracking-tight">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                    </>
                )}
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between mb-4 mt-2">
                <h4 className="text-white text-sm font-medium">All Assets</h4>
            </div>

            {/* Scrollable Asset List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-4 max-h-[100x]">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Wallet size={24} className="text-gray-600 mb-3" />
                        <p className="text-gray-500 text-sm">No assets to display</p>
                    </div>
                ) : data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={`https://assets.coincap.io/assets/icons/${item.symbol?.toLowerCase()}@2x.png`}
                                    alt={item.symbol}
                                    className="w-8 h-8 rounded-full"
                                    onError={(e) => { e.src = 'https://assets.coincap.io/assets/icons/btc@2x.png'; }}
                                />
                                <ExchangeBadge exchange={item.exchange} className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-white font-medium text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                            <span className="text-white font-bold text-sm">
                                ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-gray-500 text-xs font-medium min-w-[40px]">
                                {item.percent.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const AssetsTable = ({ assets }) => {
    const displayAssets = assets && assets.length > 0 ? assets : [];

    return (
        <Card className="col-span-1 md:col-span-1 overflow-hidden p-0 bg-[#0E0F11] border border-white/5 rounded-3xl">
            <div className="p-4 md:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-base md:text-lg whitespace-nowrap">Market Overview</h3>
                </div>
                <div className="flex w-full sm:w-auto mt-1 sm:mt-0">
                    <div className="relative w-full sm:w-[280px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Try 'USDC'"
                            className="bg-[#1A1D21] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs md:text-sm text-white focus:outline-none focus:border-white/20 transition-colors w-full shadow-inner"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full relative">
                    <thead className="sticky top-0 bg-[#0E0F11] z-10">
                        <tr className="text-left text-[10px] text-gray-500 border-b border-white/5 uppercase tracking-wider font-bold">
                            <th className="px-2 py-3 md:px-6 md:py-4 w-1/4 md:w-auto">Token</th>
                            <th className="px-2 py-3 md:px-6 md:py-4 w-1/4 md:w-auto">Price</th>
                            <th className="px-2 py-3 md:px-6 md:py-4 w-1/4 md:w-auto">Balance</th>
                            <th className="px-2 py-3 md:px-6 md:py-4 w-1/4 md:w-auto">Value</th>
                            <th className="px-4 py-3 md:px-6 md:py-4 hidden sm:table-cell">24h Change</th>
                            <th className="px-4 py-3 md:px-6 md:py-4 text-right hidden md:table-cell">Chart</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs md:text-sm">
                        {displayAssets.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    No assets found. Connect an exchange to view your holdings.
                                </td>
                            </tr>
                        ) : displayAssets.map((asset, i) => {
                            const isPositive = (asset.change || 0) >= 0;
                            const fakeHistory = generateFakeHistory(24, isPositive ? 'up' : 'down');
                            // Data Mapping
                            const tokenAmount = asset.balance || 0;
                            const totalValue = asset.value || 0;
                            const price = tokenAmount > 0 ? (totalValue / tokenAmount) : (asset.price || 0);

                            return (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-2 py-3 md:px-6 md:py-4 w-1/4 md:w-auto">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={`https://assets.coincap.io/assets/icons/${asset.symbol?.toLowerCase()}@2x.png`}
                                                    alt={asset.symbol}
                                                    className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 p-0.5 md:p-1"
                                                    onError={(e) => { e.src = 'https://assets.coincap.io/assets/icons/btc@2x.png'; }} // Fallback
                                                />
                                                <ExchangeBadge exchange={asset.exchange} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-white truncate text-xs md:text-sm">
                                                    {asset.symbol}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 md:px-6 md:py-4 text-gray-300 font-medium w-1/4 md:w-auto whitespace-nowrap">
                                        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-2 py-3 md:px-6 md:py-4 text-gray-300 font-medium w-1/4 md:w-auto">
                                        <div className="flex flex-col">
                                            <span>{tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                                            <span className="md:hidden text-[10px] text-gray-500">{asset.symbol}</span>
                                            <span className="hidden md:inline">{asset.symbol}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 md:px-6 md:py-4 text-white font-bold w-1/4 md:w-auto whitespace-nowrap">
                                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 hidden sm:table-cell">
                                        <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 w-fit ${isPositive ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : 'bg-red-500/10 text-red-500'}`}>
                                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {Math.abs(asset.change || 0).toFixed(2)}%
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 h-16 w-32 hidden md:table-cell">
                                        <div className="w-24 h-8 ml-auto">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={asset.history || fakeHistory}>
                                                    <Area
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke={isPositive ? '#00FF9D' : '#EF4444'}
                                                        strokeWidth={2}
                                                        fill="transparent"
                                                        isAnimationActive={false}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


// --- MAIN PAGE ---
const Portfolio = () => {
    const navigate = useNavigate();
    const { isPaperTrading, exchangeFilter, setExchangeFilter, connectedExchanges } = useTrading();


    const [loading, setLoading] = useState(true);
    const [hasExchange, setHasExchange] = useState(false);

    // Data State
    const [portfolioData, setPortfolioData] = useState({
        totalValue: 0, changePercent: 0, assets: [], history: []
    });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [timeframe, setTimeframe] = useState('7D'); // Fetch full 7-day database retention

    // Filter State
    const [activeBots, setActiveBots] = useState([]);


    // Derived: Available Filters







    const fetchData = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            return navigate('/signin');
        }

        try {
            const queryMode = isPaperTrading ? 'paper' : 'live';
            const tfParam = timeframe.toLowerCase();
            const [userRes, portRes, botsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/user/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/user/portfolio?mode=${queryMode}&exchange=${encodeURIComponent(exchangeFilter)}&timeframe=${tfParam}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/user/bots?mode=${queryMode}&exchange=${encodeURIComponent(exchangeFilter)}&_t=${Date.now()}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);


            if (userRes.ok) {
                const userData = await userRes.json();
                const isConnected = isPaperTrading
                    ? (userData.hasPaperExchange ?? userData.user?.hasPaperExchange)
                    : (userData.hasLiveExchange ?? userData.user?.hasLiveExchange);

                setHasExchange(!!isConnected);

                if (botsRes.ok) {
                    const botsData = await botsRes.json();
                    setActiveBots(botsData.filter(b => b.bot_type !== 'SKIPPED'));
                }


                if (portRes.ok) {
                    const pData = await portRes.json();
                    console.log('DEBUG: Portfolio API Response:', pData); // Debug Log

                    if (pData.assets && pData.assets.length > 0) {
                        console.log('DEBUG: First Asset History:', pData.assets[0].symbol, pData.assets[0].history);
                    }

                    // Process history to ensure it's in the right format for Recharts
                    let formattedHistory = pData.history || [];
                    if (formattedHistory.length > 0 && typeof formattedHistory[0] === 'number') {
                        const len = formattedHistory.length;
                        formattedHistory = formattedHistory.map((val, i) => {
                            const t = Date.now() - ((len - i) * 3600 * 1000);
                            return { timestamp: t, name: new Date(t).toISOString(), value: val };
                        });
                    }

                    const processedAssets = (pData.assets || []).map(asset => ({
                        ...asset,
                        // Ensure exchange info is available for the badge
                        exchange: asset.exchange || asset.exchange_name,
                        // Ensure full name is set (fallback to API name if not in mapping)
                        name: ASSET_NAMES[asset.symbol?.toUpperCase()] || asset.name || asset.symbol,
                        // Ensure history is an array of objects with value property
                        history: Array.isArray(asset.history) ? asset.history : []
                    }));

                    setPortfolioData({
                        totalValue: pData.totalValue || 0,
                        changePercent: pData.changePercent || 0,
                        assets: processedAssets,
                        history: formattedHistory
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching portfolio data:", error);
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate, isPaperTrading, exchangeFilter, timeframe]);

    const handleBotSelect = (botType) => {
        setIsCreateModalOpen(false);
        if (botType === 'SPOT GRID' || botType.toLowerCase().includes('grid')) {
            navigate('/dashboard/deploy');
        } else {
            navigate(`/configure-bot?type=${encodeURIComponent(botType)}`);
        }
    };

    // Always use real data from API — no fake/demo data
    const finalAssets = portfolioData.assets.filter(a => (a.value > 0 || a.balance > 0));
    const finalTotal = portfolioData.totalValue;
    const finalChange = portfolioData.changePercent;
    const finalHistory = portfolioData.history;

    // Filter Logic
    // Combine exchanges from API + any mentioned in Active Bots (just in case)
    const uniqueExchanges = new Set([
        ...connectedExchanges.map(e => e.exchange_name ? e.exchange_name.toUpperCase().replace('_PAPER', '') : ''),
        ...activeBots.map(b => b.exchange_name ? b.exchange_name.toUpperCase().replace('_PAPER', '') : '')
    ].filter(Boolean));

    const availableFilters = ['ALL', ...Array.from(uniqueExchanges)];

    return (
        <DashboardLayout
            isLoading={loading}
            headerSlot={
                <ExchangeFilter
                    isLoading={loading}
                    options={availableFilters}
                    selected={exchangeFilter}
                    onSelect={setExchangeFilter}
                />
            }
        >
            <CreateBotModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSelect={handleBotSelect}
            />

            {loading ? (
                <PortfolioSkeleton />
            ) : (
                <div className="pb-24 animate-in fade-in duration-500">






                    <PageHeader category="General" title="My Portfolio" />



                    {/* TOP GRID: Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Balance Card */}
                        <BalanceCard
                            totalValue={finalTotal}
                            changePercent={finalChange}
                            assets={finalAssets}
                        />

                        {/* Asset Cards */}
                        {finalAssets.filter(asset => (asset.value || 0) >= 0.2).slice(0, 3).map((asset, index) => (
                            <AssetCard key={asset.symbol || index} asset={asset} />
                        ))}
                    </div>

                    {finalAssets.filter(asset => (asset.value || 0) >= 0.2).length > 3 && (
                        <div className="flex justify-center mb-6 -mt-2">
                            <button
                                onClick={() => {
                                    document.getElementById('market-overview')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-sm text-gray-400 hover:text-[#00FF9D] transition-colors flex items-center gap-1"
                            >
                                Show more <ChevronDown size={14} />
                            </button>
                        </div>
                    )}

                    {/* MAIN CONTENT GRID: 2 Columns (Main [Chart] vs Sidebar [Allocation]) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[2.1fr_0.9fr] gap-6 mb-6">
                        {/* LEFT COLUMN: Market Chart */}
                        <div className="flex flex-col gap-6">
                            <PortfolioChart history={finalHistory} timeRange={timeframe} setTimeRange={setTimeframe} />
                        </div>

                        {/* RIGHT COLUMN: Allocation */}
                        <div className="flex flex-col">
                            <AllocationRing assets={finalAssets} totalValue={finalTotal} />
                        </div>

                    </div>

                    {/* BOTTOM: Market Overview Table (Full Width) */}
                    <div id="market-overview" className="w-full">
                        <AssetsTable assets={finalAssets} />
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Portfolio;


