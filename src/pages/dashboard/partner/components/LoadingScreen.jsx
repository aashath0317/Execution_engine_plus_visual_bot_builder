import React from 'react';
import { createPortal } from 'react-dom';

const LoadingScreen = ({ text = "Loading..." }) => {
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050B0D] overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#00FF9D]/20 rounded-full blur-[150px] opacity-20 mix-blend-screen"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[60vh] bg-[#00A3FF]/20 rounded-full blur-[150px] opacity-20 mix-blend-screen"></div>
            <div className="absolute bottom-[-30%] left-[20%] w-[60vw] h-[50vh] bg-[#00FF9D]/20 rounded-full blur-[180px] opacity-20"></div>

            {/* Custom Spinner */}
            <div className="relative w-16 h-16">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute top-0 left-1/2 w-1.5 h-4 -ml-[3px] rounded-full origin-[50%_200%]"
                        style={{
                            transform: `rotate(${i * 30}deg) translateY(-150%)`,
                            animation: `spinner-fade 1.2s linear infinite`,
                            animationDelay: `${-1.1 + (i * 0.1)}s`,
                            backgroundColor: '#00FF9D' // Base color
                        }}
                    />
                ))}
            </div>

            <style>{`
        @keyframes spinner-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>
        </div>,
        document.body
    );
};

export default LoadingScreen;
