import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#050B0D] pt-16 pb-8 text-gray-400 text-sm border-t border-white/5 relative z-10 font-sans">
            <div className="container mx-auto px-6">

                {/* Main Grid: 5 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">

                    {/* Column 1: Brand / Info */}
                    <div className="lg:col-span-1 space-y-4">
                        <Link to="/" className="inline-block mb-4">
                            <img src="/logo.png" alt="FydBlock" className="h-8" />
                        </Link>
                        <div className="space-y-1 text-xs leading-relaxed">
                            <p>© 2025. Fydblock Pvt Ltd.</p>
                            <p>PV: 00349799</p>
                            <p>Address: 432, Kayar Road, Eravur 2A, Batticaloa, Sri Lanka.</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <SocialIcon icon={<Facebook size={16} />} href="#" />
                            <SocialIcon icon={<Twitter size={16} />} href="#" />
                            <SocialIcon icon={<Linkedin size={16} />} href="https://www.linkedin.com/company/fydblock" />
                            <SocialIcon icon={<Instagram size={16} />} href="#" />
                        </div>
                    </div>

                    {/* Column 2: Platform */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/dashboard">Trading Bots</FooterLink>
                            <FooterLink to="/live-market">Trading Terminal</FooterLink>
                            <FooterLink to="/pricing">Pricing</FooterLink>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/company">About us</FooterLink>
                            <FooterLink to="/partner">Affiliate program</FooterLink>
                            <FooterLink to="/blog">Blog</FooterLink>
                            <FooterLink to="/faq">FAQ</FooterLink>
                            <FooterLink to="/contact">Contact info</FooterLink>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/terms_and_conditions">Terms & Conditions</FooterLink>
                            <FooterLink to="/privacy_policy">Privacy policy</FooterLink>
                            <FooterLink to="/cookie_policy">Cookie policy</FooterLink>
                            <FooterLink to="/affiliate_policy">Affiliate policy</FooterLink>
                            <FooterLink to="/refund_policy">Refund Policy</FooterLink>
                            <FooterLink to="/recurring_payment_policy">Recurring Payment Policy</FooterLink>
                        </ul>
                    </div>

                    {/* Column 5: Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Phone size={16} className="mt-1 text-[#00FF9D]" />
                                <span>+94705820510</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail size={16} className="mt-1 text-[#00FF9D]" />
                                <span>info@FydBlock.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-1 text-[#00FF9D] w-5 h-5 md:w-9 md:h-9" />
                                <span>432, Kayar Road, Eravur 2A, Batticaloa, Sri Lanka.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Supported Exchanges */}
                <div className="mb-12">
                    <h4 className="text-white font-bold mb-4">Supported Exchanges</h4>
                    <div className="flex flex-wrap gap-3">
                        {['Binance', 'OKX', 'Bitget', 'Bybit', 'Kraken', 'Coinbase', 'KuCoin', 'HTX', 'MEXC', 'Gate.io', 'Upbit', 'Bitstamp', 'Bitfinex', 'LBank', 'WhiteBIT', 'BitPay'].map((ex, i) => (
                            <span key={i} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:border-[#00FF9D]/50 transition-colors cursor-default">
                                {ex}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mb-12 text-[10px] leading-relaxed text-gray-500 text-justify">
                    <p>
                        Disclaimer: FydBlock is a SaaS platform that provides cryptocurrency and AI-powered trading tools and is not a regulated financial institution or investment advisor. Cryptocurrency trading involves significant risk, and past performance is not indicative of future results. Any profits, screenshots, or performance data displayed on the FydBlock platform or its marketing materials are for illustrative purposes only and may be hypothetical or exaggerated. By connecting your exchange account and using FydBlock’s software, you acknowledge that all trading decisions and risks are your own, and FydBlock is not responsible for any losses, API issues, exchange errors, or damages of any kind arising from the use of our services. Content or strategies shared by community members do not constitute financial advice from FydBlock. By using our platform, you accept these risks and agree to hold FydBlock harmless from any liabilities. Please review our Terms of Service and Risk Disclosure, and consult a qualified financial or legal professional for personalized advice.
                    </p>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 text-center text-xs text-gray-500">
                    <p>Copyright 2022 © fydblock, All Right Reserved</p>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <li>
        <Link to={to} className="hover:text-[#00FF9D] transition-colors block">
            {children}
        </Link>
    </li>
);

const SocialIcon = ({ icon, href }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00FF9D] hover:text-black transition-all cursor-pointer"
    >
        {icon}
    </a>
);

export default Footer;
