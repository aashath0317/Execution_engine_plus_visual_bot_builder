import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Info, ChevronLeft, Check, ExternalLink, Copy, ChevronDown, Loader2, Eye, EyeOff } from 'lucide-react';
import API_BASE_URL from '../../config';
import { getToken } from '../../utils/token';

const EXCHANGES = [
    { id: 'binance', name: 'BINANCE', logo: '/exchanges_svg/binance.svg', categories: ['spot', 'margin', 'futures'] },
    { id: 'bybit', name: 'BYBIT', logo: '/exchanges_svg/Bybit.svg', categories: ['spot', 'futures'] },
    { id: 'okx', name: 'OKX', logo: '/exchanges_svg/okx.svg', categories: ['spot', 'futures'] },
    { id: 'kucoin', name: 'KUCOIN', logo: '/exchanges_svg/KuCoin.svg', categories: ['spot'] },
    { id: 'kraken', name: 'KRAKEN', logo: '/exchanges_svg/Kraken.svg', categories: ['spot', 'futures'] },
    { id: 'coinbase', name: 'COINBASE', logo: '/exchanges_svg/CoinBase.svg', categories: ['spot', 'futures'] },
    { id: 'gate', name: 'GATE', logo: '/exchanges_svg/Gate.svg', categories: ['spot', 'futures'] },
    { id: 'bitget', name: 'BITGET', logo: '/exchanges_svg/Bitget.svg', categories: ['futures'] },
    { id: 'gemini', name: 'GEMINI', logo: '/exchanges_svg/Gemini.svg', categories: ['spot'] },
    { id: 'binance_us', name: 'BINANCE.US', subtitle: 'USA', logo: '/exchanges_svg/binance.svg', categories: ['spot'] },
    { id: 'binance_tr', name: 'BINANCE TR', subtitle: 'TURKİYE', logo: '/exchanges_svg/binance.svg', categories: ['spot'] },
];

