import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ id, message, type, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, onClose, duration]);

    const bgColors = {
        success: 'bg-[#0A1014] border-[#00FF9D]',
        error: 'bg-[#0A1014] border-red-500',
        info: 'bg-[#0A1014] border-blue-500',
    };

    const icons = {
        success: <CheckCircle className="text-[#00FF9D]" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
    };

    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${bgColors[type] || bgColors.info} shadow-2xl min-w-[300px] max-w-md animate-in slide-in-from-right-full duration-300 relative overflow-hidden group`}>
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-10 ${type === 'success' ? 'bg-[#00FF9D]' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />

            <div className="relative z-10">
                {icons[type] || icons.info}
            </div>

            <p className="flex-1 text-sm font-medium text-white relative z-10">
                {message}
            </p>

            <button
                onClick={() => onClose(id)}
                className="text-gray-500 hover:text-white transition-colors relative z-10"
            >
                <X size={16} />
            </button>

            {/* Progress Bar (Optional) */}
            <div
                className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-[#00FF9D]' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{
                    width: '100%',
                    animation: `shrink ${duration}ms linear forwards`
                }}
            />
            <style jsx="true">{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default Toast;
