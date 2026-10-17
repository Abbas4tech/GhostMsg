import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect } from "storybook/test";
import { Form } from "@/components/elements/form";
import { PasswordField } from "./password-field";

interface PasswordFieldStoryArgs {
  defaultPassword: string;
  placeholder: string;
}

function PasswordFieldHarness({
  defaultPassword,
  placeholder,
}: PasswordFieldStoryArgs): React.JSX.Element {
  const form = useForm({ defaultValues: { password: defaultPassword } });
  return (
    <Form {...form}>
      <div className="w-80">
        <PasswordField
          control={form.control}
          name="password"
          placeholder={placeholder}
        />
      </div>
    </Form>
  );
}

const meta = {
  args: { defaultPassword: "", placeholder: "Enter your password.." },
  argTypes: {
    defaultPassword: { control: "text", description: "Initial value" },
    placeholder: { control: "text", description: "Input placeholder" },
  },
  component: PasswordFieldHarness,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Patterns/AuthForm/PasswordField",
} satisfies Meta<typeof PasswordFieldHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Reveals: Story = {
  args: { defaultPassword: "secret123" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText("Password");
    await expect(input).toHaveAttribute("type", "password");
    await userEvent.click(
      canvas.getByRole("button", { name: "Show password" })
    );
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveValue("secret123");
  },
};
