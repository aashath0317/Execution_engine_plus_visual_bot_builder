import React, { useState } from 'react';
import { ChevronDown, Check, ChevronRight } from 'lucide-react';
import { QUOTE_CURRENCIES } from './constants';

export const Step4SelectCurrency = ({ wizardData, setWizardData, onNext }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const selectedCurrencyObj = QUOTE_CURRENCIES.find(c => c.id === wizardData.currency);

    return (
        <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left Content */}
            <div className="flex-1 max-w-lg w-full">
                <div className="inline-flex items-center gap-2 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-pulse" />
                    Step 4 of 5
                </div>
                <h1 className="text-4xl lg:text-5xl text-white mb-5 tracking-tight">Quote <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF9D] to-[#00A3FF]">Currency</span></h1>
                <p className="text-gray-400 text-base mb-10 leading-relaxed max-w-md">Select the currency your bot uses as the base for executing and settling trades on your exchange.</p>

                <div className="bg-[#0A1014]/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-visible relative z-20 transition-all hover:border-white/20">
                    <label className="block text-xs text-gray-500 uppercase tracking-widest pt-6 px-6 mb-2">Primary Asset</label>
                    <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex justify-between items-center px-6 pb-6 cursor-pointer group select-none"
                    >
                        <div className="flex items-center gap-4">
                            {selectedCurrencyObj ? (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:bg-white/10 transition-colors">
                                        <img src={selectedCurrencyObj.image} alt={selectedCurrencyObj.name} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-white text-xl tracking-wide group-hover:text-[#00FF9D] transition-colors">{selectedCurrencyObj.name}</span>
                                </>
                            ) : (
                                <span className="text-gray-500 font-medium">Select quote currency</span>
                            )}
                        </div>
                        <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 bg-[#00FF9D]/10 border-[#00FF9D]/30' : 'group-hover:bg-white/10'}`}>
                            <ChevronDown size={18} className={isDropdownOpen ? 'text-[#00FF9D]' : 'text-gray-400 group-hover:text-white transition-colors'} />
                        </div>
                    </div>

                    {/* Absolute Dropdown for over-flow handling */}
                    <div className={`absolute top-[calc(100%+8px)] left-0 w-full bg-[#0A1014]/95 backdrop-blur-2xl border border-white/10 rounded-2xl transition-all duration-300 transform origin-top z-50 ${isDropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                        <div className="p-3 space-y-2">
                            {QUOTE_CURRENCIES.map((curr) => (
                                <div
                                    key={curr.id}
                                    onClick={() => {
                                        setWizardData({ ...wizardData, currency: curr.id });
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer transition-all duration-200 border group ${wizardData.currency === curr.id ? 'border-[#00FF9D]/40 bg-[#00FF9D]/5' : 'border-transparent hover:border-white/10 hover:bg-white/5'}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center p-1.5">
                                        <img src={curr.image} alt={curr.name} className="w-full h-full object-contain" />
                                    </div>
                                    <span className={`text-base tracking-wide flex-1 ${wizardData.currency === curr.id ? 'text-[#00FF9D]' : 'text-gray-300 group-hover:text-white transition-colors'}`}>{curr.name}</span>
                                    {wizardData.currency === curr.id && (
                                        <div className="w-6 h-6 rounded-full bg-[#00FF9D] flex items-center justify-center animate-in zoom-in">
                                            <Check size={14} className="text-black" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-10">
                     <button
                        onClick={onNext}
                        className="flex-1 bg-[#00FF9D] text-black py-4 rounded-xl text-base hover:bg-[#00cc7d] transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
                    >
                        Continue <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Right Visual Element */}
            <div className="flex-1 flex justify-center items-center relative w-full h-[400px] lg:h-[500px]">
                 {/* Visual Background Dims */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[300px] h-[300px] bg-[#00FF9D]/[0.03] rounded-full" />
                    <div className="absolute w-[200px] h-[200px] bg-[#00A3FF]/[0.03] rounded-full translate-x-10 -translate-y-10" />
                </div>

                {/* Main Image */}
                     <img
                    src="/BTC_ETH.png"
                    alt="Crypto Coins floating"
                    className="relative z-10 w-auto h-auto max-w-[80%] lg:max-w-full max-h-full object-contain animate-float"
                    style={{ animationDuration: '6s' }}
                />
            </div>
        </div>
    );
};
