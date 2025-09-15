import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = (): React.JSX.Element => (
  <div className="container mx-auto px-4 py-8 max-w-6xl">
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-80" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-60 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
