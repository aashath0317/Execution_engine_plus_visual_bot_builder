import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft } from 'lucide-react'; import DashboardLayout from '../../../components/DashboardLayout';

const ComingSoon = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="w-full relative z-10 flex-col items-center justify-center min-h-[60vh] flex">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-[#00FF9D]/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[60vh] bg-[#00A3FF]/5 rounded-full blur-[150px]" />

                <div className="z-10 text-center px-6">
                    <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-6">
                        Coming Soon
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
                        We are working hard to bring you this page. Stay tuned for something amazing!
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
        </DashboardLayout>
    );
};

export default ComingSoon;
