import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { defaultAuthFormFooterArgs } from "./auth-form.mock";
import { AuthFormFooter } from "./auth-form-footer";

const GOOGLE_REGEX = /continue with google/i;

const meta = {
  title: "Patterns/AuthForm/AuthFormFooter",
  component: AuthFormFooter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <form className="w-96">
        <Story />
      </form>
    ),
  ],
  args: { ...defaultAuthFormFooterArgs, onGoogleSignIn: fn() },
  argTypes: {
    submitLabel: { control: "text", description: "Idle submit label" },
    submittingLabel: {
      control: "text",
      description: "Pending submit label (with spinner)",
    },
    isSubmitting: { control: "boolean", description: "Pending state" },
    isSubmitDisabled: {
      control: "boolean",
      description: "Disables submit (invalid form / pending / checking)",
    },
    alternateHref: {
      control: "text",
      description: "Link to the other auth page",
    },
    alternateLabel: { control: "text", description: "Link text" },
    onGoogleSignIn: { description: "Continue with Google clicked" },
  },
} satisfies Meta<typeof AuthFormFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("button", { name: "Login" })).toHaveAttribute(
      "type",
      "submit"
    );
    await expect(
      canvas.getByRole("link", { name: "Create an account!" })
    ).toHaveAttribute("href", "/sign-up");
    await userEvent.click(canvas.getByRole("button", { name: GOOGLE_REGEX }));
    await expect(args.onGoogleSignIn).toHaveBeenCalledOnce();
  },
};

export const SignUp: Story = {
  args: {
    submitLabel: "Sign up",
    submittingLabel: "Signing up...",
    alternateHref: "/sign-in",
    alternateLabel: "Already a member? Try logging in!",
  },
};

export const Submitting: Story = {
  args: { isSubmitting: true, isSubmitDisabled: true },
};

export const Disabled: Story = { args: { isSubmitDisabled: true } };
