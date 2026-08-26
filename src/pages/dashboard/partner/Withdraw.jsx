import React, { useState } from 'react';
import { AlertCircle, Landmark } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';

const PartnerWithdraw = () => {
    const [selectedMethod, setSelectedMethod] = useState('paypal'); // 'paypal' or 'bank'

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-8 w-full">
                {/* --- Top Section: Stats & Threshold --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Green Balance Card */}
                    <div className="lg:col-span-2 bg-[#1D3B30] border border-[#00FF9D]/20 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00FF9D]/10 to-transparent pointer-events-none" />

                        <div className="relative z-10 mb-8">
                            <p className="text-gray-300 font-medium mb-1">Available for Withdrawal</p>
                            <h2 className="text-4xl sm:text-5xl font-bold text-white flex items-baseline gap-1 sm:gap-2">
                                $1,450.50 <span className="text-base sm:text-lg text-gray-400 font-normal">USD</span>
                            </h2>
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="bg-black/20 border border-white/10 rounded-xl p-4 flex-1 backdrop-blur-sm">
                                <p className="text-gray-400 text-xs mb-1">Pending Clearance</p>
                                <p className="text-lg sm:text-xl font-bold text-white">$240.00</p>
                            </div>
                            <div className="bg-black/20 border border-white/10 rounded-xl p-4 flex-1 backdrop-blur-sm">
                                <p className="text-gray-400 text-xs mb-1">Total Withdrawn</p>
                                <p className="text-lg sm:text-xl font-bold text-white">$12,450.00</p>
                            </div>
                        </div>

                        {/* Background Money Icon Effect */}
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-5 pointer-events-none">
                            <svg width="200" height="200" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" /></svg>
                        </div>
                    </div>

                    {/* Minimum Threshold Card */}
                    <div className="bg-white text-black rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4 text-white shadow-md">
                            <span className="font-bold text-2xl">!</span>
                        </div>
                        <h3 className="font-bold text-xl mb-2">Minimum Threshold</h3>
                        <p className="text-gray-600 text-sm mb-6 px-4 leading-relaxed">
                            You need at least <span className="font-bold text-black">$50.00</span> to request a payout.
                        </p>
                        <div className="w-full h-1 bg-gray-200 rounded-full mb-2 overflow-hidden">
                            <div className="h-full w-full bg-[#00FF9D]"></div>
                        </div>
                        <span className="text-[#00BFA5] text-xs font-bold uppercase tracking-wide">Threshold Met</span>
                    </div>
                </div>

                {/* --- Bottom Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Withdrawal Form */}
                    <div className="lg:col-span-2 bg-[#0A1012] border border-white/5 rounded-2xl p-5 sm:p-8">

                        {/* Step 1: Method */}
                        <div className="mb-10">
                            <h3 className="text-white text-lg font-medium mb-4 sm:mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#1D3B30] text-[#00FF9D] flex items-center justify-center text-xs font-bold border border-[#00FF9D]/30 min-w-[24px]">01</span>
                                Choose Payment Method
                            </h3>

                            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                                {/* PayPal Option */}
                                <div
                                    onClick={() => setSelectedMethod('paypal')}
                                    className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === 'paypal'
                                        ? 'border-[#00FF9D] bg-white text-black'
                                        : 'border-white/10 bg-[#1A1F21] text-gray-400 hover:border-white/20'
                                        }`}
                                >
                                    {selectedMethod === 'paypal' && (
                                        <div className="absolute top-3 right-3 w-3 h-3 bg-[#00FF9D] rounded-full shadow-sm"></div>
                                    )}
                                    <div className="flex items-center gap-2 mb-2 font-bold text-lg italic">
                                        <span className={selectedMethod === 'paypal' ? 'text-[#003087]' : 'text-white'}>Pay</span>
                                        <span className={selectedMethod === 'paypal' ? 'text-[#009cde]' : 'text-white'}>Pal</span>
                                    </div>
                                    <p className="text-xs font-bold mb-1">PayPal</p>
                                    <p className={`text-xs ${selectedMethod === 'paypal' ? 'text-gray-500' : 'text-gray-500'}`}>alex@fydblock.io</p>
                                </div>

                                {/* Bank Option */}
                                <div
                                    onClick={() => setSelectedMethod('bank')}
                                    className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === 'bank'
                                        ? 'border-[#00FF9D] bg-white text-black'
                                        : 'border-white/10 bg-[#1A1F21] text-gray-400 hover:border-white/20'
                                        }`}
                                >
                                    {selectedMethod === 'bank' && (
                                        <div className="absolute top-3 right-3 w-3 h-3 bg-[#00FF9D] rounded-full shadow-sm"></div>
                                    )}
                                    <div className={`mb-2 ${selectedMethod === 'bank' ? 'text-black' : 'text-white'}`}>
                                        <Landmark size={24} />
                                    </div>
                                    <p className="text-xs font-bold mb-1">Bank Transfer</p>
                                    <p className={`text-xs ${selectedMethod === 'bank' ? 'text-gray-500' : 'text-gray-500'}`}>**** 4291 (Wise)</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Amount */}
                        <div>
                            <h3 className="text-white text-lg font-medium mb-4 sm:mb-6 flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#1D3B30] text-[#00FF9D] flex items-center justify-center text-xs font-bold border border-[#00FF9D]/30 min-w-[24px]">02</span>
                                Enter Amount
                            </h3>

                            <div className="bg-white rounded-xl p-2 flex items-center justify-between mb-3 pl-4 sm:pl-6">
                                <span className="text-gray-400 text-xl sm:text-2xl font-medium">$</span>
                                <input
                                    type="text"
                                    defaultValue="1450.50"
                                    className="w-full text-right text-2xl sm:text-3xl font-bold text-black focus:outline-none px-2 sm:px-4"
                                />
                                <div className="flex flex-col border-l border-gray-200 px-2">
                                    <button className="text-gray-400 hover:text-black text-xs">▲</button>
                                    <button className="text-gray-400 hover:text-black text-xs">▼</button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mb-8">
                                <button className="bg-[#1D3B30] text-[#00FF9D] text-xs font-bold px-3 sm:px-4 py-1.5 rounded hover:bg-[#00FF9D] hover:text-black transition-colors">25%</button>
                                <button className="bg-[#1D3B30] text-[#00FF9D] text-xs font-bold px-3 sm:px-4 py-1.5 rounded hover:bg-[#00FF9D] hover:text-black transition-colors">50%</button>
                                <button className="bg-[#1D3B30] text-[#00FF9D] text-xs font-bold px-3 sm:px-4 py-1.5 rounded hover:bg-[#00FF9D] hover:text-black transition-colors">MAX</button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                <button className="w-full sm:flex-1 bg-[#00FF9D] text-black font-bold py-4 px-6 rounded-lg hover:bg-[#00cc7d] transition-shadow shadow-[0_0_20px_rgba(0,255,157,0.3)] whitespace-nowrap">
                                    Request Withdrawal
                                </button>
                                <p className="text-gray-400 text-xs text-center sm:text-left sm:w-32 leading-tight">
                                    Processing time: <br className="hidden sm:block" /> <span className="text-white font-bold">1-3 Business Days</span>
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Recent Payouts List */}
                    <div className="bg-white rounded-2xl p-6 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-black font-bold text-lg">Recent Payouts</h3>
                            <button className="text-[#00BFA5] text-xs font-bold hover:underline">View All</button>
                        </div>

                        <div className="space-y-0">
                            <PayoutItem amount="$340.50" date="Dec 15, 2023" status="paid" method="paypal" />
                            <PayoutItem amount="$340.50" date="Dec 15, 2023" status="paid" method="bank" />
                            <PayoutItem amount="$340.50" date="Dec 15, 2023" status="failed" method="paypal" />
                            <PayoutItem amount="$1,200.00" date="Nov 15, 2023" status="paid" method="bank" />
                            <PayoutItem amount="$340.50" date="Dec 15, 2023" status="paid" method="bank" />
                            <PayoutItem amount="$1,200.00" date="Nov 15, 2023" status="paid" method="bank" />
                            <PayoutItem amount="$1,200.00" date="Nov 15, 2023" status="paid" method="bank" />
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <p className="text-gray-500 text-xs">Need help with a payout? <span className="text-black font-bold cursor-pointer">Contact Support</span></p>
                        </div>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
};

// --- Helper Components ---

const PayoutItem = ({ amount, date, status, method }) => (
    <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
        <div>
            <p className="text-black font-bold text-sm">{amount}</p>
            <p className="text-gray-500 text-[10px]">{date}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
            {/* Status Badge */}
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${status === 'paid' ? 'bg-[#E0F7FA] text-[#00BFA5]' : 'bg-[#FFEBEE] text-red-500'
                }`}>
                {status === 'paid' ? 'PAID' : 'FAILED'}
            </span>

            {/* Method Icon */}
            {method === 'paypal' ? (
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#003087] font-bold italic">Pay</span><span className="text-[10px] text-[#009cde] font-bold italic">Pal</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 text-gray-500">
                    <Landmark size={12} /> <span className="text-[10px]">Bank</span>
                </div>
            )}
        </div>
    </div>
);

export default PartnerWithdraw;
