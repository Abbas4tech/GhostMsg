import type React from "react";
import type { PropsWithChildren } from "react";
import { RouteTransition } from "@/components/pages/dashboard";

const template = ({ children }: PropsWithChildren): React.JSX.Element => (
  <RouteTransition>{children}</RouteTransition>
);

export default template;
