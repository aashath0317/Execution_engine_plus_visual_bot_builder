import React, { useState, useEffect } from 'react';
import PerformanceChart from './components/PerformanceChart';
import Table from './components/Table';
import DashboardLayout from '../../../components/DashboardLayout';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import API_BASE_URL from '../../../config';

const DashboardTableRow = ({ item, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <React.Fragment>
            {/* Desktop Row */}
            <tr className="hidden md:table-row border-b border-white/5 hover:bg-white/5 w-full mb-1">
                <td className="px-4 py-4 font-medium text-white min-w-0">
                    <div className="break-words leading-tight">
                        {item.user}
                    </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">{item.country}</td>
                <td className="px-4 py-4 min-w-0">
                    <div className="break-words leading-tight text-gray-400">
                        {item.date}
                    </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">{item.plan}</td>
                <td className="px-4 py-4 min-w-0">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border border-transparent ${item.status === 'Active' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' : item.status === 'Pending' ? 'bg-[#FFB000]/10 text-[#FFB000]' : 'bg-red-500/10 text-red-500'}`}>
                        {item.status}
                    </span>
                </td>
                <td className="px-4 py-4 text-white hidden md:table-cell">{item.earnings}</td>
            </tr>

            {/* Mobile Row (Accordion) */}
            <tr className="md:hidden flex flex-col w-full border-b border-light-gray/5 last:border-0 relative">
                <td className="flex items-center justify-between w-full py-4 px-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-3 font-bold text-white text-base">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            item.status === 'Active' ? 'bg-[#00FF9D]' :
                            item.status === 'Pending' ? 'bg-[#FFB000]' :
                            'bg-red-500'
                        }`} />
                        {item.user}
                    </div>
                    <button className="text-gray-400 p-1.5 bg-[#1A1F21] rounded-full hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </td>
                
                {/* Expanded Content */}
                {isExpanded && (
                    <td className="flex flex-col gap-3 px-4 pb-4 pt-2 bg-[#1A1F21]/30">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium font-xs uppercase">Country</span>
                            <span className="text-gray-300">{item.country || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium font-xs uppercase">Date</span>
                            <span className="text-gray-300">{item.date}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium font-xs uppercase">Plan</span>
                            <span className="text-gray-300">{item.plan || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium font-xs uppercase">Status</span>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium border border-transparent ${item.status === 'Active' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' :
                                item.status === 'Pending' ? 'bg-[#FFB000]/10 text-[#FFB000]' :
                                    'bg-red-500/10 text-red-500'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium font-xs uppercase">Earnings</span>
                            <span className="text-white font-medium">{item.earnings || '-'}</span>
                        </div>
                    </td>
                )}
            </tr>
        </React.Fragment>
    );
};

const PartnerDashboard = () => {
    const [user, setUser] = useState({ name: 'Partner', plan: 'Free Plan' });
    const [referralLink, setReferralLink] = useState('Fydblock.com/partner/...');
    const [isCopied, setIsCopied] = useState(false);
    const [stats, setStats] = useState({
        total_earnings: 0,
        pending_payout: 0,
        active_referrals: 0,
        conversion_rate: "0%"
    });
    const [referralsList, setReferralsList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // 1. Fetch User
                const userRes = await fetch(`${API_BASE_URL}/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const data = await userRes.json();
                    const userObj = data.user || data;
                    const fullName = userObj.full_name ||
                        (userObj.first_name ? `${userObj.first_name} ${userObj.last_name || ''}` : null) ||
                        userObj.username ||
                        'Partner';
                    const finalName = fullName.replace(/undefined/g, '').trim();
                    const plan = userObj.plan || 'Free Plan';
                    setUser({ name: finalName, plan: plan });

                    // Generate default link (can be overridden by stats)
                    const slug = finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setReferralLink(`https://fydblock.com/r/${slug}`);
                }

                // 2. Fetch Partner Stats
                const statsRes = await fetch(`${API_BASE_URL}/partner/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                    if (statsData.referral_link) {
                        setReferralLink(statsData.referral_link);
                    }
                }

                // 3. Fetch Clients (Referrals)
                const clientsRes = await fetch(`${API_BASE_URL}/partner/clients`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (clientsRes.ok) {
                    const clientsData = await clientsRes.json();
                    
                    // Sort by status: Active -> Pending -> Inactive
                    const statusOrder = { 'Active': 1, 'Pending': 2 };
                    const sortedClients = [...clientsData].sort((a, b) => {
                        const orderA = statusOrder[a.status] || 3;
                        const orderB = statusOrder[b.status] || 3;
                        return orderA - orderB;
                    });
                    
                    setReferralsList(sortedClients);
                }

            } catch (err) {
                console.error("Failed to fetch partner data:", err);
            }
        };
        fetchData();
    }, []);

    const chartData = [
        { value: 2000, date: '1' }, { value: 2400, date: '5' }, { value: 2100, date: '10' },
        { value: 2600, date: '15' }, { value: 2300, date: '20' }, { value: 1800, date: '25' },
        { value: 2500, date: '30' }, { value: 3000, date: '35' }, { value: 2800, date: '40' },
        { value: 2200, date: '45' }, { value: 2600, date: '50' }, { value: 3200, date: '55' },
        { value: 2800, date: '60' }, { value: 3400, date: '65' }, { value: 4000, date: '70' }
    ];

    return (
        <DashboardLayout>
            <div className="animate-fade-in w-full pb-20">
                {/* 1. Share Link Section */}
                <section className="bg-gradient-to-r from-[#1A3D33] to-[#0A1513] border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-medium text-white mb-4 sm:mb-6">Share your unique link & Earn. Get 40% Recurring.</h2>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl">
                            <div className="flex-1 bg-[#050B0D]/50 border border-white/10 rounded-xl px-4 py-3.5 text-gray-300 font-mono text-sm flex items-center overflow-hidden">
                                <span className="truncate">{referralLink}</span>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(referralLink);
                                    setIsCopied(true);
                                    setTimeout(() => setIsCopied(false), 2000);
                                }}
                                className={`font-bold w-full sm:w-auto justify-center px-8 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${isCopied ? 'bg-[#00FF9D] text-black sm:scale-105' : 'bg-white text-black hover:bg-gray-200'}`}
                            >
                                {isCopied ? <Check size={18} /> : <Copy size={18} />}
                                {isCopied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2. Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 lg:pb-0">
                    {/* Available Earnings */}
                    <div className="w-full bg-[#0A1012] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-center overflow-hidden">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 truncate">Total Earnings:</p>
                        <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap xl:flex-nowrap">
                            <h3 className="text-[15px] sm:text-2xl font-bold text-white truncate max-w-full">
                                ${(parseFloat(stats.total_earnings) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <span className="text-[#00FF9D] text-xs whitespace-nowrap hidden sm:inline-block">(+12%)</span>
                        </div>
                    </div>

                    {/* Pending Payout */}
                    <div className="w-full bg-[#0A1012] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-center overflow-hidden">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 truncate">Pending Payout:</p>
                        <h3 className="text-[15px] sm:text-2xl font-bold text-white truncate max-w-full">
                            ${(parseFloat(stats.pending_payout) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>

                    {/* Active Referrals */}
                    <div className="w-full bg-[#0A1012] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-center overflow-hidden">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 truncate">Active Referrals:</p>
                        <h3 className="text-[15px] sm:text-2xl font-bold text-white truncate max-w-full">{stats.active_referrals || 0}</h3>
                    </div>

                    {/* Conversion Rate */}
                    <div className="w-full bg-[#0A1012] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-center overflow-hidden">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 truncate">Conversion Rate:</p>
                        <h3 className="text-[15px] sm:text-2xl font-bold text-white truncate max-w-full">{stats.conversion_rate || '0%'}</h3>
                    </div>
                </div>

                {/* 3. Revenue Performance Chart */}
                <section className="bg-[#0A1012] border border-white/10 rounded-3xl p-5 sm:p-8 mb-8 overflow-hidden">
                    <h3 className="text-lg font-bold text-white mb-6">Revenue Performance <span className="text-gray-500 text-sm font-normal block sm:inline mt-1 sm:mt-0">(Last 30 Days)</span></h3>
                    <div className="w-full -ml-2 sm:ml-0 overflow-x-auto custom-scrollbar pb-2">
                        <div className="min-w-[400px] w-full">
                            <PerformanceChart data={chartData} themeColor="#00FF9D" />
                        </div>
                    </div>
                </section>

                {/* 4. Recent Referrals Table */}
                <section className="bg-[#0A1012] border border-white/10 rounded-3xl p-5 sm:p-8">
                    <h3 className="text-xl font-bold text-white mb-6">Your Clients</h3>
                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase bg-[#1A1F21] text-gray-300 rounded-md hidden md:table-header-group">
                                <tr>
                                    <th className="px-3 md:px-4 py-3 font-bold rounded-l-md font-medium tracking-wider">NAME</th>
                                    <th className="px-3 md:px-4 py-3 font-bold hidden md:table-cell font-medium tracking-wider">COUNTRY</th>
                                    <th className="px-3 md:px-4 py-3 font-bold font-medium tracking-wider">DATE</th>
                                    <th className="px-3 md:px-4 py-3 font-bold hidden md:table-cell font-medium tracking-wider">PLAN</th>
                                    <th className="px-3 md:px-4 py-3 font-bold rounded-r-md md:rounded-none font-medium tracking-wider">STATUS</th>
                                    <th className="px-3 md:px-4 py-3 font-bold hidden md:table-cell rounded-r-md font-medium tracking-wider">EARNINGS</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300 text-[13px] sm:text-sm pt-2 block md:table-row-group">
                                {referralsList.length > 0 ? (
                                    referralsList.map((item, index) => (
                                        <DashboardTableRow key={index} item={item} index={index} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-4 text-center text-gray-500 block md:table-cell">
                                            No clients found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            {/* Background Blob Effect */}
            <div className="fixed top-0 right-0 w-[50vw] h-[50vh] bg-[#00FF9D]/5 rounded-full blur-[150px] pointer-events-none z-0" />
        </DashboardLayout>
    );
};

export default PartnerDashboard;
