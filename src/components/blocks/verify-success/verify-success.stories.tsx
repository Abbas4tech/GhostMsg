import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { VerifySuccess } from "./verify-success";
import { defaultVerifySuccessArgs } from "./verify-success.mock";

const COPY_REGEX = /^copy$/i;
const SHARE_REGEX = /^share/i;
const SIGN_IN_REGEX = /sign in to open your inbox/i;

const meta = {
  args: { ...defaultVerifySuccessArgs, onCopy: fn(), onShare: fn() },
  argTypes: {
    onCopy: { description: "Copy clicked" },
    onShare: { description: "Native share sheet (hidden when undefined)" },
    profileUrl: { control: "text", description: "The new Public Profile Link" },
    signInHref: { control: "text", description: "Sign-in target" },
  },
  component: VerifySuccess,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/VerifySuccess",
} satisfies Meta<typeof VerifySuccess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const heading = canvas.getByRole("heading", {
      level: 1,
      name: "You're in. Your link is live.",
    });
    await expect(heading).toHaveFocus();
    await expect(
      canvas.getByText(`ghostmsg.app/u/${FIXTURE_USERNAME}`)
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: COPY_REGEX }));
    await expect(args.onCopy).toHaveBeenCalled();
    await expect(
      canvas.getByRole("link", { name: SIGN_IN_REGEX })
    ).toHaveAttribute("href", "/sign-in");
  },
};

export const WithoutShare: Story = {
  args: { onShare: undefined },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("button", { name: SHARE_REGEX })
    ).not.toBeInTheDocument();
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
