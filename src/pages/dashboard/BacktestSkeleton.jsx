import React from 'react';

const SkeletonShimmer = ({ className = '' }) => (
    <div className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <style>{`
            @keyframes shimmer {
                100% {
                    transform: translateX(100%);
                }
            }
        `}</style>
    </div>
);

export const BacktestSkeleton = () => (
    <div className="animate-in fade-in duration-500 pb-24">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <SkeletonShimmer className="w-16 h-5 rounded" />
                <span className="text-gray-600 text-lg font-medium">{'>'}</span>
                <SkeletonShimmer className="w-48 h-6 rounded" />
            </div>
            <SkeletonShimmer className="w-24 h-8 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column (Chart & Lists) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Session Header Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 h-32">
                        <SkeletonShimmer className="w-32 h-3 rounded mb-4" />
                        <SkeletonShimmer className="w-48 h-8 rounded-lg" />
                    </div>
                    <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 h-32">
                        <SkeletonShimmer className="w-32 h-3 rounded mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            <SkeletonShimmer className="w-full h-8 rounded-lg" />
                            <SkeletonShimmer className="w-full h-8 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Price Ticker Skeleton */}
                <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 h-32 flex items-center justify-between">
                    <div>
                        <SkeletonShimmer className="w-24 h-3 rounded mb-2" />
                        <SkeletonShimmer className="w-40 h-12 rounded-lg" />
                    </div>
                    <div className="flex gap-4">
                        <SkeletonShimmer className="w-20 h-10 rounded-lg" />
                        <SkeletonShimmer className="w-20 h-10 rounded-lg" />
                    </div>
                </div>

                {/* Chart Skeleton */}
                <div className="bg-[#131517] border border-white/5 rounded-3xl p-2 h-[450px]">
                    <SkeletonShimmer className="w-full h-full rounded-2xl" />
                </div>

                {/* Lists Skeleton */}
                <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 h-64">
                    <SkeletonShimmer className="w-40 h-6 rounded mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <SkeletonShimmer key={i} className="w-full h-10 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column (Controls) */}
            <div className="space-y-6">
                <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 h-[500px]">
                    <SkeletonShimmer className="w-32 h-6 rounded mb-6" />
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <SkeletonShimmer className="w-20 h-3 rounded" />
                            <SkeletonShimmer className="w-full h-12 rounded-xl" />
                        </div>
                        <SkeletonShimmer className="w-full h-12 rounded-xl" />
                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <SkeletonShimmer className="w-full h-10 rounded-lg" />
                            <SkeletonShimmer className="w-full h-10 rounded-lg" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 h-48">
                    <SkeletonShimmer className="w-32 h-4 rounded mb-4" />
                    <SkeletonShimmer className="w-full h-24 rounded-xl" />
                </div>
            </div>
        </div>
    </div>
);

export default BacktestSkeleton;
