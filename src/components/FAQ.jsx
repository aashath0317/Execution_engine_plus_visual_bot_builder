import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

const AccordionItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/5">
            <button className="w-full py-6 flex items-center justify-between text-left hover:text-[#00FF9D] transition-colors group" onClick={() => setIsOpen(!isOpen)}>
                <span className="font-medium text-lg text-gray-200 group-hover:text-[#00FF9D]">{question}</span>
                <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00FF9D]' : 'text-gray-500'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}><p className="text-gray-400 leading-relaxed">{answer}</p></div>
        </div>
    );
};

const FAQ = ({ showContactLink = true }) => {
    const navigate = useNavigate();
    return (
        <section className="py-24 relative z-10" id="faq">
            <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">FydBlock <br />Frequently Asked Questions</h2>
                    <p className="text-gray-400 mb-8">Can't find the answer you're looking for? Reach out to our customer support team.</p>
                    {showContactLink && (
                        <button onClick={() => navigate('/contact')} className="text-[#00FF9D] font-bold flex items-center gap-2 hover:gap-4 transition-all hover:text-white">Contact Support <ArrowRight size={20} /></button>
                    )}
                </div>
                <div className="lg:col-span-8 space-y-4">
                    <AccordionItem question="Is my money safe with FydBlock?" answer="Absolutely. Your funds always remain on your exchange account (like Binance or Coinbase). FydBlock simply sends trade commands via API keys which you configure to disable withdrawal permissions." />
                    <AccordionItem question="Do I need coding skills to use the bots?" answer="No! FydBlock is designed for everyone. We offer pre-configured templates and a visual strategy builder. You can start a bot in 3 clicks." />
                    <AccordionItem question="Which exchanges do you support?" answer="We support over 15 major exchanges including Binance, Kraken, Coinbase Pro, KuCoin, OKX, Bybit, and more." />
                    <AccordionItem question="Can I try it for free?" answer="Yes, we offer a 7-day free trial on our Pro plan so you can test all features risk-free. No credit card required." />
                </div>
            </div>
        </section>
    );
};

export default FAQ;
