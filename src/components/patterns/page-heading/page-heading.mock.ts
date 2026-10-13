import type { PageHeadingProps } from "./page-heading";

export const defaultPageHeadingArgs: PageHeadingProps = {
  breadcrumb: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile" },
  ],
  title: "Profile",
  description: "This is how you appear to anyone who opens your link.",
};
