import React, { useState, useEffect } from 'react';
import { X, Shield, BarChart2, Target } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Cookie State
    const [preferences, setPreferences] = useState({
        essential: true, // Always true and disabled
        performance: false,
        marketing: false
    });

    useEffect(() => {
        // Check if consent is already stored
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Delay slightly for smooth entrance
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = { essential: true, performance: true, marketing: true };
        setPreferences(allAccepted);
        saveConsent(allAccepted);
    };

    const handleRejectAll = () => {
        const allRejected = { essential: true, performance: false, marketing: false };
        setPreferences(allRejected);
        saveConsent(allRejected);
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
    };

    const saveConsent = (prefs) => {
        localStorage.setItem('cookieConsent', JSON.stringify(prefs));
        setIsVisible(false);
        setShowModal(false);
    };

    const togglePreference = (key) => {
        if (key === 'essential') return;
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isVisible) return null;

    return (
        <>
            {/* --- Banner --- */}
            {!showModal && (
                <div className="fixed bottom-0 left-0 w-full z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-700">
                    <div className="max-w-7xl mx-auto bg-[#0A1014]/95 backdrop-blur-md border border-[#00FF9D]/20 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,255,157,0.1)] overflow-hidden relative">

                        {/* Background Glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF9D]/5 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00A3FF]/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="max-w-3xl">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">We value your privacy</h3>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                    We use cookies to enhance your trading experience, analyze performance, and ensure security.
                                    By clicking "Accept All", you agree to the storing of cookies on your device.
                                    <a href="/privacy" className="text-[#00FF9D] hover:underline ml-1">Privacy Policy</a>
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-6 py-3 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-sm md:text-base flex-1 md:flex-none whitespace-nowrap"
                                >
                                    Customize
                                </button>
                                <button
                                    onClick={handleRejectAll}
                                    className="px-6 py-3 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-sm md:text-base flex-1 md:flex-none whitespace-nowrap"
                                >
                                    Reject All
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="px-8 py-3 rounded-lg bg-[#00FF9D] text-black font-bold hover:bg-[#00FF9D]/90 shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:shadow-[0_0_30px_rgba(0,255,157,0.5)] transition-all transform hover:-translate-y-0.5 text-sm md:text-base flex-1 md:flex-none whitespace-nowrap"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Preferences Modal --- */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0A1014] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0A1014] z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Cookie Preferences</h2>
                                <p className="text-gray-400 text-sm mt-1">Manage your privacy settings</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 space-y-6">
                            <p className="text-gray-300 bg-white/5 p-4 rounded-lg border border-white/5">
                                You can choose which cookies you want to accept. Essential cookies are necessary for the site to function properly and cannot be disabled.
                            </p>

                            {/* Essential */}
                            <div className="bg-[#11181D] rounded-xl p-5 border border-[#00FF9D]/20">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Shield className="text-[#00FF9D]" size={20} />
                                        <h3 className="text-lg font-bold text-white">Essential Cookies</h3>
                                    </div>
                                    <div className="w-12 h-6 bg-[#00FF9D]/20 rounded-full relative cursor-not-allowed">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-[#00FF9D] rounded-full shadow-lg" />
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Necessary for core features like login, security, and trading functionality. These cannot be disabled.
                                </p>
                            </div>

                            {/* Performance */}
                            <div className="bg-[#11181D] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <BarChart2 className="text-blue-400" size={20} />
                                        <h3 className="text-lg font-bold text-white">Performance & Analytics</h3>
                                    </div>

                                    {/* Toggle */}
                                    <button
                                        onClick={() => togglePreference('performance')}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${preferences.performance ? 'bg-[#00FF9D]/20' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-transform duration-300 ${preferences.performance ? 'translate-x-7 bg-[#00FF9D]' : 'translate-x-1 bg-gray-400'}`} />
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Help us understand how you use FydBlock so we can improve the platform and fix bugs.
                                </p>
                            </div>

                            {/* Marketing */}
                            <div className="bg-[#11181D] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Target className="text-purple-400" size={20} />
                                        <h3 className="text-lg font-bold text-white">Marketing & Targeting</h3>
                                    </div>

                                    {/* Toggle */}
                                    <button
                                        onClick={() => togglePreference('marketing')}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${preferences.marketing ? 'bg-[#00FF9D]/20' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-transform duration-300 ${preferences.marketing ? 'translate-x-7 bg-[#00FF9D]' : 'translate-x-1 bg-gray-400'}`} />
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 md:p-8 border-t border-white/5 bg-[#0A1014] sticky bottom-0 z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-4">
                            <button
                                onClick={handleSavePreferences}
                                className="w-full md:w-auto px-6 py-3 rounded-lg text-gray-400 hover:text-white font-medium transition-colors"
                            >
                                Reject Optional
                            </button>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-all whitespace-nowrap"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="flex-1 md:flex-none px-8 py-3 rounded-lg bg-[#00FF9D] text-black font-bold hover:bg-[#00FF9D]/90 shadow-[0_0_20px_rgba(0,255,157,0.3)] transition-all whitespace-nowrap"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CookieConsent;
