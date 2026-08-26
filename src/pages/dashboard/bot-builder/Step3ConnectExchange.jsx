import React from 'react';
import { Check, CheckCircle2, Zap, AlertCircle, Loader2, Lock, ArrowUpRight, X, Eye, EyeOff } from 'lucide-react';
import { EXCHANGES, ALL_EXCHANGES } from './constants';

export const Step3ConnectExchange = ({ wizardData, setWizardData, connectMethod, setConnectMethod, connectError, setConnectError, showExchangesModal, setShowExchangesModal, onNext, loading }) => {
    const [showSecret, setShowSecret] = React.useState(false);
    const [showPassphrase, setShowPassphrase] = React.useState(false);

    const ExchangesModal = ({ isOpen, onClose }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                <div className="bg-[#0A1014] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[85vh] flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0A1014] z-20 shrink-0">
                        <div>
                            <h2 className="text-xl text-white">Connect your Exchange</h2>
                            <p className="text-sm text-gray-500">Connect to AI platforms</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-[#0A1014] overscroll-contain" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="p-4 text-xs text-gray-500 uppercase tracking-wider">Exchange</th>
                                    <th className="p-4 text-xs text-gray-500 uppercase tracking-wider hidden md:table-cell">Order types</th>
                                    <th className="p-4 text-xs text-gray-500 uppercase tracking-wider hidden sm:table-cell">Trading Pairs</th>
                                    <th className="p-4 text-xs text-gray-500 uppercase tracking-wider text-center">Connect Existing</th>
                                    <th className="p-4 text-xs text-gray-500 uppercase tracking-wider text-center hidden sm:table-cell">Create New</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {ALL_EXCHANGES.map((ex) => (
                                    <tr key={ex.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-2">
                                                    <img src={ex.logo} alt={ex.name} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-white text-base">{ex.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400 hidden md:table-cell">{ex.type}</td>
                                        <td className="p-4 text-sm text-white font-mono hidden sm:table-cell">{ex.pairs}</td>
                                        <td className="p-4 text-center">
                                            {ex.connected ? (
                                                <button disabled className="px-5 py-2 rounded-full bg-[#00FF9D]/10 text-[#00FF9D] text-xs border border-[#00FF9D]/20 flex items-center justify-center gap-1.5 mx-auto w-full max-w-[140px]">
                                                    <Check size={14} /> Connected
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { setWizardData({ ...wizardData, exchange: ex.id }); onClose(); }}
                                                    className="px-5 py-2 rounded-full border border-white/20 text-white text-xs hover:bg-white hover:text-black transition-all flex items-center justify-center gap-1.5 mx-auto w-full max-w-[140px]"
                                                >
                                                    <ArrowUpRight size={14} /> Connect
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-4 text-center hidden sm:table-cell">
                                            <button className="px-5 py-2 rounded-full bg-[#00FF9D] text-black text-xs hover:bg-[#00cc7d] transition-all w-full max-w-[100px]">+ Create</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-pulse" />
                    Step 3 of 5
                </div>
                <h1 className="text-4xl md:text-5xl text-white mb-4">Connect your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF9D] to-[#00A3FF]">exchange</span></h1>
                <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">Securely link your exchange account via API keys. Your funds remain in your custody — we only request trading permissions.</p>
            </div>

            {/* Exchange Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
                {EXCHANGES.map((ex) => (
                    <div
                        key={ex.id}
                        onClick={() => { setWizardData({ ...wizardData, exchange: ex.id }); setConnectError(''); }}
                        className={`relative group cursor-pointer h-40 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
                            ${wizardData.exchange === ex.id
                                ? 'border-[#00FF9D] bg-gradient-to-b from-[#00FF9D]/10 to-[#0A1014]'
                                : 'border-white/10 bg-[#0A1014]/60 backdrop-blur-md hover:border-white/30 hover:bg-[#0A1014]'
                            }`}
                    >
                        {wizardData.exchange === ex.id && (
                            <div className="absolute inset-0 bg-gradient-radial from-[#00FF9D]/10 to-transparent pointer-events-none" />
                        )}

                        {wizardData.exchange === ex.id && (
                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#00FF9D] flex items-center justify-center animate-in zoom-in spin-in-12">
                                <Check size={14} className="text-black" strokeWidth={3} />
                            </div>
                        )}
                        <img src={ex.logo} alt={ex.name} className="h-20 sm:h-24 md:h-[120px] object-contain px-4 transition-transform group-hover:scale-105" />
                    </div>
                ))}
            </div>

            {/* API Key Form Card */}
            {wizardData.exchange && (
                <div className="max-w-2xl mx-auto bg-[#0A1014]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10 animate-in fade-in slide-in-from-bottom-4">
                    {/* Tab Toggle */}
                    <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/5 relative items-center">
                        {/* Tab Indicator */}
                        <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#00FF9D] rounded-xl transition-transform duration-300 shadow-lg ${connectMethod === 'manual' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-[3px]'}`} />

                         <button onClick={() => setConnectMethod('fast')} className={`flex-1 py-3 text-sm rounded-xl transition-all relative z-10 ${connectMethod === 'fast' ? 'text-black' : 'text-gray-400 hover:text-white'}`}>Fast Connect</button>
                        <button onClick={() => setConnectMethod('manual')} className={`flex-1 py-3 text-sm rounded-xl transition-all relative z-10 ${connectMethod === 'manual' ? 'text-black' : 'text-gray-400 hover:text-white'}`}>Manual Entry</button>
                    </div>

                    {connectMethod === 'fast' && (
                        <div className="text-center py-8 space-y-5 animate-in fade-in">
                            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center text-gray-400 border border-white/10 shadow-inner">
                                <Zap size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl text-white mb-2">Unavailable right now</h3>
                                <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">Fast Connect is temporarily disabled for optimal security routing. Please use <b className="text-white">Manual Entry</b> to verify credentials.</p>
                            </div>
                             <button disabled className="w-full bg-[#1A2530] text-gray-500 py-4 rounded-xl cursor-not-allowed border border-white/5">Fast Connect Disabled</button>
                        </div>
                    )}

                    {connectMethod === 'manual' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div>
                                 <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2.5">API Key</label>
                                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-base focus:border-[#00FF9D]/60 focus:bg-white/5 outline-none transition-all placeholder:text-gray-700" placeholder="Paste your API Key" value={wizardData.apiKey} onChange={(e) => setWizardData({ ...wizardData, apiKey: e.target.value })} />
                            </div>
                            <div>
                                 <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2.5">API Secret</label>
                                <div className="relative">
                                    <input type={showSecret ? "text" : "password"} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pr-12 text-white text-base focus:border-[#00FF9D]/60 focus:bg-white/5 outline-none transition-all placeholder:text-gray-700 font-mono" placeholder="••••••••••••••••" value={wizardData.apiSecret} onChange={(e) => setWizardData({ ...wizardData, apiSecret: e.target.value })} />
                                    <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                        {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            {wizardData.exchange === 'okx' && (
                                <div className="animate-in fade-in slide-in-from-top-1">
                                     <label className="block text-xs text-[#00FF9D] uppercase tracking-widest mb-2.5">Passphrase <span className="text-[#00FF9D]">*</span></label>
                                    <div className="relative">
                                        <input type={showPassphrase ? "text" : "password"} className="w-full bg-black/40 border border-[#00FF9D]/20 rounded-xl p-4 pr-12 text-[#00FF9D] text-base focus:border-[#00FF9D] focus:bg-[#00FF9D]/5 outline-none transition-all placeholder:text-[#00FF9D]/30 font-mono" placeholder="••••••••" value={wizardData.passphrase} onChange={(e) => setWizardData({ ...wizardData, passphrase: e.target.value })} />
                                        <button type="button" onClick={() => setShowPassphrase(!showPassphrase)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00FF9D]/50 hover:text-[#00FF9D]">
                                            {showPassphrase ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {connectError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <p className="font-medium leading-snug">{connectError}</p>
                                </div>
                            )}
                    <button
                                onClick={onNext}
                                disabled={loading || !wizardData.apiKey || !wizardData.apiSecret}
                                className="w-full mt-4 bg-[#00FF9D] text-black py-4 rounded-xl hover:bg-[#00cc7d] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-base flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Connect {EXCHANGES.find(e => e.id === wizardData.exchange)?.name} <ArrowUpRight size={18} /></>}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* View All & Skip */}
            <div className="flex flex-col items-center gap-4 text-sm mb-12">
                <button onClick={() => setShowExchangesModal(true)} className="px-8 py-3 rounded-xl border border-white/10 text-gray-400 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all text-sm tracking-wide">View all 12+ exchanges</button>
            </div>

            {/* Security Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-10 border-t border-white/10 max-w-4xl mx-auto">
                <div className="flex items-start gap-4 text-sm text-gray-400 bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                    <Lock size={20} className="text-[#00FF9D] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="leading-relaxed">We will <b className="text-white">never</b> have access to transfer or withdraw your assets. Your API keys are encrypted immediately upon entry.</span>
                </div>
                <div className="flex items-start gap-4 text-sm text-gray-400 bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                    <Zap size={20} className="text-[#00FF9D] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="leading-relaxed">All data traversing our systems is protected by Cloudflare DDoS defense and military-grade SSL encryption.</span>
                </div>
            </div>

            <ExchangesModal isOpen={showExchangesModal} onClose={() => setShowExchangesModal(false)} />
        </div>
    );
};
