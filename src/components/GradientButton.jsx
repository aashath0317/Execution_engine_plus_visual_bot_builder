import React from 'react';
import { ArrowRight } from 'lucide-react';

const GradientButton = ({
    children,
    onClick,
    className = "",
    icon: Icon = ArrowRight,
    href,
    type = "button",
    fullWidth = false,
    showIcon = true
}) => {
    const navigate = href ? (path) => window.location.href = path : null; // Fallback if no router context (though we usually have one)

    // If we want to use react-router navigate, we might need to Wrap this or pass navigate from parent
    // simpler to just pass onClick={() => navigate('/path')} from parent

    return (
        <button
            type={type}
            className={`group relative p-[1px] rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,255,157,0.2)] overflow-hidden ${fullWidth ? 'w-full' : ''} ${className}`}
            onClick={onClick}
        >
            <span className="absolute inset-0 bg-gradient-to-r from-[#00FF9D] to-[#00A3FF]"></span>
            <span className={`relative flex items-center justify-center gap-2 px-8 py-4 bg-[#050B0D] rounded-[10px] text-white font-bold group-hover:bg-opacity-90 transition-all ${fullWidth ? 'w-full' : ''}`}>
                {children}
                {showIcon && Icon && <Icon size={20} className="group-hover:translate-x-1 transition-transform text-[#00FF9D]" />}
            </span>
        </button>
    );
};

export default GradientButton;
