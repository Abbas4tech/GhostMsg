import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { defaultAuthFormFooterArgs } from "./auth-form.mock";
import { AuthFormFooter, AuthOAuthHeader } from "./auth-form-footer";

const GOOGLE_REGEX = /continue with google/i;

const meta = {
  args: defaultAuthFormFooterArgs,
  argTypes: {
    alternateHref: {
      control: "text",
      description: "Link to the other auth page",
    },
    alternateLabel: { control: "text", description: "Link text" },
    alternatePrompt: { control: "text", description: "Text before the link" },
    isSubmitDisabled: {
      control: "boolean",
      description: "Disables submit (invalid form / pending / checking)",
    },
    isSubmitting: { control: "boolean", description: "Pending state" },
    submitLabel: { control: "text", description: "Idle submit label" },
    submittingLabel: {
      control: "text",
      description: "Pending submit label (with spinner)",
    },
    submitVariant: {
      control: "radio",
      description: "Submit style (brand on sign-up)",
      options: ["default", "brand"],
    },
  },
  component: AuthFormFooter,
  decorators: [
    (Story) => (
      <form className="w-96">
        <Story />
      </form>
    ),
  ],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Patterns/AuthForm/AuthFormFooter",
} satisfies Meta<typeof AuthFormFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Sign in" })
    ).toHaveAttribute("type", "submit");
    await expect(
      canvas.getByRole("link", { name: "Make your link" })
    ).toHaveAttribute("href", "/sign-up");
  },
};

export const SignUp: Story = {
  args: {
    alternateHref: "/sign-in",
    alternateLabel: "Sign in",
    alternatePrompt: "Already have a link?",
    submitLabel: "Send my Verification Code",
    submittingLabel: "Creating your link...",
    submitVariant: "brand",
  },
};

export const Submitting: Story = {
  args: { isSubmitDisabled: true, isSubmitting: true },
};

export const Disabled: Story = { args: { isSubmitDisabled: true } };

/** Sign-in uses the shorter "or" divider (design MobSignIn). */
export const GoogleHeaderSignIn: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("or")).toBeVisible();
  },
  render: () => {
    const onGoogleSignIn = fn();
    return (
      <AuthOAuthHeader dividerLabel="or" onGoogleSignIn={onGoogleSignIn} />
    );
  },
};

export const GoogleHeader: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: GOOGLE_REGEX }));
    await expect(canvas.getByText("or with email")).toBeVisible();
  },
  render: () => {
    const onGoogleSignIn = fn();
    return <AuthOAuthHeader onGoogleSignIn={onGoogleSignIn} />;
  },
};
