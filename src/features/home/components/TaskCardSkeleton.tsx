import React from 'react';
import Card from '@/components/ui/Card';

interface TaskCardSkeletonProps {
  viewMode: 'grid' | 'list';
}

const TaskCardSkeleton: React.FC<TaskCardSkeletonProps> = ({ viewMode }) => {
  return (
    <Card className={`bg-white rounded-2xl shadow-sm border border-slate-200 animate-pulse ${
      viewMode === 'grid' ? 'p-4' : 'p-6'
    }`}>
      {/* Priority Indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 rounded-t-2xl"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="relative">
            <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-200 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-5 bg-slate-200 rounded mb-2 w-3/4"></div>
            <div className="flex items-center gap-3">
              <div className="h-6 bg-slate-200 rounded-full w-16"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
          <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 rounded w-4/6"></div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-slate-200 rounded w-8 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-slate-200 rounded w-8 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
        <div className="flex flex-wrap gap-1">
          <div className="h-6 bg-slate-200 rounded-full w-16"></div>
          <div className="h-6 bg-slate-200 rounded-full w-20"></div>
          <div className="h-6 bg-slate-200 rounded-full w-12"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          <div className="h-5 bg-slate-200 rounded-full w-12"></div>
          <div className="h-5 bg-slate-200 rounded-full w-16"></div>
          <div className="h-5 bg-slate-200 rounded-full w-10"></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 bg-slate-200 rounded-2xl w-32"></div>
          <div className="h-10 bg-slate-200 rounded-2xl w-24"></div>
        </div>
        <div className="h-4 bg-slate-200 rounded w-20"></div>
      </div>
    </Card>
  );
};

export default TaskCardSkeleton;
