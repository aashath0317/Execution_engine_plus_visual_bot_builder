import React from 'react';
import { Layers, BarChart2, Zap, Activity, Box, Cpu, MessageSquare, Briefcase, ShieldCheck, Sparkles, Repeat, Check, ChevronRight } from 'lucide-react';

export const Step2SelectPlan = ({ wizardData, setWizardData, onNext }) => {
    const isAnnual = wizardData.billingCycle === 'annual';
    const getPrice = (base) => isAnnual ? base : Math.round(base * 1.2);

    const plans = [
        {
            id: 'free',
            name: "Free Plan",
            price: "$0",
            period: "/month",
            desc: "7-day free trial to explore platform mechanics.",
            features: [
                { icon: <Layers size={13} />, text: "7-day free grid bot" },
                { icon: <BarChart2 size={13} />, text: "Unlimited manual trading" },
                { icon: <Zap size={13} />, text: "Unlimited smart orders" },
                { icon: <Activity size={13} />, text: "30-day backtest" }
            ],
            highlight: false
        },
        {
            id: 'signature',
            name: "Fyd Signature",
            price: `$${getPrice(19)}`,
            period: "/month",
            desc: "Best for active investors growing their portfolio automatically.",
            badge: "Popular",
            features: [
                { icon: <Box size={13} />, text: "3 Fyd_Signature Bot Slots" },
                { icon: <Cpu size={13} />, text: "AI Assistant" },
                { icon: <MessageSquare size={13} />, text: "Crypto sentiment insights" },
                { icon: <BarChart2 size={13} />, text: "Unlimited manual trading" },
                { icon: <Briefcase size={13} />, text: "Futures Bots" },
                { icon: <Layers size={13} />, text: "Trailing Up & Down" },
                { icon: <BarChart2 size={13} />, text: "180-day backtest" },
                { icon: <ShieldCheck size={13} />, text: "Customer Support" }
            ],
            highlight: true
        },
        {
            id: 'advance',
            name: "Advance Plan",
            price: `$${getPrice(59)}`,
            period: "/month",
            desc: "For institutions & high-net-worth traders needing power.",
            badge: "Pro",
            features: [
                { icon: <Box size={13} />, text: "Unlimited Bot Slots" },
                { icon: <Cpu size={13} />, text: "Advanced AI insights" },
                { icon: <Repeat size={13} />, text: "Unlimited DCA Bots" },
                { icon: <Briefcase size={13} />, text: "Futures Bots" },
                { icon: <Layers size={13} />, text: "Unlimited Grid Bots" },
                { icon: <BarChart2 size={13} />, text: "365-day backtest" },
                { icon: <ShieldCheck size={13} />, text: "Priority Support" },
                { icon: <Sparkles size={13} />, text: "Estimated Returns" }
            ],
            highlight: false
        }
    ];

    return (
        <div className="w-full max-w-6xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-pulse" />
                    Step 2 of 5
                </div>
                <h1 className="text-4xl lg:text-5xl text-white mb-4">Choose your <span className="text-[#00FF9D]">plan</span></h1>
                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">Select the perfect plan based on your goals and trading style.</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center gap-4 bg-[#0A1014]/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3">
                    <span className={`text-sm transition-colors duration-300 ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                    <button
                        onClick={() => setWizardData({ ...wizardData, billingCycle: isAnnual ? 'monthly' : 'annual' })}
                        className="w-14 h-7 bg-[#1A2530] rounded-full relative p-1 transition-colors cursor-pointer border border-white/5 shadow-inner"
                    >
                        <div className={`w-5 h-5 bg-[#00FF9D] rounded-full transition-transform duration-300 ease-out flex items-center justify-center ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`}>
                            <div className="w-1 h-2.5 bg-black/30 rounded-full" />
                        </div>
                    </button>
                    <span className={`text-sm flex items-center gap-2 transition-colors duration-300 ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
                        Yearly
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full transition-all duration-300 ${isAnnual ? 'text-[#00FF9D] bg-[#00FF9D]/15 border border-[#00FF9D]/30' : 'text-gray-400 bg-white/5 border border-white/5'}`}>Save 20%</span>
                    </span>
                </div>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 items-stretch">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => setWizardData({ ...wizardData, plan: plan.id })}
                        className={`relative rounded-3xl p-8 flex flex-col cursor-pointer transition-all duration-300 border overflow-hidden group
                            ${plan.highlight
                                ? 'bg-gradient-to-b from-[#051A12] to-[#0A1014]'
                                : 'bg-[#0A1014]/60 backdrop-blur-sm hover:bg-[#0A1014]/90'
                            }
                            ${wizardData.plan === plan.id || plan.highlight
                                ? 'border-[#00FF9D]'
                                : 'border-white/8 hover:border-white/20'
                            }`}
                    >
                        {/* Removed Glow top */}

                        {/* Badge */}
                        {plan.badge && (
                            <div className={`absolute top-5 right-5 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${plan.highlight ? 'bg-[#00FF9D]/20 text-[#00FF9D] border border-[#00FF9D]/30' : 'bg-white/10 text-gray-300 border border-white/10'}`}>
                                {plan.badge}
                            </div>
                        )}

                        {/* Selected indicator (Top Left) */}
                        <div className={`w-6 h-6 rounded-full border mb-6 flex items-center justify-center transition-all duration-300
                            ${wizardData.plan === plan.id ? 'bg-[#00FF9D] border-[#00FF9D]' : 'bg-white/5 border-white/20 group-hover:border-[#00FF9D]/40'}`}
                        >
                            {wizardData.plan === plan.id && <Check size={14} className="text-black" strokeWidth={3} />}
                        </div>

                        <div className="mb-6 z-10">
                            <h3 className="flex items-center gap-1.5 text-xl text-white mb-2">
                                {plan.id === 'free' ? (
                                    <>Free <span className="bg-[#00FF9D]/10 text-[#00FF9D] text-[11px] leading-none px-2 py-1 rounded">Plan</span></>
                                ) : plan.name}
                            </h3>
                             <div className="flex items-baseline gap-1 mb-4">
                                <span className={`text-4xl tracking-tight ${wizardData.plan === plan.id ? 'text-[#00FF9D]' : 'text-white'}`}>{plan.price}</span>
                                <span className="text-gray-500 text-sm font-medium">{plan.period}</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed min-h-[40px]">{plan.desc}</p>
                        </div>

                        <div className="flex items-center gap-3 mb-6 opacity-60">
                            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
                            <span className={`text-[10px] uppercase tracking-widest ${plan.highlight ? 'text-[#00FF9D]' : 'text-gray-500'}`}>FEATURES</span>
                            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
                        </div>

                        <ul className="space-y-3.5 flex-1 z-10">
                            {plan.features.map((feat, i) => (
                                <li key={i} className={`flex items-start gap-3.5 text-sm transition-colors ${plan.highlight ? 'text-gray-200 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                    <span className={`shrink-0 mt-0.5 transition-colors ${plan.highlight ? 'text-[#00FF9D]' : 'text-gray-500 group-hover:text-gray-400'}`}>{feat.icon}</span>
                                    <span className="leading-tight">{feat.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="flex justify-center">
                 <button
                    onClick={onNext}
                    className="bg-[#00FF9D] text-black px-12 py-4 rounded-full text-base hover:bg-[#00cc7d] transition-all flex items-center gap-2 hover:-translate-y-1 w-full max-w-sm justify-center"
                >
                    Continue <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};
