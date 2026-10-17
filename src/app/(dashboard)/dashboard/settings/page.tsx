import type { Metadata } from "next";
import type React from "react";
import { SettingsPage } from "@/components/pages/dashboard";

export const metadata: Metadata = { title: "Settings" };

const Settings = (): React.JSX.Element => <SettingsPage />;

export default Settings;
