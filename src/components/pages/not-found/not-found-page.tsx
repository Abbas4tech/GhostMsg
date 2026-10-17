import type React from "react";
import { NotFoundPanel } from "@/components/blocks/not-found-panel";

export function NotFoundPage(): React.JSX.Element {
  return <NotFoundPanel homeHref="/" />;
}
