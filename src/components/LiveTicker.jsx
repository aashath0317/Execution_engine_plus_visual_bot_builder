import React from 'react';

const LiveTicker = ({ data = [], isSidebarExpanded }) => {
    // Internal fetch removed - receiving data from parent

    if (!data || data.length === 0) return null;

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-[#131517] border-t border-white/5 h-12 z-30 overflow-hidden flex items-center transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'md:pl-64' : 'md:pl-20'}`}>
            <div className="bg-[#00FF9D] h-full flex items-center px-4 shrink-0 relative z-50 shadow-lg">
                <span className="text-black text-xs font-bold uppercase">Gainers</span>
            </div>
            <div className="flex animate-marquee whitespace-nowrap items-center hover:pause">
                {[...data, ...data].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-6 border-r border-white/5">
                        <span className="text-white text-xs font-bold font-mono">{item.pair}</span>
                        <span className="text-white text-xs font-mono">{item.price}</span>
                        <span className={`text-[10px] font-bold font-mono ${item.isPositive ? 'text-[#00FF9D]' : 'text-red-500'}`}>
                            ({item.change})
                        </span>
                    </div>
                ))}
            </div>
            <style>{`
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .hover\\:pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default LiveTicker;
