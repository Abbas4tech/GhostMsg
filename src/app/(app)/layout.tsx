import type React from "react";
import type { PropsWithChildren } from "react";
import { SiteLayout } from "@/components/pages/layouts/site-layout";

/** Wraps /sign-in, /sign-up and /verify only: phones get each screen's own top bar. */
const layout = ({ children }: PropsWithChildren): React.JSX.Element => (
  <SiteLayout hideHeaderOnPhones>{children}</SiteLayout>
);

export default layout;
