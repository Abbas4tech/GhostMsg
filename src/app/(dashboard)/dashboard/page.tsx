import type { Metadata } from "next";
import type React from "react";
import { InboxPage, isFilterStatus } from "@/components/pages/dashboard";

export const metadata: Metadata = { title: "Inbox" };

interface DashboardProps {
  searchParams: Promise<{ filter?: string | string[]; q?: string | string[] }>;
}

const Dashboard = async ({
  searchParams,
}: DashboardProps): Promise<React.JSX.Element> => {
  const { filter, q } = await searchParams;
  return (
    <InboxPage
      initialQuery={typeof q === "string" ? q : undefined}
      initialStatus={isFilterStatus(filter) ? filter : undefined}
    />
  );
};

export default Dashboard;
