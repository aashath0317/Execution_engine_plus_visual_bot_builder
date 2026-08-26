import React from 'react';

const PerformanceChart = ({ isConnected = true, themeColor = '#00FF9D', data = [] }) => {
    // Default Data if none provided (Maintenance/Mock)
    if (!data || data.length === 0) {
        data = [
            { value: 1000, date: '1' }, { value: 1200, date: '5' }, { value: 1100, date: '10' },
            { value: 1400, date: '15' }, { value: 1300, date: '20' }, { value: 1600, date: '25' },
            { value: 1500, date: '30' }, { value: 1800, date: '35' }, { value: 2000, date: '40' },
            { value: 1900, date: '45' }, { value: 2200, date: '50' }, { value: 2100, date: '55' },
            { value: 2400, date: '60' }, { value: 2300, date: '65' }, { value: 2500, date: '70' }
        ];
    }

    // 2. Prepare Data Points for SVG
    const width = 800;
    const height = 300;

    // Find range
    const values = data.map(d => d.value);
    const minVal = Math.min(...values) * 0.95; // 5% buffer
    const maxVal = Math.max(...values) * 1.05;
    const range = maxVal - minVal || 1; // Avoid divide by zero

    // Map data to coordinates
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - minVal) / range) * height;
        return `${x},${y}`;
    });

    const linePath = `M ${points.join(' L ')}`;
    // Gradient mask area
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return (
        <div className="w-full h-64 relative flex flex-col">
            <div className="flex-1 relative border-l border-white/5 ml-4 overflow-hidden">
                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                    <div key={i} className="absolute w-full border-t border-white/5" style={{ top: `${t * 100}%` }}></div>
                ))}

                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute inset-0" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="partnerChartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={themeColor} stopOpacity="0.1" />
                            <stop offset="100%" stopColor={themeColor} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#partnerChartGradient)" stroke="none" />
                    <path d={linePath} fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(0,255,157,0.2)]" />
                </svg>
            </div>
        </div>
    );
};

export default PerformanceChart;
