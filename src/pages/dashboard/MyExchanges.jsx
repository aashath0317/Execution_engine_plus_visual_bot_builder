import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Bell, ChevronDown, Plus, Link as LinkIcon, Check, ExternalLink, X, Loader2, Trash2
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API_BASE_URL from '../../config';
import { getToken } from '../../utils/token';

// --- DATA: Supported Exchanges ---
import PageHeader from '../../components/PageHeader';
import { useTrading } from '../../context/TradingContext';
import ExchangeFilter from '../../components/ExchangeFilter';
import useAppNotifications from '../../hooks/useAppNotifications';


const SUPPORTED_EXCHANGES = [
    { name: 'Binance', logo: '/exchanges_svg/binance.svg', types: 'Spot | Future | Margin', pairs: '3052' },
    { name: 'OKX', logo: '/exchanges_svg/okx.svg', types: 'Spot | Future', pairs: '3052' },
    { name: 'Bybit', logo: '/exchanges_svg/Bybit.svg', types: 'Spot | Future', pairs: '3052' },
    { name: 'Coinbase', logo: '/exchanges_svg/CoinBase.svg', types: 'Spot', pairs: '500+' },
    { name: 'Kraken', logo: '/exchanges_svg/Kraken.svg', types: 'Spot | Future', pairs: '400+' },
    { name: 'KuCoin', logo: '/exchanges_svg/KuCoin.svg', types: 'Spot | Future', pairs: '700+' },
    { name: 'Bitget', logo: '/exchanges_svg/Bitget.svg', types: 'Spot | Future', pairs: '600+' },
    { name: 'Gate.io', logo: '/exchanges_svg/Gate.svg', types: 'Spot | Future', pairs: '1500+' },
    { name: 'Bitstamp', logo: '/exchanges_svg/Bitstamp.svg', types: 'Spot', pairs: '80+' },
    { name: 'Bitfinex', logo: '/exchanges_svg/Bitfinex.svg', types: 'Spot | Future', pairs: '400+' },
    { name: 'HTX', logo: '/exchanges_svg/HTX.svg', types: 'Spot | Future', pairs: '500+' },
    { name: 'Gemini', logo: '/exchanges_svg/Gemini.svg', types: 'Spot', pairs: '100+' },
];

