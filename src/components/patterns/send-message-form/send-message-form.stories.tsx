import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect, fn, waitFor } from "storybook/test";
import { messageSchema } from "@/schemas/message-schema";
import { SendMessageForm, type SendMessageValues } from "./send-message-form";
import {
  defaultSendMessageFormArgs,
  type SendMessageFormStoryArgs,
  TOO_SHORT_MESSAGE,
  VALID_MESSAGE,
} from "./send-message-form.mock";

const SEND_REGEX = /^send anonymously$/i;
const SENDING_REGEX = /sending/i;
const TEXTAREA_LABEL = "Your Anonymous Message";

/** Creates the form with the real schema, as `useSendMessageController` does. */
function SendMessageFormHarness({
  defaultContent,
  isSubmitting,
  onSubmit,
  username,
}: SendMessageFormStoryArgs): React.JSX.Element {
  const form = useForm<SendMessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: defaultContent },
    mode: "onChange",
  });
  return (
    <SendMessageForm
      form={form}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      username={username}
    />
  );
}

const meta = {
  title: "Patterns/SendMessageForm",
  component: SendMessageFormHarness,
  tags: ["autodocs"],
  args: { ...defaultSendMessageFormArgs, onSubmit: fn() },
  argTypes: {
    username: { control: "text", description: "Recipient handle in the label" },
    defaultContent: { control: "text", description: "Initial message text" },
    isSubmitting: {
      control: "boolean",
      description: "Shows “Sending...” and disables submit",
    },
    onSubmit: {
      description: "Valid message (10–300 chars) submitted → `{ content }`",
    },
  },
} satisfies Meta<typeof SendMessageFormHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("johndoe can't see who you are")
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: SEND_REGEX })
    ).toBeDisabled();
  },
};

export const SubmitsValidMessage: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText(TEXTAREA_LABEL), VALID_MESSAGE);
    await userEvent.click(canvas.getByRole("button", { name: SEND_REGEX }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
    await expect(args.onSubmit.mock.calls[0][0]).toEqual({
      content: VALID_MESSAGE,
    });
  },
};

export const TooShort: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText(TEXTAREA_LABEL),
      TOO_SHORT_MESSAGE
    );
    await expect(
      await canvas.findByText("content must be atleast of 10 characters")
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: SEND_REGEX })
    ).toBeDisabled();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const Prefilled: Story = { args: { defaultContent: VALID_MESSAGE } };

export const Sending: Story = {
  args: { defaultContent: VALID_MESSAGE, isSubmitting: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SENDING_REGEX })
    ).toBeDisabled();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
