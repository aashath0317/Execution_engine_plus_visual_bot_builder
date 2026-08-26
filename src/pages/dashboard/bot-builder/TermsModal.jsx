import React from 'react';
import { X } from 'lucide-react';
import TermsText from '../../../components/TermsText';

export const TermsModal = ({ isOpen, onClose, onAccept }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-[#0A1014] border border-[#00FF9D]/20 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0A1014] z-20 shrink-0">
                    <div>
                        <h2 className="text-xl text-white mb-1">Terms of Service</h2>
                        <p className="text-xs text-[#00FF9D]/80">Please read carefully before proceeding</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div
                    className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-[#0A1014] overscroll-contain text-sm text-gray-300 leading-relaxed"
                >
                    <TermsText />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex justify-end gap-4 bg-[#0A1014]/90 backdrop-blur-md rounded-b-2xl shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-400 hover:text-white text-sm transition-colors">
                        Close
                    </button>
                    <button onClick={onAccept} className="px-6 py-2.5 bg-[#00FF9D] hover:bg-[#00cc7d] text-black text-sm rounded-xl transition-all hover:-translate-y-0.5">
                        Accept & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};
