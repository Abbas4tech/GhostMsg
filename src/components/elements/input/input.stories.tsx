import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Input } from "./input";
import {
  defaultInputArgs,
  filledInputArgs,
  INPUT_SIZES,
  INPUT_VARIANTS,
} from "./input.mock";

const meta = {
  title: "Elements/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: { ...defaultInputArgs, onChange: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: INPUT_VARIANTS,
      description: "Surface style",
    },
    sizeVariant: {
      control: "radio",
      options: INPUT_SIZES,
      description: "Height preset (`md` = original)",
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "search"],
      description: "Native input type",
    },
    placeholder: { control: "text", description: "Placeholder text" },
    disabled: { control: "boolean", description: "Disables editing" },
    "aria-invalid": {
      control: "boolean",
      description: "Shows the destructive error ring",
    },
    onChange: { description: "Fires on every keystroke" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Search messages" });
    await userEvent.type(input, "secret");
    await expect(input).toHaveValue("secret");
    await expect(args.onChange).toHaveBeenCalledTimes(6);
  },
};

export const WithValue: Story = { args: filledInputArgs };

export const Filled: Story = { args: { variant: "filled" } };

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-3">
      {INPUT_SIZES.map((size) => (
        <Input
          {...args}
          aria-label={`Size ${size}`}
          key={size}
          placeholder={`Size ${size}`}
          sizeVariant={size}
        />
      ))}
    </div>
  ),
};

export const Password: Story = {
  args: {
    type: "password",
    "aria-label": "Password",
    placeholder: "Enter your password..",
    defaultValue: "secret123",
  },
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "a", "aria-label": "Username" },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "https://ghostmsg.app/u/johndoe",
    "aria-label": "Profile link",
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Profile link" })
    ).toBeDisabled();
  },
};
