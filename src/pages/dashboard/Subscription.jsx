import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { Check, Star, CreditCard, Bitcoin } from 'lucide-react';

const Subscription = () => {
    const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'

    return (
        <DashboardLayout>
            <Header title="Subscription Plan" />

            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose Your Path To Automated Trading</h2>
                    <p className="text-gray-400 text-sm md:text-base">
                        Select the perfect bot based on your goals: effortless long-term growth or full control over complex strategies.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex justify-center mt-8">
                        <div className="bg-[#1A1F24] p-1 rounded-xl flex border border-white/10">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-8 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[#3C4449] text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`px-8 py-2 rounded-lg text-sm font-bold transition-all relative ${billingCycle === 'annual' ? 'bg-[#3C4449] text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Annual
                                <span className="absolute -top-3 -right-3 bg-[#E2F708] text-black text-[10px] px-1.5 py-0.5 rounded font-bold">
                                    -54%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cards Container */}
                <div className="grid md:grid-cols-2 gap-8 mb-16 relative">
                    {/* Card 1: FydBlock Signature Bot */}
                    <div className="border border-white/10 bg-[#0A1014] rounded-3xl p-8 relative flex flex-col">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E2F708] text-black px-4 py-1 rounded-full text-xs font-bold uppercase">
                            Up to 40% off
                        </div>

                        <h3 className="text-xl font-medium text-white mb-4">FydBlock Signature Bot</h3>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-bold text-white">$19</span>
                            <span className="text-xl text-gray-500 line-through decoration-red-500 decoration-2">$59</span>
                            <span className="text-gray-400">/Month</span>
                        </div>
                        <p className="text-gray-400 mb-8 text-sm">Set and forget Diversified Portfolios</p>

                        <div className="space-y-4 mb-8 flex-1">
                            {[
                                "1X Signature Bot Slot",
                                "AI Native Includes",
                                "Unlimited Coins",
                                "24/7 Rebalancing"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border border-[#00FF9D] flex items-center justify-center shrink-0">
                                        <Check size={12} className="text-[#00FF9D]" strokeWidth={3} />
                                    </div>
                                    <span className="text-white font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full bg-[#00FF9D] hover:bg-[#00cc7d] text-black font-bold py-4 rounded-full transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)]">
                            7 Days Free Trail
                        </button>
                    </div>

                    {/* Card 2: Pro Custom Strategy Bot */}
                    <div className="bg-[#00FF9D] rounded-3xl p-8 relative flex flex-col shadow-[0_0_30px_rgba(0,255,157,0.15)] text-black border border-[#00FF9D]">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E2F708] text-black px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                            Up to 40% off
                        </div>

                        <h3 className="text-xl font-medium mb-4 text-black/80">Pro Custom Strategy Bot</h3>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-bold text-black">$34</span>
                            <span className="text-xl text-black/50 line-through decoration-black/50 decoration-2">$89</span>
                            <span className="text-black/70">/Month</span>
                        </div>
                        <p className="text-black/70 mb-8 text-sm font-medium">A full-featured suite for seasoned traders.</p>

                        <div className="space-y-4 mb-8 flex-1">
                            {[
                                "Unlimited Grid bot",
                                "Suggested Coin",
                                "Advanced Parameter",
                                "Access 6 Custom bots"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border border-black flex items-center justify-center shrink-0">
                                        <Check size={12} className="text-black" strokeWidth={3} />
                                    </div>
                                    <span className="text-black font-bold">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-full transition-all">
                            7 Days Free Trail
                        </button>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-xs mb-12 max-w-2xl mx-auto">
                    All prices on this website are excluding VAT (if applicable). Free 7 day trial for Explorer package starts directly with each sign up.
                </p>

                {/* Custom Plan Section */}
                <div className="bg-[#131B1F] rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden mb-16">
                    <div className="relative z-10 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-2">Custom Plan</h3>
                        <p className="text-gray-400 text-xs max-w-md mx-auto md:mx-0">
                            Go beyond pre-set plans. Unlock more bots, more index, more analytics, all tailored to your strategy.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 relative z-10">
                        {["Everything in Plus", "Custom Bot Setting", "Dedicated ML", "Advanced analytics"].map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Check size={16} className="text-[#00FF9D]" />
                                <span className="text-sm font-bold text-white">{item}</span>
                            </div>
                        ))}
                    </div>

                    <button className="relative z-10 bg-[#FFD199] hover:bg-[#ffc277] text-black font-bold px-8 py-3 rounded-full transition-colors whitespace-nowrap">
                        Contact US
                    </button>

                    {/* Background Star */}
                    <Star className="absolute top-4 right-4 text-white/10" size={20} />
                </div>

                {/* Footer Payment Methods */}
                <div className="bg-white py-6 px-4 rounded-xl flex flex-wrap justify-center gap-6 items-center">
                    <span className="text-blue-900 font-bold text-2xl italic">VISA</span>
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-red-500 opacity-80"></div>
                        <div className="w-8 h-8 rounded-full bg-orange-500 opacity-80"></div>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-gray-600">
                        <span className="text-blue-500">G</span> Pay
                    </div>
                    <div className="flex items-center gap-1 font-bold text-black">
                        Apple Pay
                    </div>
                    <div className="italic font-bold text-[#003087]">PayPal</div>
                    <div className="bg-orange-500 w-8 h-8 rounded-full flex items-center justify-center text-white"><Bitcoin size={20} /></div>
                    <div className="bg-[#009393] w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs">T</div>
                    <div className="text-[#F3BA2F] font-bold flex items-center gap-1"><Bitcoin size={20} className="text-[#F3BA2F]" /> Binance Pay</div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Subscription;
