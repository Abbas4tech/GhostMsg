import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect, fn, waitFor } from "storybook/test";
import { Card } from "@/components/elements/card";
import { verifySchema } from "@/schemas/verify-schema";
import { VerifyCodeForm, type VerifyCodeValues } from "./verify-code-form";
import {
  defaultVerifyCodeFormArgs,
  VALID_OTP,
  type VerifyCodeFormStoryArgs,
} from "./verify-code-form.mock";

const SUBMIT_REGEX = /^verify$/i;
const CHECKING_REGEX = /checking your code/i;

/** Creates the form with the real schema, as the verify page controller does. */
function VerifyCodeFormHarness({
  isSubmitting,
  onSubmit,
}: VerifyCodeFormStoryArgs): React.JSX.Element {
  const form = useForm<VerifyCodeValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });
  return (
    <Card className="w-full max-w-lg">
      <VerifyCodeForm
        form={form}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </Card>
  );
}

const meta = {
  title: "Patterns/VerifyCodeForm",
  component: VerifyCodeFormHarness,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { ...defaultVerifyCodeFormArgs, onSubmit: fn() },
  argTypes: {
    isSubmitting: {
      control: "boolean",
      description: "Shows “Checking your OTP...” and disables submit",
    },
    onSubmit: { description: "Valid 6-digit code submitted → `{ code }`" },
  },
} satisfies Meta<typeof VerifyCodeFormHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Verification Code")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: SUBMIT_REGEX })
    ).toBeDisabled();
  },
};

export const SubmitsValidCode: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox"), VALID_OTP);
    const submit = canvas.getByRole("button", { name: SUBMIT_REGEX });
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.click(submit);
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
    await expect(args.onSubmit.mock.calls[0][0]).toEqual({ code: VALID_OTP });
  },
};

export const Submitting: Story = {
  args: { isSubmitting: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: CHECKING_REGEX })
    ).toBeDisabled();
  },
};
