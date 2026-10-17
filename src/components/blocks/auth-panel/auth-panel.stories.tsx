import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect } from "storybook/test";
import {
  SignInForm,
  type SignInValues,
  SignUpForm,
  type SignUpValues,
} from "@/components/patterns/auth-form";
import { noop } from "@/mock/noop";
import { AuthPanel } from "./auth-panel";
import { signInAuthPanelArgs, signUpAuthPanelArgs } from "./auth-panel.mock";

function SignInSlot(): React.JSX.Element {
  const form = useForm<SignInValues>({
    defaultValues: { identifier: "", password: "" },
  });
  return <SignInForm form={form} onGoogleSignIn={noop} onSubmit={noop} />;
}

function SignUpSlot(): React.JSX.Element {
  const form = useForm<SignUpValues>({
    defaultValues: { email: "", password: "", username: "" },
  });
  return <SignUpForm form={form} onGoogleSignIn={noop} onSubmit={noop} />;
}

const meta = {
  args: { ...signInAuthPanelArgs, children: <SignInSlot /> },
  argTypes: {
    children: { control: false, description: "Auth form slot" },
    description: { control: "text", description: "Muted subtitle" },
    icon: { control: false, description: "Optional icon tile" },
    title: { control: "text", description: "h1 heading" },
  },
  component: AuthPanel,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/AuthPanel",
} satisfies Meta<typeof AuthPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: signInAuthPanelArgs.title as string,
      })
    ).toBeVisible();
    await expect(
      canvas.getByText(signInAuthPanelArgs.description as string)
    ).toBeVisible();
    await expect(canvas.getByLabelText("Username or email")).toBeVisible();
  },
};

export const SignUp: Story = {
  args: { ...signUpAuthPanelArgs, children: <SignUpSlot /> },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Email")).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Make your link" })
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
