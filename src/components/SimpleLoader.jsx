import React from 'react';
import { Loader2 } from 'lucide-react';

const SimpleLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050B0D]">
            <Loader2 className="animate-spin text-[#00FF9D]" size={40} />
        </div>
    );
};

export default SimpleLoader;