const ConnectExchangeModal = ({ isOpen, onClose, onSuccess, defaultIsTestnet = false }) => {
    const [activeTab, setActiveTab] = useState('spot');
    const [selectedExchange, setSelectedExchange] = useState(null);
    const [connectMode, setConnectMode] = useState('fast'); // 'fast' or 'api'
    const [importPositions, setImportPositions] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [showPassphrase, setShowPassphrase] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isTestnet, setIsTestnet] = useState(defaultIsTestnet);

    // Update isTestnet when defaultIsTestnet changes
    React.useEffect(() => {
        setIsTestnet(defaultIsTestnet);
    }, [defaultIsTestnet, isOpen]);

    if (!isOpen) return null;

    const handleExchangeSelect = (exchange) => {
        setSelectedExchange(exchange);
        setError(null);
    };

    const handleBack = () => {
        setSelectedExchange(null);
        setApiKey('');
        setApiSecret('');
        setPassphrase('');
        setName('');
        setError(null);
    };

    const handleConnect = async () => {
        if (connectMode === 'api') {
            if (!apiKey || !apiSecret) {
                setError('Please enter both API Key and API Secret.');
                return;
            }
            if (selectedExchange.id === 'okx' && !passphrase) {
                setError('Please enter Passphrase for OKX.');
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const finalExchangeName = isTestnet ? `${selectedExchange.id}_paper` : selectedExchange.id;
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/user/exchange`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    exchange_name: finalExchangeName,
                    api_key: apiKey,
                    api_secret: apiSecret,
                    passphrase: passphrase || undefined,
                    import_positions: importPositions,
                    name: name || undefined,
                })
            });

            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
                // Reset form
                setApiKey('');
                setApiSecret('');
                setPassphrase('');
                setName('');
                setSelectedExchange(null);
            } else {
                const data = await res.json();
                setError(data.message || 'Connection failed. Please check your API keys and try again.');
            }
        } catch (err) {
            console.error('Exchange connect error:', err);
            setError('Error connecting to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredExchanges = EXCHANGES.filter(ex => ex.categories.includes(activeTab));

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-[#131B1F] border border-white/10 w-full max-w-[500px] rounded-[16px] overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[580px] relative font-sans text-white">
                {!selectedExchange ? (
                    <>
                        {/* Header */}
                        <div className="p-5 pb-2 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Connect an exchange</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5 pb-12 flex-1 overflow-y-auto custom-scrollbar" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
                            {/* Tabs */}
                            <div className="flex items-center gap-2.5 mb-6">
                                {['Spot', 'Margin', 'Futures'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`px-4 py-3 rounded-md text-xs font-medium transition-all ${activeTab === tab.toLowerCase()
                                            ? 'bg-[#00FF9D] text-black shadow-[0_0_12px_rgba(0,255,157,0.3)]'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-4 gap-3">
                                {filteredExchanges.map((exchange) => (
                                    <button
                                        key={exchange.id}
                                        onClick={() => handleExchangeSelect(exchange)}
                                        className="group relative bg-transparent border border-white/10 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 hover:border-[#00FF9D]/50 hover:bg-[#00FF9D]/5 transition-all text-center aspect-[1.3/1]"
                                    >
                                        <img
                                            src={exchange.logo}
                                            alt={exchange.name}
                                            className="h-5 w-auto object-contain filter brightness-0 invert opacity-70 group-hover:opacity-100 group-hover:filter-none transition-all"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `/exchanges_org_logo/${exchange.id.split('_')[0].toUpperCase()}.png`;
                                            }}
                                        />
                                        {exchange.subtitle && (
                                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider absolute bottom-2">
                                                {exchange.subtitle}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Connect View Header */}
                        <div className="p-5 pb-4 flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <div className="flex items-center gap-3 flex-1">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    Connect {selectedExchange.name}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pr-2 pt-0" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
                                {/* Connect Tabs */}
                                <div className="flex items-center gap-6 border-b border-white/10 mb-6 sticky top-0 bg-[#131B1F] z-10 pr-3">
                                    <button
                                        onClick={() => setConnectMode('fast')}
                                        className={`pb-3 text-sm font-bold transition-all relative ${connectMode === 'fast' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        Fast Connect
                                        {connectMode === 'fast' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00FF9D]" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setConnectMode('api')}
                                        className={`pb-3 text-sm font-bold transition-all relative ${connectMode === 'api' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        API Keys
                                        {connectMode === 'api' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00FF9D]" />
                                        )}
                                    </button>
                                </div>

                                {connectMode === 'fast' ? (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            {[
                                                'Click on the "Connect" button',
                                                `Log in to your account on the website ${selectedExchange.name.charAt(0) + selectedExchange.name.slice(1).toLowerCase()}`,
                                                'Confirm your connection to FydBlock'
                                            ].map((text, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-400 font-bold shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-sm text-gray-300 font-medium">{text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Secure Connection Box */}
                                        <div className="bg-[#1A252B] border border-white/5 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-white">Connect keys securely</h3>
                                                <a href="#" className="text-[11px] text-[#3081ED] font-bold flex items-center gap-1 hover:underline">
                                                    Full Guide <ExternalLink size={12} />
                                                </a>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <span className="text-[11px] text-gray-500 font-bold shrink-0">1.</span>
                                                    <p className="text-[11px] text-gray-300">
                                                        Log in to your exchange account and go to <a href="#" className="text-[#3081ED] flex inline-flex items-center gap-0.5 hover:underline">API Settings <ExternalLink size={10} /></a>
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-[11px] text-gray-500 font-bold shrink-0">2.</span>
                                                    <p className="text-[11px] text-gray-300">
                                                        Turn on IP whitelisting and copy/paste the following list of IP addresses:
                                                    </p>
                                                </div>
                                                <div className="bg-black/40 rounded-lg p-2.5 flex items-center justify-between gap-3 border border-white/5">
                                                    <p className="text-[10px] text-gray-400 font-medium truncate">
                                                        103.26.9.1 103.26.9.9 103.26.9.17 103.26.9.25 103.26.9.33 103.26.9....
                                                    </p>
                                                    <button className="text-gray-500 hover:text-white transition-colors shrink-0">
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-[11px] text-gray-500 font-bold shrink-0">3.</span>
                                                    <p className="text-[11px] text-gray-300">
                                                        Paste generated data in inputs below.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inputs */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Name:</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder={`My ${selectedExchange.name.charAt(0) + selectedExchange.name.slice(1).toLowerCase()}`}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00FF9D]/30 transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">API Key:</label>
                                                <input
                                                    type="text"
                                                    value={apiKey}
                                                    onChange={(e) => setApiKey(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-4 text-sm text-white focus:outline-none focus:border-[#00FF9D]/30 transition-all font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">API Secret:</label>
                                                <div className="relative">
                                                    <input
                                                        type={showSecret ? "text" : "password"}
                                                        value={apiSecret}
                                                        onChange={(e) => setApiSecret(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#00FF9D]/30 transition-all font-medium"
                                                    />
                                                    <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                            {selectedExchange.id === 'okx' && (
                                                <div className="space-y-2">
                                                    <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Passphrase:</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassphrase ? "text" : "password"}
                                                            value={passphrase}
                                                            onChange={(e) => setPassphrase(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#00FF9D]/30 transition-all font-medium"
                                                        />
                                                        <button type="button" onClick={() => setShowPassphrase(!showPassphrase)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                                            {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Shared Elements (Checkbox and Account Guide) */}
                                <div className="mt-6 space-y-6">
                                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                                        <div
                                            onClick={() => setImportPositions(!importPositions)}
                                            className={`w-5 h-5 rounded border transition-all flex items-center justify-center shrink-0 ${importPositions
                                                ? 'bg-[#00FF9D] border-[#00FF9D]'
                                                : 'border-white/20 bg-white/5'
                                                }`}
                                        >
                                            {importPositions && <Check size={14} className="text-black stroke-[3px]" />}
                                        </div>
                                        <span className="text-[13px] text-gray-300 font-medium group-hover:text-white transition-colors">
                                            Import all open positions when connecting the exchange
                                        </span>
                                    </label>

                                    <button className="w-full bg-[#1A252B] border border-white/5 rounded-xl p-4 flex items-center justify-between text-left group hover:bg-[#1A252B]/80 transition-all mb-4">
                                        <div className="flex items-center gap-3">
                                            <ChevronDown size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                                            <p className="text-[12px] text-gray-300 font-medium">
                                                Specify the required account types when generating API keys.
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Sticky Bottom Footer Area */}
                            <div className="p-5 pt-2 space-y-3 bg-[#131B1F] border-t border-white/5">
                                {connectMode === 'fast' && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                                        <div className="p-1.5 rounded-full bg-[#3081ED]/20">
                                            <ChevronLeft size={16} className="text-[#3081ED] rotate-[-90deg]" />
                                        </div>
                                        <p className="text-[13px] text-gray-300 font-medium">
                                            All types of exchange accounts that are available to you will be connected to FydBlock.
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleConnect}
                                    disabled={loading}
                                    className="w-full bg-[#00FF9D] hover:bg-[#00E68E] text-black font-bold h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,157,0.2)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Connect'}
                                </button>

                                <p className="text-center text-[12px] text-gray-400">
                                    Don't have an account? <a href="#" className="text-[#3081ED] hover:underline inline-flex items-center gap-1">Create a new account <ExternalLink size={10} /></a>
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

export default ConnectExchangeModal;
