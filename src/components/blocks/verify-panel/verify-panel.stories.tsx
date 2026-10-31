import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect } from "storybook/test";
import {
  VerifyCodeForm,
  type VerifyCodeValues,
} from "@/components/patterns/verify-code-form";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import { VerifyPanel } from "./verify-panel";
import { defaultVerifyPanelArgs } from "./verify-panel.mock";

function VerifyFormSlot(): React.JSX.Element {
  const form = useForm<VerifyCodeValues>({ defaultValues: { code: "" } });
  return (
    <VerifyCodeForm
      form={form}
      onResend={noop}
      onSubmit={noop}
      resendSecondsLeft={42}
    />
  );
}

const meta = {
  args: { ...defaultVerifyPanelArgs, children: <VerifyFormSlot /> },
  argTypes: {
    children: {
      control: false,
      description: "Verification Code form slot",
    },
    username: { control: "text", description: "Name used in the greeting" },
  },
  component: VerifyPanel,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/VerifyPanel",
} satisfies Meta<typeof VerifyPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Check your email" })
    ).toBeVisible();
    await expect(canvas.getByText(`@${FIXTURE_USERNAME}`)).toBeVisible();
    await expect(canvas.getByLabelText("Verification Code")).toBeVisible();
  },
};

export const LongUsername: Story = {
  args: { username: "a_really_long_username_20" },
};

/** Phones: Back to /sign-up and "2 / 2" in the top bar (design MobVerify). */
export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/sign-up"
    );
    await expect(
      canvas.getByRole("progressbar", { name: "Step 2 of 2" })
    ).toBeVisible();
  },
};
