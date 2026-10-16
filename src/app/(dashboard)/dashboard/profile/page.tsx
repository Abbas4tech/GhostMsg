import type { Metadata } from "next";
import type React from "react";
import { ProfilePage } from "@/components/pages/dashboard";

export const metadata: Metadata = { title: "Profile" };

const Profile = (): React.JSX.Element => <ProfilePage />;

export default Profile;
