import React from 'react';

import DashboardLayout from '../../../components/DashboardLayout';
const PartnerMarketing = () => {
    return (
        <DashboardLayout>
            <div className="animate-fade-in w-full">
                <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-[#00FF9D]/10 rounded-full flex items-center justify-center mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00FF9D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20v-6M6 20V10M18 20V4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Marketing Assets</h2>
                    <p className="text-gray-400 max-w-md">
                        Access banners, logos, and referral links to promote Fydblock to your audience.
                    </p>
                    <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10 w-full max-w-lg">
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Your Referral Link</p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <code className="flex-1 bg-black/50 p-3 rounded text-[#00FF9D] font-mono text-[13px] sm:text-sm break-all text-center sm:text-left">
                                https://fydblock.com/r/user_123
                            </code>
                            <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-3 rounded-lg font-bold transition-colors w-full sm:w-auto">
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PartnerMarketing;
