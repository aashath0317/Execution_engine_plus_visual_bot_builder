import React, { useState, useEffect } from 'react';
import Table from './components/Table';
import DashboardLayout from '../../../components/DashboardLayout';
import API_BASE_URL from '../../../config';

const PartnerClients = () => {
    const [stats, setStats] = useState({
        total_earnings: 0,
        pending_payout: 0,
        active_referrals: 0,
        conversion_rate: "0%"
    });
    // Helper to sort by status
    const sortClients = (data) => {
        const statusOrder = { 'Active': 1, 'Pending': 2 };
        return [...data].sort((a, b) => {
            const orderA = statusOrder[a.status] || 3;
            const orderB = statusOrder[b.status] || 3;
            return orderA - orderB;
        });
    };

    const [clients, setClients] = useState(sortClients([
        { id: 1, user: "Michael Chen", email: "m.chen@example.com", date: "Oct 12, 2023", status: "Active", plan: "Pro Plan", earnings: "$25.50" },
        { id: 2, user: "Sarah Williams", email: "sarah.w@example.com", date: "Nov 05, 2023", status: "Active", plan: "Starter Plan", earnings: "$15.00" },
        { id: 3, user: "David Rodriguez", email: "david.rod@example.com", date: "Nov 28, 2023", status: "Pending", plan: "Trial", earnings: "$0.00" },
        { id: 4, user: "Emma Thompson", email: "emma.t@example.com", date: "Dec 10, 2023", status: "Active", plan: "Pro Plan", earnings: "$25.50" },
        { id: 5, user: "James Wilson", email: "j.wilson99@example.com", date: "Jan 15, 2024", status: "Active", plan: "Starter Plan", earnings: "$15.00" }
    ]));

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Fetch Stats
                const statsRes = await fetch(`${API_BASE_URL}/partner/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch Clients
                const clientsRes = await fetch(`${API_BASE_URL}/partner/clients`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (clientsRes.ok) {
                    const clientsData = await clientsRes.json();
                    if (clientsData && clientsData.length > 0) {
                        setClients(sortClients(clientsData));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch client data:", err);
            }
        };
        fetchData();
    }, []);

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-8 w-full">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 lg:pb-0">
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

                {/* Clients Table Area */}
                <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-4 sm:p-6 md:min-h-[500px]">
                    <h3 className="text-white font-bold mb-4 sm:mb-6 text-lg px-2 sm:px-0">Your Clients</h3>
                    <Table data={clients} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PartnerClients;
