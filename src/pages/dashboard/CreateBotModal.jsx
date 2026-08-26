import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Bot, Loader2 } from 'lucide-react';
import API_BASE_URL from '../../config';
import { getToken } from '../../utils/token';

const CreateBotModal = ({ isOpen, onClose, onSelect }) => {
    const [availableBots, setAvailableBots] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch bots when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchAvailableBots();
        }
    }, [isOpen]);

    const fetchAvailableBots = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/user/available-bots`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableBots(data);
            } else {
                console.error("Failed to fetch available bots");
            }
        } catch (error) {
            console.error("Error fetching bots:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl p-5 sm:p-6 relative shadow-2xl">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Create New Bot</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 -mr-1 rounded-lg hover:bg-white/5">
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="animate-spin text-[#00FF9D]" size={32} />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                        {availableBots.length > 0 ? (
                            availableBots.map((bot) => {
                                const lowerType = (bot.bot_type || bot.bot_name || '').toLowerCase();
                                const isDCA = lowerType.includes('dca');
                                const isComingSoon = isDCA;

                                return (
                                    <div key={bot.bot_id || bot.id} className={`bg-[#18191C] border border-white/5 rounded-xl p-5 flex flex-col items-center text-center transition-all group relative ${isComingSoon ? '' : 'hover:border-[#00FF9D]/30'}`}>

                                        {/* Coming Soon Badge */}
                                        {isComingSoon && (
                                            <div className="absolute top-3 right-3 bg-yellow-500/20 text-yellow-500 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                Coming Soon
                                            </div>
                                        )}

                                        {/* Icon Display */}
                                        <div className={`w-12 h-12 rounded-full bg-[#00FF9D]/10 flex items-center justify-center mb-3 transition-colors border border-[#00FF9D]/20 ${isComingSoon ? '' : 'group-hover:border-[#00FF9D]'}`}>
                                            {bot.icon_url ? (
                                                <img
                                                    src={bot.icon_url}
                                                    alt={bot.bot_name}
                                                    className={`w-8 h-8 object-contain transition-all duration-300 ${isComingSoon ? 'opacity-50' : 'group-hover:brightness-0'}`}
                                                />
                                            ) : (
                                                <Bot size={24} className={`text-[#00FF9D] ${isComingSoon ? 'opacity-50' : ''}`} />
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-white mb-1 uppercase">{bot.bot_name}</h3>

                                        <p className="text-xs text-gray-400 mb-5 line-clamp-2">
                                            {bot.description || `Automated ${bot.bot_type} trading strategy.`}
                                        </p>

                                        <button
                                            onClick={() => !isComingSoon && onSelect(bot.bot_type)}
                                            disabled={isComingSoon}
                                            className={`w-full font-bold py-2.5 text-sm rounded-lg transition-colors ${isComingSoon ? 'bg-[#2A2B30] text-gray-400 cursor-not-allowed' : 'bg-[#00FF9D] text-black hover:bg-[#00cc7d]'}`}
                                        >
                                            {isComingSoon ? 'Coming Soon' : 'Select'}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-2 text-center py-10 text-gray-500">
                                <Bot size={48} className="mx-auto mb-3 opacity-20" />
                                <p>No system bots are currently available.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default CreateBotModal;
