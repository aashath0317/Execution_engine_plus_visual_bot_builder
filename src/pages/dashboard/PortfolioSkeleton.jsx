import React from 'react';

// Skeleton shimmer animation
const SkeletonShimmer = ({ className = '' }) => (
    <div className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }
        `}} />
    </div>
);

// Balance Card Skeleton
export const BalanceCardSkeleton = () => (
    <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden h-full min-h-[180px]">
        <div className="flex justify-between items-start z-10">
            <div className="flex items-center gap-2">
                <SkeletonShimmer className="w-4 h-4 rounded" />
                <SkeletonShimmer className="w-16 h-4 rounded" />
            </div>
            <SkeletonShimmer className="w-4 h-4 rounded" />
        </div>

        <div className="z-10 mt-4">
            <SkeletonShimmer className="w-48 h-10 rounded-lg mb-2" />
            <div className="flex items-center gap-3">
                <SkeletonShimmer className="w-16 h-6 rounded-lg" />
                <SkeletonShimmer className="w-20 h-4 rounded" />
            </div>
        </div>

        <div className="mt-auto pt-6 flex items-center justify-between z-10 w-full">
            <SkeletonShimmer className="w-12 h-3 rounded" />
            <div className="flex items-center gap-1">
                <SkeletonShimmer className="w-6 h-6 rounded-full" />
                <SkeletonShimmer className="w-6 h-6 rounded-full" />
                <SkeletonShimmer className="w-6 h-6 rounded-full" />
            </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF9D]/5 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
    </div>
);

// Asset Card Skeleton
export const AssetCardSkeleton = () => (
    <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 flex flex-col justify-between h-full min-h-[160px] relative overflow-hidden">
        <div className="flex justify-between items-start z-10 mb-2 px-1">
            <div className="flex items-center gap-3">
                <SkeletonShimmer className="w-8 h-8 rounded-full" />
                <div>
                    <SkeletonShimmer className="w-20 h-4 rounded mb-1" />
                    <SkeletonShimmer className="w-12 h-3 rounded" />
                </div>
            </div>
            <SkeletonShimmer className="w-4 h-4 rounded" />
        </div>

        <div className="z-10 mb-4 px-1">
            <div className="flex items-center gap-3 mb-1">
                <SkeletonShimmer className="w-32 h-8 rounded-lg" />
                <SkeletonShimmer className="w-16 h-6 rounded-lg" />
            </div>
            <SkeletonShimmer className="w-24 h-3 rounded" />
        </div>

        <div className="h-16 w-full mt-auto z-0">
            <SkeletonShimmer className="w-full h-full rounded" />
        </div>
    </div>
);

// Add Action Card Skeleton
export const AddActionCardSkeleton = () => (
    <div className="h-full min-h-[180px] rounded-3xl border border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center">
        <SkeletonShimmer className="w-12 h-12 rounded-full mb-3" />
    </div>
);

// Portfolio Chart Skeleton
export const PortfolioChartSkeleton = () => (
    <div className="bg-[#131517] border border-white/5 rounded-3xl p-6 col-span-1 lg:col-span-2 min-h-[400px] flex flex-col h-full relative">
        <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
                <SkeletonShimmer className="w-5 h-5 rounded" />
                <SkeletonShimmer className="w-40 h-5 rounded" />
            </div>
            <SkeletonShimmer className="w-4 h-4 rounded" />
        </div>

        <div className="flex-1 w-full mt-4">
            <SkeletonShimmer className="w-full h-full rounded-lg" />
        </div>
    </div>
);

// Allocation Ring Skeleton
export const AllocationRingSkeleton = () => (
    <div className="bg-[#0E0F11] border border-white/5 rounded-3xl p-6 flex flex-col h-full min-h-[600px] relative">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <SkeletonShimmer className="w-5 h-5 rounded" />
                <SkeletonShimmer className="w-32 h-5 rounded" />
            </div>
            <SkeletonShimmer className="w-4 h-4 rounded" />
        </div>

        <div className="relative w-full aspect-square max-h-[320px] mx-auto my-4">
            <SkeletonShimmer className="w-full h-full rounded-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <SkeletonShimmer className="w-20 h-3 rounded mb-2" />
                <SkeletonShimmer className="w-32 h-8 rounded-lg" />
            </div>
        </div>

        <div className="flex items-center justify-between mb-4 mt-2">
            <SkeletonShimmer className="w-20 h-4 rounded" />
            <SkeletonShimmer className="w-16 h-6 rounded" />
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SkeletonShimmer className="w-8 h-8 rounded-full" />
                        <SkeletonShimmer className="w-24 h-4 rounded" />
                    </div>
                    <div className="flex items-center gap-3">
                        <SkeletonShimmer className="w-20 h-4 rounded" />
                        <SkeletonShimmer className="w-12 h-3 rounded" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Assets Table Skeleton
export const AssetsTableSkeleton = () => (
    <div className="bg-[#0E0F11] border border-white/5 rounded-3xl overflow-hidden p-0">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <SkeletonShimmer className="w-32 h-6 rounded" />
            </div>
            <div className="flex gap-2">
                <SkeletonShimmer className="w-32 h-8 rounded-lg" />
            </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full relative">
                <thead className="sticky top-0 bg-[#0E0F11] z-10">
                    <tr className="text-left border-b border-white/5">
                        <th className="px-6 py-4"><SkeletonShimmer className="w-12 h-3 rounded" /></th>
                        <th className="px-6 py-4"><SkeletonShimmer className="w-12 h-3 rounded" /></th>
                        <th className="px-6 py-4"><SkeletonShimmer className="w-16 h-3 rounded" /></th>
                        <th className="px-6 py-4"><SkeletonShimmer className="w-12 h-3 rounded" /></th>
                        <th className="px-6 py-4"><SkeletonShimmer className="w-20 h-3 rounded" /></th>
                        <th className="px-6 py-4 text-right"><SkeletonShimmer className="w-12 h-3 rounded ml-auto" /></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <SkeletonShimmer className="w-8 h-8 rounded-full" />
                                    <SkeletonShimmer className="w-16 h-4 rounded" />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <SkeletonShimmer className="w-20 h-4 rounded" />
                            </td>
                            <td className="px-6 py-4">
                                <SkeletonShimmer className="w-24 h-4 rounded" />
                            </td>
                            <td className="px-6 py-4">
                                <SkeletonShimmer className="w-20 h-4 rounded" />
                            </td>
                            <td className="px-6 py-4">
                                <SkeletonShimmer className="w-16 h-6 rounded-lg" />
                            </td>
                            <td className="px-6 py-4">
                                <SkeletonShimmer className="w-24 h-8 rounded ml-auto" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Full Portfolio Skeleton
export const PortfolioSkeleton = () => (
    <div className="pb-24 animate-in fade-in duration-500">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
            <SkeletonShimmer className="w-16 h-5 rounded" />
            <span className="text-gray-600 text-lg font-medium">{'>'}</span>
            <SkeletonShimmer className="w-24 h-5 rounded" />
        </div>

        {/* TOP GRID: Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <BalanceCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AddActionCardSkeleton />
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
                <PortfolioChartSkeleton />
            </div>
            <div className="col-span-1 lg:col-span-1">
                <AllocationRingSkeleton />
            </div>
        </div>

        {/* BOTTOM: Market Overview Table */}
        <div className="w-full">
            <AssetsTableSkeleton />
        </div>
    </div>
);

export default PortfolioSkeleton;
