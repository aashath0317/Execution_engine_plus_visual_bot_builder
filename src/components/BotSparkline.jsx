import React, { useId } from 'react';

// --- SPARKLINE COMPONENT (Mini Chart) ---
const BotSparkline = ({ color, data = [], delay = 0 }) => {
    const id = useId();
    const gradientId = `gradient-${id}`;
    const maskId = `mask-${id}`;
    const maskGradientId = `maskGradient-${id}`;
    const filterId = `neonGlow-${id}`;

    // 1. Handle Empty Data
    if (!data || data.length < 2) {
        return (
            <div className="h-12 w-full mt-4 mb-4 relative flex items-center justify-center opacity-30">
                <div className="w-full h-[2px] bg-white/10 border-t border-dashed border-gray-500"></div>
            </div>
        );
    }

    // 2. Prepare Data Points
    const width = 100;
    const height = 40;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = height - ((d - min) / range) * height; // Invert Y
        return { x, y };
    });

    // 3. Fluid Curve Algorithm (Catmull-Rom / Tangent-based)
    const getControlPoint = (current, previous, next, reverse) => {
        const p = previous || current;
        const n = next || current;
        const smoothing = 0.2; // 0 to 1

        // Properties of the opposed line
        const lengthX = n.x - p.x;
        const lengthY = n.y - p.y;

        // If is end-control-point, add PI to the angle to go backward
        const angle = Math.atan2(lengthY, lengthX) + (reverse ? Math.PI : 0);
        const length = Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)) * smoothing;

        return {
            x: current.x + Math.cos(angle) * length,
            y: current.y + Math.sin(angle) * length
        };
    };

    const getSmoothPath = (points) => {
        if (points.length < 2) return "";

        let path = `M ${points[0].x},${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1]; // Previous
            const p1 = points[i];     // Current
            const p2 = points[i + 1]; // Next
            const p3 = points[i + 2]; // Next-Next

            const cp1 = getControlPoint(p1, p0, p2, false);
            const cp2 = getControlPoint(p2, p1, p3, true);

            path += ` C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y}`;
        }
        return path;
    };

    const pathData = getSmoothPath(points);
    const lastPoint = points[points.length - 1];

    return (
        <div className="h-12 w-full relative">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>

                    {/* Fading Mask for Start and End */}
                    <mask id={maskId}>
                        <linearGradient id={maskGradientId} x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="black" stopOpacity="0" />
                            <stop offset="15%" stopColor="white" stopOpacity="1" />
                            <stop offset="85%" stopColor="white" stopOpacity="1" />
                            <stop offset="100%" stopColor="black" stopOpacity="0" />
                        </linearGradient>
                        <rect width="100" height="40" fill={`url(#${maskGradientId})`} />
                    </mask>

                    {/* Glow Filter */}
                    <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <g mask={`url(#${maskId})`}>
                    {/* Filled Area */}
                    <path
                        d={`${pathData} L ${width},${height} L 0,${height} Z`}
                        fill={`url(#${gradientId})`}
                        stroke="none"
                        style={{
                            animation: `reveal-chart-area 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                            animationDelay: `${delay}ms`,
                            opacity: 0,
                            transformOrigin: 'bottom'
                        }}
                    />

                    {/* Main Line with Enhanced Glow */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        filter={`url(#${filterId})`}
                        style={{
                            strokeDasharray: 400,
                            strokeDashoffset: 400,
                            animation: `draw-chart-line 2s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                            animationDelay: `${delay}ms`,
                            filter: `drop-shadow(0 0 4px ${color})`
                        }}
                    />
                </g>
            </svg>

            {/* Pulse Dot */}
            <div
                className="absolute w-2.5 h-2.5 rounded-full shadow-[0_0_15px] z-10 animate-pulse border-2 border-[#0A1014]"
                style={{
                    backgroundColor: color,
                    boxShadow: `0 0 15px ${color}`,
                    left: `${lastPoint.x}%`,
                    top: `${(lastPoint.y / height) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                }}
            />
        </div>
    );
};

export default BotSparkline;
