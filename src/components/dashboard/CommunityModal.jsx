import React from 'react';
import { X, MessageCircle, Youtube, Send, Linkedin, Twitter } from 'lucide-react';

const CommunityModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0A1014] border border-white/10 w-full max-w-md rounded-3xl p-8 relative shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Grid of Icons */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* Top Row */}
                    <div className="aspect-square bg-[#1A1F24] rounded-2xl flex items-center justify-center bg-gradient-to-b from-[#1A1F24] to-[#0A1014] border border-white/5 hover:border-[#00FF9D]/30 transition-colors group">
                        <MessageCircle size={32} className="text-white group-hover:text-[#00FF9D] transition-colors" />
                    </div>
                    <div className="aspect-square bg-[#1A1F24] rounded-2xl flex items-center justify-center bg-gradient-to-b from-[#1A1F24] to-[#0A1014] border border-white/5 hover:border-[#00FF9D]/30 transition-colors group">
                        <MessageCircle size={32} className="text-white group-hover:text-[#00FF9D] transition-colors" />
                    </div>
                    <div className="aspect-square bg-[#1A1F24] rounded-2xl flex items-center justify-center bg-gradient-to-b from-[#1A1F24] to-[#0A1014] border border-white/5 hover:border-[#00FF9D]/30 transition-colors group">
                        <Youtube size={32} className="text-white group-hover:text-[#00FF9D] transition-colors" />
                    </div>

                    {/* Bottom Row */}
                    <div className="aspect-square bg-[#1A1F24] rounded-2xl flex items-center justify-center bg-gradient-to-b from-[#1A1F24] to-[#0A1014] border border-white/5 hover:border-[#00FF9D]/30 transition-colors group">
                        <Send size={32} className="text-white group-hover:text-[#00FF9D] transition-colors" />
                    </div>
                    <div className="aspect-square bg-[#1A1F24] rounded-2xl flex items-center justify-center bg-gradient-to-b from-[#1A1F24] to-[#0A1014] border border-white/5 hover:border-[#00FF9D]/30 transition-colors group">
                        <Twitter size={32} className="text-white group-hover:text-[#00FF9D] transition-colors" />
                    </div>
                    <div className="aspect-square bg-[#1A1F24] rounded-2xl flex items-center justify-center bg-gradient-to-b from-[#1A1F24] to-[#0A1014] border border-white/5 hover:border-[#00FF9D]/30 transition-colors group">
                        <Linkedin size={32} className="text-white group-hover:text-[#00FF9D] transition-colors" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-3">Join our community</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Stay connected with thousands of active traders. Whether you're
                        looking for the latest product updates, expert tips, direct support, or just
                        want to be part of the conversation — our community is the place to be.
                    </p>
                </div>

                {/* Join Button */}
                <button
                    onClick={() => window.open('https://t.me/Fydblock', '_blank')}
                    className="w-full bg-[#00FF9D] hover:bg-[#00cc7d] text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:shadow-[0_0_30px_rgba(0,255,157,0.5)] flex items-center justify-center gap-2"
                >
                    <Send size={18} />
                    Join Telegram
                </button>
            </div>
        </div>
    );
};

export default CommunityModal;
