import dynamic from "next/dynamic";

const DashboardSkeleton = dynamic(() =>
  import("./dashboard-skeleton").then((m) => m.DashboardSkeleton)
);

const ProfileTab = dynamic(() =>
  import("./profile-tab").then((m) => m.ProfileTab)
);

const MessageTab = dynamic(() =>
  import("./message-tab").then((m) => m.MessageTab)
);

const SettingsTab = dynamic(() =>
  import("./settings-tab").then((m) => m.SettingsTab)
);

export { DashboardSkeleton, ProfileTab, MessageTab, SettingsTab };
