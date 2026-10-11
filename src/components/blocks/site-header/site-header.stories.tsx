import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SiteHeader } from "./site-header";
import {
  guestSiteHeaderArgs,
  signedInSiteHeaderArgs,
} from "./site-header.mock";

const SIGN_UP_REGEX = /sign up/i;
const LOGOUT_REGEX = /logout/i;
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
      description: "Switches the auth action between Sign Up and Logout",
    },
    onSignOut: {
      description: "Logout clicked (the page calls next-auth `signOut`)",
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
      canvas.getByRole("link", { name: SIGN_UP_REGEX })
    ).toHaveAttribute("href", "/sign-up");
    await expect(
      canvas.getByRole("button", { name: "Toggle theme" })
    ).toBeVisible();
  },
};

export const SignedIn: Story = {
  args: signedInSiteHeaderArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: LOGOUT_REGEX }));
    await expect(args.onSignOut).toHaveBeenCalledOnce();
    await expect(
      canvas.queryByRole("link", { name: SIGN_UP_REGEX })
    ).not.toBeInTheDocument();
  },
};

export const Mobile: Story = {
  args: signedInSiteHeaderArgs,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
