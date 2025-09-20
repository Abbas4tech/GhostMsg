import React, { PropsWithChildren } from "react";

import Header from "@/components/Header";

const layout = ({ children }: PropsWithChildren): React.JSX.Element => (
  <>
    <Header />
    {children}
  </>
);

export default layout;
