import React, { useState } from 'react';
import {
    Search,
    FileText,
    Video,
    Globe,
    Plus,
    Minus
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
const PartnerSupport = () => {
    // State to manage open/close FAQ items
    const [openFaq, setOpenFaq] = useState(0); // 0 is open by default matching image

    const faqs = [
        {
            question: "What are the commission rates?",
            answer: (
                <div className="space-y-2 text-gray-400 text-sm leading-relaxed">
                    <p>We offer a highly competitive 30% recurring commission on all paid plans for the lifetime of the customer.</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li><span className="text-gray-300">Pro Plan:</span> Earn ~$25.50 / month per user.</li>
                        <li><span className="text-gray-300">Starter Plan:</span> Earn ~$15.00 / month per user.</li>
                    </ul>
                </div>
            )
        },
        {
            question: "How do I claim my payout?",
            answer: "Payouts are processed automatically on the 15th of every month via your preferred payment method (PayPal or Bank Transfer) once you reach the minimum threshold of $50."
        },
        {
            question: "Can I refer myself?",
            answer: "No, self-referrals are strictly prohibited. The affiliate program is intended to reward you for referring new clients to FydBlock."
        }
    ];

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-8 w-full">

                {/* --- Search Banner --- */}
                <div className="bg-[#1D3B30] border border-[#00FF9D]/20 rounded-2xl p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#00FF9D]/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-2">How can we help you today?</h2>
                        <p className="text-gray-300 text-sm mb-8">
                            Get subscription and trading volume bonuses from users you refer, regardless of which exchange they trade on using FydBlock.
                        </p>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder='Search for articles(e.g., "How to reset password")'
                                className="w-full bg-white text-gray-900 rounded-lg py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#00FF9D]"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>
                </div>

                {/* --- Main Content Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Resources & FAQ) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Resource Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <ResourceCard icon={<FileText size={24} />} label="Documentation" />
                            <ResourceCard icon={<Video size={24} />} label="Video Tutorials" />
                            <ResourceCard icon={<Globe size={24} />} label="Community" />
                        </div>

                        {/* FAQ Section */}
                        <div className="pt-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border-b border-white/10 last:border-0">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                                        className="w-full py-6 flex justify-between items-center text-left hover:text-[#00FF9D] transition-colors group"
                                    >
                                        <span className="text-lg font-medium text-white group-hover:text-[#00FF9D]">{faq.question}</span>
                                        {openFaq === index ? <Minus size={20} /> : <Plus size={20} />}
                                    </button>

                                    {/* Animated Accordion Content */}
                                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-60 mb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="text-gray-400 text-sm">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column (Contact & History) */}
                    <div className="space-y-6">

                        {/* Contact Form */}
                        <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-white font-bold text-lg mb-6">Contact Support</h3>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Subject</label>
                                    <input type="text" className="w-full bg-white rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#00FF9D]" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Message</label>
                                    <textarea rows="4" className="w-full bg-white rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#00FF9D] resize-none"></textarea>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Priority</label>
                                    <select className="w-full bg-white rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#00FF9D]">
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                <button className="w-full bg-[#00FF9D] text-black font-bold py-3 rounded hover:bg-[#00cc7d] transition-colors mt-2">
                                    Submit Ticket
                                </button>
                            </form>
                        </div>

                        {/* Ticket History Widget */}
                        <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-white font-bold text-lg">Your Tickets</h3>
                                <span className="text-gray-500 text-xs">Recent 3</span>
                            </div>
                            <div className="space-y-4">
                                <TicketItem id="#2921" title="Payout Issue" status="Closed" date="Dec 01, 2023" />
                                <TicketItem id="#2945" title="API Question" status="Pending" date="Yesterday" />
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

// --- Sub-components ---

const ResourceCard = ({ icon, label }) => (
    <button className="bg-[#0A1012] border border-white/5 hover:border-[#00FF9D]/30 rounded-xl py-8 flex flex-col items-center justify-center gap-3 transition-all group">
        <div className="text-gray-400 group-hover:text-[#00FF9D] transition-colors">{icon}</div>
        <span className="text-sm font-medium text-white">{label}</span>
    </button>
);

const TicketItem = ({ id, title, status, date }) => (
    <div className="flex justify-between items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
        <div>
            <p className="text-white text-sm font-medium">{id} - {title}</p>
            <p className="text-gray-500 text-xs mt-1">{date}</p>
        </div>
        <span className={`text-xs ${status === 'Pending' ? 'text-yellow-500' : 'text-gray-400'}`}>
            {status}
        </span>
    </div>
);

export default PartnerSupport;
