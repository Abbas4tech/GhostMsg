import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect, fn, waitFor } from "storybook/test";
import { signUpSchema } from "@/schemas/sign-up-schema";
import {
  defaultSignUpFormArgs,
  type SignUpFormStoryArgs,
  validSignUp,
} from "./auth-form.mock";
import { SignUpForm, type SignUpValues } from "./sign-up-form";

const SIGN_UP_REGEX = /^send my verification code$/i;
const SIGNING_UP_REGEX = /creating your link/i;
const SIGN_IN_LINK_REGEX = /^sign in$/i;

/** Creates the form with the real schema, as `useSignUpController` does. */
function SignUpFormHarness(args: SignUpFormStoryArgs): React.JSX.Element {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: "", email: "", password: "" },
    mode: "onChange",
  });
  return (
    <div className="w-96">
      <SignUpForm {...args} form={form} />
    </div>
  );
}

const meta = {
  title: "Patterns/AuthForm/SignUpForm",
  component: SignUpFormHarness,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { ...defaultSignUpFormArgs, onGoogleSignIn: fn(), onSubmit: fn() },
  argTypes: {
    usernameAvailability: {
      control: "radio",
      options: ["idle", "checking", "available", "taken"],
      description: "Server availability state; `checking` also blocks submit",
    },
    usernameAvailabilityMessage: {
      control: "text",
      description: "Tooltip for the taken state",
    },
    isSubmitting: { control: "boolean", description: "Shows “Signing up...”" },
    onSubmit: {
      description: "Valid details submitted → `{ username, email, password }`",
    },
    onGoogleSignIn: { description: "Continue with Google clicked" },
  },
} satisfies Meta<typeof SignUpFormHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SIGN_UP_REGEX })
    ).toBeDisabled();
    await expect(
      canvas.getByRole("link", { name: SIGN_IN_LINK_REGEX })
    ).toHaveAttribute("href", "/sign-in");
  },
};

export const SubmitsDetails: Story = {
  args: { usernameAvailability: "available" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText("Username"),
      validSignUp.username
    );
    await userEvent.type(canvas.getByLabelText("Email"), validSignUp.email);
    await userEvent.type(
      canvas.getByLabelText("Password"),
      validSignUp.password
    );
    const submit = canvas.getByRole("button", { name: SIGN_UP_REGEX });
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.click(submit);
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
    await expect(args.onSubmit.mock.calls[0][0]).toEqual(validSignUp);
  },
};

export const InvalidEmail: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Email"), "not-an-email");
    await expect(
      await canvas.findByText("Invalid email address")
    ).toBeVisible();
  },
};

export const InvalidUsername: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Username"), "bad name!");
    await expect(
      await canvas.findByText("Username must not contain special characters")
    ).toBeVisible();
  },
};

export const CheckingUsername: Story = {
  args: { usernameAvailability: "checking" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SIGN_UP_REGEX })
    ).toBeDisabled();
  },
};

export const UsernameTaken: Story = {
  args: {
    usernameAvailability: "taken",
    usernameAvailabilityMessage: "Username is already taken",
  },
};

export const Submitting: Story = {
  args: { isSubmitting: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SIGNING_UP_REGEX })
    ).toBeDisabled();
  },
};
