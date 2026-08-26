import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle2, Plus } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import ConnectExchangeModal from './dashboard/ConnectExchangeModal';
import { useTrading } from '../context/TradingContext';

const ExchangeFilter = ({ options, selected, onSelect, isLoading }) => {
    const { isPaperTrading } = useTrading();
    const [isOpen, setIsOpen] = useState(false);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getLogo = (name) => {
        if (!name || name === 'ALL') return null;
        const formattedName = name.toUpperCase();
        // Map of exchange names to their logo paths
        const logoMap = {
            'BINANCE': '/exchanges_svg/binance.svg',
            'OKX': '/exchanges_svg/okx.svg',
            'BYBIT': '/exchanges_svg/Bybit.svg',
            'BITFINEX': '/exchanges_svg/Bitfinex.svg',
            'BITGET': '/exchanges_svg/Bitget.svg',
            'BITSTAMP': '/exchanges_svg/Bitstamp.svg',
            'COINBASE': '/exchanges_svg/CoinBase.svg',
            'GATE': '/exchanges_svg/Gate.svg',
            'GEMINI': '/exchanges_svg/Gemini.svg',
            'HTX': '/exchanges_svg/HTX.svg',
            'KRAKEN': '/exchanges_svg/Kraken.svg',
            'KUCOIN': '/exchanges_svg/KuCoin.svg',
        };

        // Try direct lookup
        if (logoMap[formattedName]) return logoMap[formattedName];

        // Try fallback logic (e.g. capitalized first letter) if map miss
        // This handles cases where the filter might come in a format that matches the file system but not the exact map key
        // derived from existing logic in Portfolio.jsx
        return `/exchanges_svg/${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}.svg`;
    };

    const selectedLogo = getLogo(selected);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 bg-[#0A1014] border border-white/10 rounded-lg px-4 py-1.5 h-8 w-32">
                <Skeleton width="60px" height="10px" className="opacity-50" />
            </div>
        );
    }

    return (
        <div className="relative z-30" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-[#0A1014] border border-white/10 rounded-lg px-4 py-1.5 cursor-pointer hover:border-white/20 select-none h-8 transition-colors"
                role="button"
                tabIndex={0}
            >
                <span className="hidden sm:inline text-xs text-gray-400 font-medium whitespace-nowrap">Exchange:</span>

                {selectedLogo && (
                    <img
                        src={selectedLogo}
                        alt={selected}
                        className="w-3.5 h-3.5 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}

                <span className={`font-medium text-xs ${selected === 'ALL' ? 'text-[#00FF9D]' : 'text-white'}`}>
                    {selected}
                </span>

                <ChevronDown
                    size={12}
                    className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A1014] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
                        {options.map(filter => {
                            const logo = getLogo(filter);
                            const isSelected = selected === filter;

                            return (
                                <div
                                    key={filter}
                                    onClick={() => {
                                        onSelect(filter);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-2.5 text-xs font-medium cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors ${isSelected ? 'text-[#00FF9D] bg-[#00FF9D]/5' : 'text-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {logo && (
                                            <img
                                                src={logo}
                                                alt={filter}
                                                className="w-4 h-4 object-contain opacity-80"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        {filter}
                                    </div>
                                    {isSelected && <CheckCircle2 size={12} />}
                                </div>
                            );
                        })}
                    </div>
                    {/* Add new exchange option */}
                    <div className="border-t border-white/10 bg-[#0A1014]">
                        <div
                            onClick={() => {
                                setIsOpen(false);
                                setIsConnectModalOpen(true);
                            }}
                            className="px-4 py-3 cursor-pointer flex items-center justify-center hover:bg-[#00FF9D]/10 transition-colors text-[#00FF9D]"
                        >
                            <Plus size={18} className="stroke-[2.5]" />
                        </div>
                    </div>
                </div>
            )}

            <ConnectExchangeModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                defaultIsTestnet={isPaperTrading}
            />
        </div>
    );
};

export default ExchangeFilter;
