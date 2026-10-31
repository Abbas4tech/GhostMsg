import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect, fn, waitFor } from "storybook/test";
import { signInSchema } from "@/schemas/sign-in-schema";
import {
  defaultSignInFormArgs,
  type SignInFormStoryArgs,
  validSignIn,
} from "./auth-form.mock";
import { SignInForm, type SignInValues } from "./sign-in-form";

const LOGIN_REGEX = /^sign in$/i;
const LOGGING_IN_REGEX = /signing in/i;
const GOOGLE_REGEX = /continue with google/i;
const SHOW_PASSWORD_REGEX = /show password/i;
const HIDE_PASSWORD_REGEX = /hide password/i;
const SIGN_UP_LINK_REGEX = /make your link/i;

/** Creates the form with the real schema, as `useSignInController` does. */
function SignInFormHarness({
  isSubmitting,
  onGoogleSignIn,
  onSubmit,
}: SignInFormStoryArgs): React.JSX.Element {
  const form = useForm<SignInValues>({
    defaultValues: { identifier: "", password: "" },
    mode: "onChange",
    resolver: zodResolver(signInSchema),
  });
  return (
    <div className="w-96">
      <SignInForm
        form={form}
        isSubmitting={isSubmitting}
        onGoogleSignIn={onGoogleSignIn}
        onSubmit={onSubmit}
      />
    </div>
  );
}

const meta = {
  args: { ...defaultSignInFormArgs, onGoogleSignIn: fn(), onSubmit: fn() },
  argTypes: {
    isSubmitting: {
      control: "boolean",
      description: "Shows “Logging in...” and disables Login",
    },
    onGoogleSignIn: { description: "Continue with Google clicked" },
    onSubmit: {
      description: "Valid credentials submitted → `{ identifier, password }`",
    },
  },
  component: SignInFormHarness,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Patterns/AuthForm/SignInForm",
} satisfies Meta<typeof SignInFormHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: LOGIN_REGEX })
    ).toBeDisabled();
    await expect(
      canvas.getByRole("link", { name: SIGN_UP_LINK_REGEX })
    ).toHaveAttribute("href", "/sign-up");
  },
};

export const SubmitsCredentials: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText("Username or email"),
      validSignIn.identifier
    );
    await userEvent.type(
      canvas.getByLabelText("Password"),
      validSignIn.password
    );
    const login = canvas.getByRole("button", { name: LOGIN_REGEX });
    await waitFor(() => expect(login).toBeEnabled());
    await userEvent.click(login);
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
    await expect(args.onSubmit.mock.calls[0][0]).toEqual(validSignIn);
  },
};

export const ShortPassword: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Password"), "123");
    await expect(
      await canvas.findByText("password must be atleast 6 characters")
    ).toBeVisible();
    await expect(canvas.getByLabelText("Password")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  },
};

export const TogglesPasswordVisibility: Story = {
  play: async ({ canvas, userEvent }) => {
    const password = canvas.getByLabelText("Password");
    await expect(password).toHaveAttribute("type", "password");
    await userEvent.click(
      canvas.getByRole("button", { name: SHOW_PASSWORD_REGEX })
    );
    await expect(password).toHaveAttribute("type", "text");
    await expect(
      canvas.getByRole("button", { name: HIDE_PASSWORD_REGEX })
    ).toBeVisible();
  },
};

export const GoogleSignIn: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: GOOGLE_REGEX }));
    await expect(args.onGoogleSignIn).toHaveBeenCalledOnce();
  },
};

export const Submitting: Story = {
  args: { isSubmitting: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: LOGGING_IN_REGEX })
    ).toBeDisabled();
  },
};
