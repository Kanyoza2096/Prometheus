import React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

/** Single animated placeholder block */
export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn('animate-pulse rounded-md bg-white/5', className)} />
);

/** Mimics a stat card (title + big number + subtitle) */
export const SkeletonCard = ({ className }: SkeletonProps) => (
  <div className={cn('rounded-xl bg-brand-surface border border-brand-border p-5 space-y-3', className)}>
    <Skeleton className="h-3 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

/** Mimics a table with a header row and N data rows.
 *  Inner rows are wrapped in a <div> so the `key` prop lives on a host
 *  element (where it's always valid) rather than on Skeleton itself. */
export const SkeletonTable = ({ rows = 5, className }: SkeletonProps & { rows?: number }) => (
  <div className={cn('space-y-2', className)}>
    <Skeleton className="h-8 w-full rounded-lg" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i}><Skeleton className="h-12 w-full rounded-lg" /></div>
    ))}
  </div>
);

/** Mimics a chart panel */
export const SkeletonChart = ({ className }: SkeletonProps) => (
  <div className={cn('rounded-xl bg-brand-surface border border-brand-border p-5', className)}>
    <Skeleton className="h-3 w-1/4 mb-4" />
    <Skeleton className="h-48 w-full rounded-lg" />
  </div>
);

/** Full-page loading layout — stat cards + two charts + a table */
export const SkeletonPage = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}><SkeletonCard /></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SkeletonChart />
      <SkeletonChart />
    </div>
    <SkeletonTable rows={4} />
  </div>
);
