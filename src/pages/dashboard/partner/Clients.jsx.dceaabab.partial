import React from 'react';
import Layout from './components/Layout';
import { Table } from './Dashboard'; // Reusing the table component

const Clients = () => {
    return (
        <Layout title="Clients">
            <div className="space-y-8">

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-5">
                        <p className="text-gray-400 text-sm mb-1">Total Earnings:</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-white">$4,250.00</span>
                            <span className="text-sm text-[#00FF9D] font-medium">(+12%)</span>
                        </div>
                    </div>
                    <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-5">
                        <p className="text-gray-400 text-sm mb-1">Pending Payout:</p>
                        <p className="text-xl font-bold text-white">$340.50</p>
                    </div>
                    <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-5">
                        <p className="text-gray-400 text-sm mb-1">Active Referrals:</p>
                        <p className="text-xl font-bold text-white">128</p>
                    </div>
                    <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-5">
                        <p className="text-gray-400 text-sm mb-1">Conversion Rate:</p>
                        <p className="text-xl font-bold text-white">4.2%</p>
                    </div>
                </div>

                {/* Clients Table Area */}
                <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-6 min-h-[500px]">
                    <h3 className="text-white font-bold mb-6 text-lg">Your Clients</h3>
                    <Table />
                </div>

            </div>
        </Layout>
    );
};

export default Clients;
