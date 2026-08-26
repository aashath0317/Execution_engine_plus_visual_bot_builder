import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ghost } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050B0D] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-[#00FF9D]/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[60vh] bg-[#00A3FF]/5 rounded-full blur-[150px]" />

            <div className="z-10 text-center px-6">
                <div className="flex justify-center mb-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl animate-bounce">
                        <Ghost size={64} className="text-[#00FF9D]" />
                    </div>
                </div>

                <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-4">
                    404
                </h1>

                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
                    Page Not Found
                </h2>

                <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 bg-[#00FF9D] text-black px-8 py-3 rounded-full font-bold hover:bg-[#00cc7d] transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)] mx-auto"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;
