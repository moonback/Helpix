import React from 'react';
import Card from '@/components/ui/Card';

interface MarketplaceItemSkeletonProps {
  viewMode: 'grid' | 'list';
}

const MarketplaceItemSkeleton: React.FC<MarketplaceItemSkeletonProps> = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <Card className="p-6">
        <div className="flex gap-6">
          {/* Image skeleton */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Content skeleton */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="h-6 bg-slate-200 rounded animate-pulse mb-2 w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-full mb-1"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3"></div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <div className="h-4 w-12 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 h-full flex flex-col">
      {/* Image skeleton */}
      <div className="relative mb-4">
        <div className="aspect-square bg-slate-200 rounded-xl animate-pulse"></div>
        
        {/* Badges skeleton */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="h-6 w-16 bg-slate-300 rounded-full animate-pulse"></div>
        </div>
        
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 bg-slate-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-6 bg-slate-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-slate-200 rounded animate-pulse mb-1"></div>
        <div className="h-4 bg-slate-200 rounded animate-pulse mb-3 w-3/4"></div>

        {/* Price and distance skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-20 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Owner skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Actions skeleton */}
        <div className="flex gap-2 mt-auto">
          <div className="h-8 flex-1 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-8 flex-1 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
};

export default MarketplaceItemSkeleton;
