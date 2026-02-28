import type React from "react";
import type { PropsWithChildren } from "react";
import Header from "@/components/global-header";

const layout = ({ children }: PropsWithChildren): React.JSX.Element => (
  <>
    <Header />
    {children}
  </>
);

export default layout;
