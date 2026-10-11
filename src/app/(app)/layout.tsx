import type React from "react";
import type { PropsWithChildren } from "react";
import { SiteLayout } from "@/components/pages/layouts/site-layout";

const layout = ({ children }: PropsWithChildren): React.JSX.Element => (
  <SiteLayout>{children}</SiteLayout>
);

export default layout;
