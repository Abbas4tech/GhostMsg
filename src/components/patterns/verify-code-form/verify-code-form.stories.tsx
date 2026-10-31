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
  lockedCodeError,
  VALID_OTP,
  type VerifyCodeFormStoryArgs,
  wrongCodeError,
} from "./verify-code-form.mock";

const SUBMIT_REGEX = /^verify$/i;
const CHECKING_REGEX = /checking your code/i;
const RESEND_REGEX = /^resend code$/i;
const RESEND_IN_REGEX = /resend in 0:42/i;
const CHANGE_EMAIL_REGEX = /wrong email\? change it/i;

/** Creates the form with the real schema, as the verify page controller does. */
function VerifyCodeFormHarness({
  codeError,
  isResending,
  isSubmitting,
  needsNewCode,
  onResend,
  onSubmit,
  resendSecondsLeft,
}: VerifyCodeFormStoryArgs): React.JSX.Element {
  const form = useForm<VerifyCodeValues>({
    defaultValues: { code: codeError ? "482190" : "" },
    mode: "onChange",
    resolver: zodResolver(verifySchema),
  });
  return (
    <Card className="w-full max-w-lg p-6">
      <VerifyCodeForm
        codeError={codeError}
        form={form}
        isResending={isResending}
        isSubmitting={isSubmitting}
        needsNewCode={needsNewCode}
        onResend={onResend}
        onSubmit={onSubmit}
        resendSecondsLeft={resendSecondsLeft}
      />
    </Card>
  );
}

const meta = {
  args: { ...defaultVerifyCodeFormArgs, onResend: fn(), onSubmit: fn() },
  argTypes: {
    codeError: {
      control: "object",
      description: "Wrong / expired / locked message (`{ title, detail }`)",
    },
    isResending: {
      control: "boolean",
      description: "A new code is being sent",
    },
    isSubmitting: {
      control: "boolean",
      description: "Shows “Checking your code...” and disables submit",
    },
    needsNewCode: {
      control: "boolean",
      description: "Locked or expired: slots disabled, only “Resend code”",
    },
    onResend: { description: "“Resend code” clicked" },
    onSubmit: { description: "Valid 6-digit code submitted → `{ code }`" },
    resendSecondsLeft: {
      control: { min: 0, type: "number" },
      description: "Resend cooldown (0 = available)",
    },
  },
  component: VerifyCodeFormHarness,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Patterns/VerifyCodeForm",
} satisfies Meta<typeof VerifyCodeFormHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Verification Code")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: SUBMIT_REGEX })
    ).toBeDisabled();
    await expect(canvas.getByText(RESEND_IN_REGEX)).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: CHANGE_EMAIL_REGEX })
    ).toHaveAttribute("href", "/sign-up");
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

/** Design Auth board, "timer finished": the main action becomes Resend code. */
export const TimerFinished: Story = {
  args: { resendSecondsLeft: 0 },
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.queryByRole("button", { name: SUBMIT_REGEX })
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: RESEND_REGEX }));
    await expect(args.onResend).toHaveBeenCalled();
  },
};

/** Design MobVerifyError: red slots, the tries left, and Resend code. */
export const WrongCode: Story = {
  args: { codeError: wrongCodeError, resendSecondsLeft: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "That code isn't right."
    );
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "2 tries left. Check for the newest email."
    );
    await expect(
      canvas.getByRole("button", { name: RESEND_REGEX })
    ).toBeEnabled();
  },
};

/** No tries left: the slots lock until a new code arrives. */
export const Locked: Story = {
  args: {
    codeError: lockedCodeError,
    needsNewCode: true,
    resendSecondsLeft: 0,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: RESEND_REGEX })
    ).toBeEnabled();
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  parameters: { layout: "fullscreen" },
};
