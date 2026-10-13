import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SiteHeader } from "./site-header";
import {
  guestSiteHeaderArgs,
  signedInSiteHeaderArgs,
} from "./site-header.mock";

const LOG_OUT_REGEX = /log out/i;
const BRAND_REGEX = /ghostmsg/i;

const meta = {
  title: "Blocks/SiteHeader",
  component: SiteHeader,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { ...guestSiteHeaderArgs, onSignOut: fn() },
  argTypes: {
    isAuthenticated: {
      control: "boolean",
      description: "Switches the nav between guest and signed-in links",
    },
    onSignOut: {
      description: "Log out clicked (the page calls next-auth `signOut`)",
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: BRAND_REGEX })
    ).toHaveAttribute("href", "/");
    await expect(
      canvas.getByRole("link", { name: "Get your link" })
    ).toHaveAttribute("href", "/sign-up");
    await expect(canvas.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in"
    );
    await expect(
      canvas.getByRole("button", { name: "Toggle theme" })
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Color theme" })
    ).toBeVisible();
  },
};

export const SignedIn: Story = {
  args: signedInSiteHeaderArgs,
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("link", { name: "Dashboard" })
    ).toHaveAttribute("href", "/dashboard");
    await userEvent.click(canvas.getByRole("button", { name: LOG_OUT_REGEX }));
    await expect(args.onSignOut).toHaveBeenCalledOnce();
    await expect(
      canvas.queryByRole("link", { name: "Get your link" })
    ).not.toBeInTheDocument();
  },
};

export const Mobile: Story = {
  args: signedInSiteHeaderArgs,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
