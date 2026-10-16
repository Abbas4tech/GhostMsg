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
  args: { ...defaultInputArgs, onChange: fn() },
  argTypes: {
    "aria-invalid": {
      control: "boolean",
      description: "Shows the destructive error ring",
    },
    disabled: { control: "boolean", description: "Disables editing" },
    onChange: { description: "Fires on every keystroke" },
    placeholder: { control: "text", description: "Placeholder text" },
    sizeVariant: {
      control: "radio",
      description: "Height preset (`md` = original)",
      options: INPUT_SIZES,
    },
    type: {
      control: "select",
      description: "Native input type",
      options: ["text", "email", "password", "search"],
    },
    variant: {
      control: "select",
      description: "Surface style",
      options: INPUT_VARIANTS,
    },
  },
  component: Input,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/Input",
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
    "aria-label": "Password",
    defaultValue: "secret123",
    placeholder: "Enter your password..",
    type: "password",
  },
};

export const Invalid: Story = {
  args: { "aria-invalid": true, "aria-label": "Username", defaultValue: "a" },
};

export const Disabled: Story = {
  args: {
    "aria-label": "Profile link",
    defaultValue: "https://ghostmsg.app/u/johndoe",
    disabled: true,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Profile link" })
    ).toBeDisabled();
  },
};
