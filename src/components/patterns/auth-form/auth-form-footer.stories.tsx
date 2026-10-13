import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { defaultAuthFormFooterArgs } from "./auth-form.mock";
import { AuthFormFooter, AuthOAuthHeader } from "./auth-form-footer";

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
  args: defaultAuthFormFooterArgs,
  argTypes: {
    submitLabel: { control: "text", description: "Idle submit label" },
    submittingLabel: {
      control: "text",
      description: "Pending submit label (with spinner)",
    },
    submitVariant: {
      control: "radio",
      options: ["default", "brand"],
      description: "Submit style (brand on sign-up)",
    },
    isSubmitting: { control: "boolean", description: "Pending state" },
    isSubmitDisabled: {
      control: "boolean",
      description: "Disables submit (invalid form / pending / checking)",
    },
    alternatePrompt: { control: "text", description: "Text before the link" },
    alternateHref: {
      control: "text",
      description: "Link to the other auth page",
    },
    alternateLabel: { control: "text", description: "Link text" },
  },
} satisfies Meta<typeof AuthFormFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Sign in" })
    ).toHaveAttribute("type", "submit");
    await expect(
      canvas.getByRole("link", { name: "Get your link" })
    ).toHaveAttribute("href", "/sign-up");
  },
};

export const SignUp: Story = {
  args: {
    submitLabel: "Send my Verification Code",
    submittingLabel: "Creating your link...",
    submitVariant: "brand",
    alternatePrompt: "Already have a link?",
    alternateHref: "/sign-in",
    alternateLabel: "Sign in",
  },
};

export const Submitting: Story = {
  args: { isSubmitting: true, isSubmitDisabled: true },
};

export const Disabled: Story = { args: { isSubmitDisabled: true } };

export const GoogleHeader: Story = {
  render: () => {
    const onGoogleSignIn = fn();
    return <AuthOAuthHeader onGoogleSignIn={onGoogleSignIn} />;
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: GOOGLE_REGEX }));
    await expect(canvas.getByText("or with email")).toBeVisible();
  },
};
