import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'md' 
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        width,
        height,
        `rounded-${rounded}`,
        className
      )}
    />
  );
};

interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ className, lines = 3 }) => {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="w-3/4 h-6" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="w-full h-4" />
      ))}
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="w-24 h-6" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="w-24 h-4" />
          ))}
        </div>
      ))}
    </div>
  );
};

interface StatsSkeletonProps {
  count?: number;
  className?: string;
}

const StatsSkeleton: React.FC<StatsSkeletonProps> = ({ count = 4, className }) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-surface shadow rounded-lg p-6 border border-border-light">
          <div className="flex items-center">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="ml-4 space-y-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { Skeleton, CardSkeleton, TableSkeleton, StatsSkeleton };
