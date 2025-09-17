import dynamic from "next/dynamic";

const DashboardSkeleton = dynamic(() =>
  import("./DashboardSkeleton").then((m) => m.DashboardSkeleton)
);

const ProfileTab = dynamic(() =>
  import("./ProfileTab").then((m) => m.ProfileTab)
);

const MessageTab = dynamic(() =>
  import("./MessageTab").then((m) => m.MessageTab)
);

const SettingsTab = dynamic(() =>
  import("./SettingsTab").then((m) => m.SettingsTab)
);

export { DashboardSkeleton, ProfileTab, MessageTab, SettingsTab };
