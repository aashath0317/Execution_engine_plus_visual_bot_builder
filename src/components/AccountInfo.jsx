import React from 'react';

const AccountInfo = () => {
    return (
        <div className="bg-[#0A1014] border-t border-white/5 p-4 w-full">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {/* Total Equity */}
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-[10px] font-medium">Total Equity</span>
                    <span className="text-white text-sm font-bold">$0.00</span>
                </div>

                {/* Account Health */}
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-[10px] font-medium">Account Health</span>
                    <span className="text-white text-sm font-bold">—</span>
                </div>

                {/* Account Leverage */}
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-[10px] font-medium">Account Leverage</span>
                    <span className="text-white text-sm font-bold">—</span>
                </div>

                {/* Open Positions */}
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-[10px] font-medium">Open Positions</span>
                    <span className="text-white text-sm font-bold">0</span>
                </div>

                {/* Margin Available */}
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-[10px] font-medium">Margin Available</span>
                    <span className="text-[#00FF9D] text-sm font-bold">$0.00</span>
                </div>

                {/* Margin Used */}
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-[10px] font-medium">Margin Used</span>
                    <span className="text-white text-sm font-bold">$0.00</span>
                </div>
            </div>
        </div>
    );
};

export default AccountInfo;
