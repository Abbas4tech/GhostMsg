import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EyeIcon } from "lucide-react";
import { expect, within } from "storybook/test";
import { Button } from "@/components/elements/button";
import { PageHeading } from "./page-heading";
import { defaultPageHeadingArgs } from "./page-heading.mock";

const meta = {
  args: defaultPageHeadingArgs,
  argTypes: {
    actions: { control: false, description: "Right-aligned actions" },
    breadcrumb: {
      control: "object",
      description: "Crumbs; the last (no href) is the current page",
    },
    description: { control: "text", description: "Muted line under the title" },
    title: { control: "text", description: "Page <h1>" },
  },
  component: PageHeading,
  tags: ["autodocs"],
  title: "Patterns/PageHeading",
} satisfies Meta<typeof PageHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Profile" })
    ).toBeVisible();
    const crumbs = canvas.getByRole("navigation", { name: "breadcrumb" });
    await expect(
      within(crumbs).getByRole("link", { name: "Dashboard" })
    ).toHaveAttribute("href", "/dashboard");
    await expect(within(crumbs).getByText("Profile")).toHaveAttribute(
      "aria-current",
      "page"
    );
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <Button className="rounded-full" variant="outline">
        <EyeIcon data-icon="inline-start" />
        View as visitor
      </Button>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "View as visitor" })
    ).toBeVisible();
  },
};

export const TitleOnly: Story = {
  args: {
    breadcrumb: [
      { href: "/dashboard", label: "Dashboard" },
      { label: "Settings" },
    ],
    description: undefined,
    title: "Settings",
  },
};
