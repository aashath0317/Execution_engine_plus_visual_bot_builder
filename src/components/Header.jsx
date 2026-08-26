import React from 'react';
import { useTrading } from '../context/TradingContext';

const Header = ({ title, onOpenCreateBot }) => {
    const { isPaperTrading } = useTrading();
    const themeTextClass = 'text-[#00FF9D]';

    return (
        <header className="flex justify-between items-center mb-8 shrink-0 relative z-10">
            <div>
                <h1 className={`text-2xl md:text-3xl font-bold ${themeTextClass} transition-colors duration-300`}>
                    {title}
                </h1>
                {isPaperTrading && (
                    <span className="text-xs text-gray-400 mt-1 block">Testnet Environment</span>
                )}
            </div>

            {/* Mobile-only action button if needed, or completely remove right side */}
            {/* keeping empty for now or we can remove the entire right side div if not needed */}
        </header>
    );
};

export default Header;
