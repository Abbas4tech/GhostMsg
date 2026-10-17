import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { expect, fn } from "storybook/test";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";
import { defaultInputOtpArgs, OTP_SLOT_COUNT } from "./input-otp.mock";

const SLOT_INDEXES = Array.from({ length: OTP_SLOT_COUNT }, (_, i) => i);

const meta = {
  args: {
    ...defaultInputOtpArgs,
    children: (
      <InputOTPGroup>
        {SLOT_INDEXES.map((index) => (
          <InputOTPSlot index={index} key={`slot-${index}`} />
        ))}
      </InputOTPGroup>
    ),
    onChange: fn(),
    onComplete: fn(),
    pattern: REGEXP_ONLY_DIGITS,
    render: undefined,
  },
  argTypes: {
    disabled: { control: "boolean", description: "Disables input" },
    maxLength: { control: "number", description: "Number of characters" },
    onChange: { description: "Called with the current value on every change" },
    onComplete: { description: "Called once all slots are filled" },
  },
  component: InputOTP,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/InputOTP",
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole("textbox", { name: "One-time password" }),
      "123456"
    );
    await expect(args.onChange).toHaveBeenLastCalledWith("123456");
    await expect(args.onComplete).toHaveBeenCalledWith("123456");
  },
};

export const DigitsOnly: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole("textbox", { name: "One-time password" }),
      "12ab"
    );
    await expect(args.onChange).toHaveBeenLastCalledWith("12");
  },
};

export const WithSeparator: Story = {
  args: {
    children: (
      <>
        <InputOTPGroup>
          {SLOT_INDEXES.slice(0, 3).map((index) => (
            <InputOTPSlot index={index} key={`slot-${index}`} />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          {SLOT_INDEXES.slice(3).map((index) => (
            <InputOTPSlot index={index} key={`slot-${index}`} />
          ))}
        </InputOTPGroup>
      </>
    ),
  },
};

export const Disabled: Story = { args: { disabled: true } };
