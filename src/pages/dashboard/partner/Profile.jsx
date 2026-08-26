import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout';

const Profile = () => {
    return (
        <DashboardLayout>
            <div className="animate-fade-in max-w-3xl w-full">
                <div className="bg-[#0A1012] border border-white/5 rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">First Name</label>
                                <input type="text" value="Demo" disabled className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Last Name</label>
                                <input type="text" value="User" disabled className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Email Address</label>
                            <input type="email" value="demo@fydblock.com" disabled className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
