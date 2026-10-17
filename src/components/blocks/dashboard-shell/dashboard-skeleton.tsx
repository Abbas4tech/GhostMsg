import type React from "react";

import { Skeleton } from "@/components/elements/skeleton";

const CARD_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6"] as const;
const NAV_KEYS = ["n1", "n2", "n3"] as const;

/** Session loading: sidebar + inbox placeholders at their real sizes. */
export const DashboardSkeleton = (): React.JSX.Element => (
  <div
    aria-busy="true"
    aria-label="Loading your dashboard"
    className="flex min-h-screen bg-background"
    role="status"
  >
    <div className="hidden w-[248px] shrink-0 flex-col gap-5 border-r bg-sidebar px-3.5 py-5 lg:flex">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-11 w-full rounded-full" />
      {NAV_KEYS.map((key) => (
        <Skeleton className="h-11 w-full rounded-xl" key={key} />
      ))}
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
    <div className="flex flex-1 flex-col gap-5 px-4 py-6 sm:px-8">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-11 w-full max-w-xl rounded-full" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-3.5">
        {CARD_KEYS.map((key) => (
          <Skeleton className="h-[188px] rounded-xl" key={key} />
        ))}
      </div>
    </div>
  </div>
);
