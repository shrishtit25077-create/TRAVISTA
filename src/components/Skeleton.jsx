import React from 'react';

// Base shimmer pulse
const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent`;

export const SkeletonBox = ({ className = '' }) => (
  <div className={`bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse ${className}`} />
);

export const SkeletonText = ({ className = '' }) => (
  <div className={`bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse h-3 ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
    <SkeletonBox className="h-52 rounded-none" />
    <div className="p-5 space-y-3">
      <SkeletonText className="w-3/4 h-4" />
      <SkeletonText className="w-1/2 h-3" />
      <div className="flex gap-2 pt-1">
        <SkeletonBox className="h-6 w-16 rounded-full" />
        <SkeletonBox className="h-6 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="flex items-center gap-4">
    <SkeletonBox className="w-16 h-16 rounded-2xl shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonText className="w-32 h-4" />
      <SkeletonText className="w-20 h-3" />
    </div>
  </div>
);

export const SkeletonParagraph = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonText
        key={i}
        className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        style={{ height: '0.75rem' }}
      />
    ))}
  </div>
);

export const SkeletonDestinationCard = ({ size = 'medium' }) => {
  const h = size === 'small' ? 'h-[280px]' : 'h-[360px]';
  return (
    <div className={`${h} rounded-[1.5rem] overflow-hidden bg-slate-200 dark:bg-slate-700 animate-pulse shadow-lg`}>
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2 bg-gradient-to-t from-black/60">
        <SkeletonText className="w-2/3 h-4 bg-white/20" />
        <SkeletonText className="w-1/3 h-3 bg-white/10" />
      </div>
    </div>
  );
};

export default SkeletonCard;
