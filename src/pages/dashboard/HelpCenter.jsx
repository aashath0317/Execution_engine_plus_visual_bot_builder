import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import {
    Search, ChevronRight, ChevronDown, BookOpen, Shield,
    Zap, CreditCard, MessageSquare, ExternalLink, PlayCircle,
    Send, MessageCircle, Twitter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState(null);

    const categories = [
        { id: 'start', title: 'Getting Started', icon: BookOpen, desc: 'Setup your account and first bot' },
        { id: 'bots', title: 'Trading Bots', icon: Zap, desc: 'Configure and optimize your strategies' },
        { id: 'billing', title: 'Account & Billing', icon: CreditCard, desc: 'Manage payments and subscriptions' },
        { id: 'security', title: 'Security', icon: Shield, desc: '2FA, API keys, and safety tips' },
    ];

    const faqs = [
        {
            q: "How do I connect my exchange API keys?",
            a: "To connect an exchange, go to 'My Exchanges' in the dashboard. Click 'Add Exchange', select your platform (e.g., Binance), and enter your API Key and Secret. Ensure 'Enable Trading' permissions are set on the exchange side."
        },
        {
            q: "Is my fund safe with FydBlock?",
            a: "Yes. FydBlock never holds your funds. Your assets remain on your exchange (e.g., Binance, Coinbase). We only use API keys to execute trades on your behalf. We recommend using IP whitelisting for added security."
        },
        {
            q: "Can I upgrade or downgrade my plan?",
            a: "Absolutely. You can change your subscription at any time from the 'Settings > Billing' section. Upgrades are effective immediately, while downgrades take effect at the end of your current billing cycle."
        },
        {
            q: "What happens if a trade fails?",
            a: "If a trade fails (e.g., insufficient funds or API error), the bot will retry up to 3 times. You will receive a notification immediately via the dashboard and email so you can take action."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <DashboardLayout>
            <Header title="Help Center" />

            {/* Hero Search Section */}
            <div className="bg-[#0e4d2d] rounded-2xl p-8 md:p-12 mb-8 border border-white/5 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-3">How can we help you?</h2>
                    <p className="text-gray-300 mb-8">Search our knowledge base or browse categories below</p>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search for articles, guides, and more..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#131B1F]/90 backdrop-blur-md border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-[#00FF9D] outline-none shadow-2xl transition-all group-hover:bg-[#1A2328]"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#00FF9D] transition-colors" size={20} />
                    </div>
                </div>
            </div>

            {/* Quick Categories */}
            <div className="max-w-5xl mx-auto mb-12">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Browse Topics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-[#131B1F] border border-white/5 rounded-xl p-5 hover:border-[#00FF9D]/30 hover:bg-[#1A2328] transition-all cursor-pointer group">
                            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-[#00FF9D] mb-4 group-hover:scale-110 transition-transform">
                                <cat.icon size={20} />
                            </div>
                            <h4 className="text-white font-bold mb-1">{cat.title}</h4>
                            <p className="text-gray-500 text-xs">{cat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

                {/* Popular FAQs */}
                <div className="lg:col-span-2">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <PlayCircle size={18} className="text-[#00FF9D]" /> Popular Articles
                    </h3>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`bg-[#131B1F] border ${openFaq === index ? 'border-[#00FF9D]/30' : 'border-white/5'} rounded-xl overflow-hidden transition-all duration-300`}
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-white text-sm font-medium">{faq.q}</span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-500 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-[#00FF9D]' : ''}`}
                                    />
                                </button>
                                <div
                                    className={`px-4 text-sm text-gray-400 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 py-4 border-t border-white/5' : 'max-h-0'}`}
                                >
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Support */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-[#1A2328] to-[#131B1F] border border-white/5 rounded-xl p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-white font-bold mb-2">Still need help?</h4>
                            <p className="text-gray-400 text-xs mb-4">Our support team is available 24/7 to assist you with any issues.</p>
                            <Link to="/feedback" className="inline-flex items-center gap-2 bg-white text-black font-bold text-xs py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                                <MessageSquare size={14} /> Contact Support
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[#131B1F] border border-white/5 rounded-xl p-5">
                        <h4 className="text-white font-bold text-sm mb-3">Community</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'Telegram Group', icon: Send, url: 'https://t.me/Fydblock' },
                                { name: 'Discord Server', icon: MessageCircle, url: '#' },
                                { name: 'Twitter Updates', icon: Twitter, url: '#' }
                            ].map((item, i) => (
                                <li key={i}>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-gray-400 text-xs hover:text-[#00FF9D] cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <item.icon size={16} />
                                            <span>{item.name}</span>
                                        </div>
                                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>

        </DashboardLayout>
    );
};

export default HelpCenter;
