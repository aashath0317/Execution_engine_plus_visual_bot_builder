import React from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false,
    isLoading = false
}) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0A1014] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl scale-100">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDangerous ? 'bg-red-500/10 text-red-500' : 'bg-[#00FF9D]/10 text-[#00FF9D]'}`}>
                        <AlertTriangle size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg
                                ${isDangerous
                                    ? 'bg-[#EF4444] hover:bg-red-600 text-white shadow-red-500/20'
                                    : 'bg-[#00FF9D] hover:bg-[#00cc7d] text-black shadow-[#00FF9D]/20'
                                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
