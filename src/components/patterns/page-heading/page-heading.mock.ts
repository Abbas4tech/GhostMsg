import type { PageHeadingProps } from "./page-heading";

export const defaultPageHeadingArgs: PageHeadingProps = {
  breadcrumb: [
    { href: "/dashboard", label: "Dashboard" },
    { label: "Profile" },
  ],
  description: "This is how you appear to anyone who opens your link.",
  title: "Profile",
};