const MyExchanges = () => {
    // State
    const { connectedExchanges, fetchConnectedExchanges, exchangeFilter, setExchangeFilter } = useTrading();
    const [isLoading, setIsLoading] = useState(true);
    const { notifySecurityEvent, notifyApiDisconnect } = useAppNotifications();

    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [selectedExchange, setSelectedExchange] = useState(null);
    // Initial fetch handled by context, but we can re-fetch on mount just in case
    useEffect(() => {
        const loadExchanges = async () => {
            // If already have exchanges, we can show them immediately while refreshing
            if (connectedExchanges.length > 0) {
                setIsLoading(false);
            }

            await fetchConnectedExchanges();
            setIsLoading(false);
        };

        loadExchanges();
    }, []);



    // Modal State
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);



    // Handle Connect Click
    const handleConnectClick = (ex) => {
        setSelectedExchange(ex);
        setApiKey('');
        setApiSecret('');
        setPassphrase('');
        setIsConnectModalOpen(true);
    };

    // Handle Submit Keys
    const handleSubmitKeys = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const token = getToken();
            const payload = {
                exchange_name: selectedExchange.name,
                api_key: apiKey,
                api_secret: apiSecret,
                passphrase: passphrase
            };

            const res = await fetch(`${API_BASE_URL}/user/exchange`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                alert("Exchange connected successfully!");
                notifySecurityEvent(`New API Key connected successfully for ${selectedExchange.name}`);
                setIsConnectModalOpen(false);
                fetchConnectedExchanges(); // Refresh global list

            } else {
                setError(data.message || "Connection failed. Please check your keys.");
            }
        } catch (error) {
            console.error("Connection error:", error);
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Disconnect
    const handleDisconnect = async (exchangeName) => {
        if (!window.confirm(`Are you sure you want to disconnect ${exchangeName}? This will stop any running bots on this exchange.`)) {
            return;
        }

        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/user/exchange/${exchangeName}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert(`${exchangeName} disconnected successfully.`);
                notifyApiDisconnect(`Urgent: ${exchangeName} API key was disconnected or expired.`);
                fetchConnectedExchanges();
            } else {

                const data = await res.json();
                alert(`Failed to disconnect: ${data.message}`);
            }
        } catch (error) {
            console.error("Disconnect error:", error);
            alert("Network error.");
        }
    };

    const isConnected = (exName) => {
        return connectedExchanges.some(ce => ce.exchange_name.toLowerCase().includes(exName.toLowerCase()));
    };

    // Helper component for the exchange logo/name row
    const ExchangeIdentity = ({ name, logo, isPaper }) => (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A2023] border border-white/5 flex items-center justify-center shrink-0 p-1.5 shadow-sm overflow-hidden">
                <img src={logo} alt={name} className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">{name}</span>
                {isPaper && (
                    <span className="text-[9px] bg-[#00FF9D]/20 text-[#00FF9D] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        PAPER
                    </span>
                )}
            </div>
        </div>
    );

    // ... inside component ...

    // Filter Options
    const filterOptions = ['ALL', ...connectedExchanges.map(e => e.exchange_name.toUpperCase().replace('_PAPER', ''))];

    return (
        <DashboardLayout headerSlot={
            <ExchangeFilter
                options={filterOptions}
                selected={exchangeFilter}
                onSelect={setExchangeFilter}
            />
        }>
            <div className="animate-in fade-in duration-500">
                <PageHeader category="Tools" title="My Exchanges" />

                {isLoading ? (
                    <div className="flex items-center justify-center h-[60vh]">
                        <Loader2 className="animate-spin text-[#00FF9D]" size={48} />
                    </div>
                ) : (
                    <>
                        {/* --- Connected Cards Section --- */}
                        {connectedExchanges.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-xl font-bold text-white mb-6">Connected Exchanges</h2>
                                <div className="flex flex-wrap gap-6">
                                    {connectedExchanges.map((ce, idx) => {
                                        // Find basic info
                                        const rawName = ce.exchange_name;
                                        const isPaper = rawName.toLowerCase().endsWith('_paper');
                                        const realName = isPaper ? rawName.replace(/_paper$/i, '') : rawName;
                                        const displayName = realName.toUpperCase();

                                        const info = SUPPORTED_EXCHANGES.find(se => se.name.toLowerCase() === realName.toLowerCase())
                                            || { name: displayName, logo: '/icons/btc.png', types: 'N/A' }; // Fallback logo

                                        return (
                                            <React.Fragment key={idx}>
                                                {/* Mobile Connected Card */}
                                                <div className="md:hidden bg-[#131517] border border-white/5 rounded-3xl p-6 w-full relative overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <h3 className="text-white font-bold text-lg">Connected</h3>
                                                        <Check size={18} className="text-[#00FF9D]" />
                                                    </div>

                                                    <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-bold">Exchange</p>

                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-[#1A2023] border border-white/5 flex items-center justify-center shrink-0 p-1.5 shadow-sm overflow-hidden">
                                                            <img src={info.logo} alt={realName} className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-bold text-lg">{displayName}</span>
                                                            {isPaper && (
                                                                <span className="text-[9px] bg-[#00FF9D]/20 text-[#00FF9D] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                                    PAPER
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mb-6">
                                                        <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider">Order Types</p>
                                                        <p className="text-white text-sm">{info.types}</p>
                                                    </div>

                                                    <button className="w-full py-3 bg-[#00FF9D] text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FF9D]/10 hover:bg-[#00FF9D]/90 transition-all">
                                                        Connected
                                                    </button>
                                                </div>

                                                {/* Desktop Connected Card */}
                                                <div className="hidden md:block bg-[#131517] border border-white/5 rounded-3xl p-6 w-[320px] relative overflow-hidden group hover:border-[#00FF9D]/30 transition-all">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <ExchangeIdentity name={displayName} logo={info.logo} isPaper={isPaper} />
                                                        <div className="bg-[#00FF9D]/10 p-1.5 rounded-full">
                                                            <LinkIcon size={14} className="text-[#00FF9D]" />
                                                        </div>
                                                    </div>

                                                    <div className="mb-6">
                                                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Status</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse" />
                                                            <span className="text-sm text-white font-medium">Active</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDisconnect(rawName)}
                                                        className="w-full py-2 bg-[#1A2023] text-gray-400 font-bold rounded-xl text-sm border border-white/5 hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Disconnect
                                                    </button>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                        }

                        {/* --- Connect List Section --- */}
                        <div className="md:bg-[#0A1014] md:border md:border-white/10 md:rounded-3xl md:p-8">
                            <div className="mb-6 px-4 md:px-0">
                                <h2 className="text-xl font-bold text-white mb-1">Connect your Exchange</h2>
                                <p className="text-[#808080] text-xs">Connect your all exchange in one place</p>
                            </div>

                            {/* Desktop Table Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 text-xs text-gray-400 px-4 pb-3 font-medium uppercase tracking-wider">
                                <div className="col-span-3">Exchange</div>
                                <div className="col-span-3">Order types</div>
                                <div className="col-span-2">Trading Pairs</div>
                                <div className="col-span-2 text-center">Connect Existing account</div>
                                <div className="col-span-2 text-center">Create New account</div>
                            </div>

                            {/* List */}
                            <div className="space-y-4 md:space-y-2 px-4 md:px-0 pb-20 md:pb-0">
                                {SUPPORTED_EXCHANGES.map((ex, index) => {
                                    const connected = isConnected(ex.name);
                                    return (
                                        <React.Fragment key={index}>
                                            {/* Mobile Card View */}
                                            <div className="md:hidden bg-[#131517] border border-white/5 rounded-3xl p-5 relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#1A2023] flex items-center justify-center p-2 shrink-0 border border-white/5">
                                                            <img src={ex.logo} alt={ex.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-white font-medium text-lg leading-tight">{ex.name}</h3>
                                                            <p className="text-xs text-gray-400 mt-1">{ex.types}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Trading Pairs</p>
                                                        <p className="text-white font-bold text-sm">{ex.pairs}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {connected ? (
                                                        <button
                                                            onClick={() => handleConnectClick(ex)}
                                                            className="w-full py-2.5 bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/20 text-sm font-medium rounded-xl transition-all hover:bg-[#00FF9D]/20 flex items-center justify-center gap-2"
                                                        >
                                                            <Plus size={16} /> Add Another
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleConnectClick(ex)}
                                                            className="w-full py-2.5 bg-transparent border border-white/20 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 hover:border-white/30 transition-all"
                                                        >
                                                            <LinkIcon size={16} />
                                                            Connect
                                                        </button>
                                                    )}

                                                    <button className="w-full py-2.5 bg-[#00FF9D] text-black text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-[#00FF9D]/90 transition-all shadow-lg shadow-[#00FF9D]/10">
                                                        <Plus size={16} />
                                                        Create
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Desktop Row View */}
                                            <div className="hidden md:grid bg-[#131517] border border-white/5 rounded-2xl p-4 grid-cols-12 gap-4 items-center group hover:border-white/10 transition-all">
                                                {/* Exchange Name */}
                                                <div className="col-span-3 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#1A2023] border border-white/5 flex items-center justify-center shrink-0 p-1.5 shadow-sm overflow-hidden">
                                                        <img src={ex.logo} alt={ex.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <span className="font-bold text-white text-lg">{ex.name}</span>
                                                </div>

                                                {/* Order Types */}
                                                <div className="col-span-3 text-sm text-gray-300">
                                                    {ex.types}
                                                </div>

                                                {/* Pairs */}
                                                <div className="col-span-2 text-sm text-white font-mono font-bold">
                                                    {ex.pairs}
                                                </div>

                                                {/* Connect Button */}
                                                <div className="col-span-2 flex justify-center">
                                                    {connected ? (
                                                        <button
                                                            onClick={() => handleConnectClick(ex)}
                                                            className="w-36 py-2 border border-[#00FF9D] text-[#00FF9D] text-sm font-medium rounded-full hover:bg-[#00FF9D]/10 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Plus size={16} />
                                                            Add Another
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleConnectClick(ex)}
                                                            className="w-36 py-2 border border-white text-white text-sm font-medium rounded-full hover:bg-white/10 hover:border-[#00FF9D]/30 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <LinkIcon size={16} />
                                                            Connect
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Create Button */}
                                                <div className="col-span-2 flex justify-center">
                                                    <button className="w-36 py-2 bg-[#00FF9D] text-black text-sm font-medium rounded-full hover:bg-[#00FF9D]/90 hover:scale-105 transition-all flex items-center justify-center gap-1 shadow-lg shadow-[#00FF9D]/10">
                                                        <Plus size={16} />
                                                        Create
                                                    </button>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* --- Connection Modal --- */}
            {
                isConnectModalOpen && selectedExchange && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white font-sans">
                        <div className="bg-[#0A1014] border border-white/10 rounded-2xl w-full max-w-md p-6 relative" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setIsConnectModalOpen(false)}
                                className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 bg-[#1A2023] border border-white/5 rounded-full p-3 mb-4 shadow-lg shadow-[#00FF9D]/20 flex items-center justify-center overflow-hidden">
                                    <img src={selectedExchange.logo} alt={selectedExchange.name} className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-xl font-medium text-white">Connect {selectedExchange.name}</h2>
                                <p className="text-xs text-gray-400 mt-1">Enter your API credentials to connect</p>
                            </div>

                            <form onSubmit={handleSubmitKeys} className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase ml-1">API Key</label>
                                    <input
                                        type="text"
                                        required
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full bg-[#131B1F] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00FF9D] transition-all mt-1"
                                        placeholder="Paste your API Key"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase ml-1">API Secret</label>
                                    <input
                                        type="password"
                                        required
                                        value={apiSecret}
                                        onChange={(e) => setApiSecret(e.target.value)}
                                        className="w-full bg-[#131B1F] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00FF9D] transition-all mt-1"
                                        placeholder="Paste your API Secret"
                                    />
                                </div>
                                {(selectedExchange.name === 'OKX' || selectedExchange.name === 'KuCoin') && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-400 uppercase ml-1">Passphrase</label>
                                        <input
                                            type="password"
                                            required
                                            value={passphrase}
                                            onChange={(e) => setPassphrase(e.target.value)}
                                            className="w-full bg-[#131B1F] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00FF9D] transition-all mt-1"
                                            placeholder="Enter Passphrase"
                                        />
                                    </div>
                                )}

                                <div className="pt-2">
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-2">
                                            <div className="w-1 h-1 rounded-full bg-red-500" />
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#00FF9D] hover:bg-[#00cc7d] text-black font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Connect Exchange'}
                                    </button>
                                </div>

                                <p className="text-[10px] text-gray-500 text-center mt-4">
                                    Your keys are encrypted and stored, 100% Secure.
                                </p>
                            </form>
                        </div>
                    </div>,
                    document.body
                )
            }

        </DashboardLayout >
    );
};

export default MyExchanges;