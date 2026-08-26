import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TableRow = ({ item, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <React.Fragment>
            {/* Desktop Row */}
            <tr className="hidden md:table-row border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{item.user}</td>
                <td className="px-6 py-4">{item.date}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${item.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                        {item.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-white">{item.earnings}</td>
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
                            <span className="text-gray-500 font-medium font-xs uppercase">Date</span>
                            <span className="text-gray-300">{item.date}</span>
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
                            <span className="text-white font-medium">{item.earnings}</span>
                        </div>
                    </td>
                )}
            </tr>
        </React.Fragment>
    );
};

const Table = ({ data = [] }) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-white/5 md:border-none md:rounded-none">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-white/5 text-gray-300 hidden md:table-header-group">
                    <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Earnings</th>
                    </tr>
                </thead>
                <tbody className="block md:table-row-group">
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <TableRow key={index} item={item} index={index} />
                        ))
                    ) : (
                        <tr className="block md:table-row w-full">
                            <td colSpan="4" className="px-6 py-4 text-center block md:table-cell border-b border-white/5 md:border-none">No clients found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
