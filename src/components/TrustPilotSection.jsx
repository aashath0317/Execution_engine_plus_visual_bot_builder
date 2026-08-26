import React from 'react';
import { Star } from 'lucide-react';

const TrustPilotSection = () => {
    return (
        <section className="py-24 bg-[#050B0D] relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#00FF9D]/5 blur-[100px] rounded-full -z-10"></div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center justify-center gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                        {/* Mock Trustpilot Logo Representation */}
                        <div className="flex items-center gap-2">
                            <Star size={40} className="fill-[#00b67a] text-[#00b67a]" />
                            <span className="text-3xl font-bold text-white tracking-tight">Trustpilot</span>
                        </div>

                        <div className="hidden sm:block h-10 w-px bg-white/10"></div>

                        <div className="flex flex-col items-center sm:items-start">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="bg-[#00b67a] p-1.5 rounded-md"><Star size={16} className="fill-white text-white" /></div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-400 mt-2"><span className="text-white font-bold">4.9/5</span> based on <span className="underline decoration-gray-600 cursor-pointer hover:text-[#00b67a] transition-colors">2,000+ reviews</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustPilotSection;
