import type { Metadata } from "next";
import type React from "react";
import { InboxPage, isFilterStatus } from "@/components/pages/dashboard";

export const metadata: Metadata = { title: "Inbox" };

interface DashboardProps {
  searchParams: Promise<{ filter?: string | string[] }>;
}

const Dashboard = async ({
  searchParams,
}: DashboardProps): Promise<React.JSX.Element> => {
  const { filter } = await searchParams;
  return (
    <InboxPage initialStatus={isFilterStatus(filter) ? filter : undefined} />
  );
};

export default Dashboard;
