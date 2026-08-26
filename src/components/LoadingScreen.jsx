import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1F2937]/80 backdrop-blur-lg overflow-hidden">
            <div className="w-full h-full relative flex items-center justify-center loading-fade-in">
                {/* --- Atmospheric Background Blobs --- */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>

                {/* --- Center Content --- */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="loader-container mb-6">
                        <svg className="logo-svg" viewBox="0 0 375 375" version="1.0" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <path id="logoPath"
                                    d="M 184.53125 191.890625 L 154.050781 191.890625 L 154.050781 226.949219 L 130.230469 254.410156 L 129.96875 254.410156 L 129.96875 168.121094 L 154.050781 191.890625 L 154.050781 168.121094 L 205.179688 168.121094 Z M 245.023438 122.300781 L 225.570312 144.664062 L 129.96875 144.664062 L 129.96875 120.582031 L 245.023438 120.582031 Z" />
                                <clipPath id="logoClip">
                                    <use href="#logoPath" />
                                </clipPath>
                            </defs>

                            <use href="#logoPath" className="logo-track" />

                            <g clipPath="url(#logoClip)">
                                <g className="wave-group">
                                    <path className="wave-shape wave-fill"
                                        d="M 0 0 Q 37.5 15 75 0 T 150 0 T 225 0 T 300 0 T 375 0 T 450 0 T 525 0 V 500 H 0 Z"
                                        transform="translate(-75, 0)" />
                                </g>
                            </g>
                        </svg>
                    </div>
                    <h1 className="text-white text-3xl font-black tracking-[0.2em] uppercase drop-shadow-[0_0_20px_rgba(0,255,157,0.2)]">
                        FYDBLOCK
                    </h1>
                    <div className="mt-4 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-bounce delay-200"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-bounce delay-300"></div>
                    </div>
                </div>
            </div>

            <style>{`
                .loading-fade-in {
                    animation: mainFadeIn 0.8s ease-out forwards;
                }
                @keyframes mainFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .loader-container {
                    width: 140px;
                    height: 140px;
                    position: relative;
                }
                .logo-svg {
                    width: 100%;
                    height: 100%;
                    overflow: hidden; /* Changed from visible to prevent box leak */
                }
                .logo-track {
                    fill: none;
                    stroke: #1a332a;
                    stroke-width: 2;
                }
                .wave-fill {
                    fill: #00ff94;
                    opacity: 0.9;
                }
                .wave-group {
                    animation: fillUp 4s ease-in-out infinite;
                }
                .wave-shape {
                    animation: ripple 2s linear infinite;
                }
                @keyframes fillUp {
                    0% { transform: translateY(380px); }
                    40% { transform: translateY(380px); }
                    80% { transform: translateY(-50px); }
                    90% { opacity: 1; }
                    100% { transform: translateY(-50px); opacity: 0; }
                }
                @keyframes ripple {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-150px); }
                }

                .blob {
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0; /* Star hidden for fade */
                    mix-blend-mode: screen;
                    animation-fill-mode: forwards;
                }
                .blob-1 { background: #00FF9D; top: -100px; left: -100px; animation: move-1 15s infinite alternate, blobFadeIn 2s 0.5s forwards; }
                .blob-2 { background: #0081ff; bottom: -150px; right: -100px; animation: move-1 18s infinite alternate-reverse, blobFadeIn 2s 1s forwards; }
                .blob-3 { background: #00FF9D; top: 40%; left: 40%; width: 300px; height: 300px; animation: move-3 12s infinite alternate, blobFadeIn 2s 1.5s forwards; }

                @keyframes blobFadeIn {
                    to { opacity: 0.12; }
                }

                @keyframes move-1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(200px, 100px) scale(1.2); } }
                @keyframes move-2 { from { transform: translate(0, 0) scale(1.1); } to { transform: translate(-200px, -50px) scale(0.9); } }
                @keyframes move-3 { from { transform: translate(-100px, 50px) scale(0.8); } to { transform: translate(150px, -100px) scale(1.1); } }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
