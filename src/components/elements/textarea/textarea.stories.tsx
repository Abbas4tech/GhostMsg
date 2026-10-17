import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Textarea } from "./textarea";
import { defaultTextareaArgs } from "./textarea.mock";

const meta = {
  args: { ...defaultTextareaArgs, onChange: fn() },
  argTypes: {
    "aria-invalid": { control: "boolean", description: "Error styling" },
    disabled: { control: "boolean", description: "Disables editing" },
    maxLength: { control: "number", description: "Native max length" },
    onChange: { description: "Fires on every keystroke" },
    placeholder: { control: "text", description: "Placeholder text" },
  },
  component: Textarea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/Textarea",
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Your reply" });
    await userEvent.type(textarea, "Thank you!");
    await expect(textarea).toHaveValue("Thank you!");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const WithMaxLength: Story = {
  args: { maxLength: 10 },
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Your reply" });
    await userEvent.type(textarea, "This is longer than ten");
    await expect(textarea).toHaveValue("This is lo");
  },
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "Short" },
};

export const Disabled: Story = {
  args: { defaultValue: "Replies are closed", disabled: true },
};

export const LongContent: Story = {
  args: {
    defaultValue: "A long anonymous reply that keeps going. ".repeat(12),
  },
};
