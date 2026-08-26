import React from 'react';
import { Loader2, Check } from 'lucide-react';

export const Step5LetsTrade = ({ submitFinalBot, loading }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500 relative z-20">
            <div className="relative bg-[#0A1014] border border-[#00FF9D]/30 rounded-[2rem] p-12 text-center max-w-lg w-full overflow-hidden">
                {/* Removed Top gradient bar */}

                {/* Removed Glow bg */}

                {/* Icon Wrapper */}
                <div className="relative w-28 h-28 mx-auto mb-10">
                    <div className="relative w-full h-full bg-[#00FF9D]/10 border-2 border-[#00FF9D]/40 rounded-full flex flex-col items-center justify-center">
                        <Check size={52} className="text-[#00FF9D]" strokeWidth={2.5} />
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                    <span className="w-2 h-2 rounded-full bg-[#00FF9D]" />
                    Setup Complete
                </div>

                <h1 className="text-4xl text-white mb-4 tracking-tight">You're All Set!</h1>
                <p className="text-gray-400 text-base mb-10 leading-relaxed max-w-sm mx-auto">Your bot has been configured and is ready to trade. Head to the dashboard to monitor its performance and deploy live strategies.</p>

                <button
                    onClick={submitFinalBot}
                    disabled={loading}
                    className="w-full bg-[#00FF9D] hover:bg-[#00cc7d] text-black py-5 rounded-2xl text-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                    {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            Let's Trade
                        </>
                    )}
                </button>

                <p className="text-gray-500 text-xs mt-6">You can always update your exchange & bot settings later from settings.</p>
            </div>

            {/* Background Ambient Dim */}
            <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
                <div className="w-[800px] h-[800px] bg-[#00FF9D]/[0.02] rounded-full" />
            </div>
        </div>
    );
};
