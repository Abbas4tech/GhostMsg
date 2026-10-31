import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor } from "storybook/test";
import { authCredentials, authPageHandlers } from "../shared/auth-pages.mock";
import { VerifyPage } from "./verify-page";

/** Page stories chain MSW worker start → session → lazy chunk → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const SUBMIT_REGEX = /^verify$/i;
const RESEND_REGEX = /^resend code$/i;
const RESEND_IN_REGEX = /resend in/i;
const SIGN_IN_REGEX = /sign in to open your inbox/i;

const meta = {
  args: { username: authCredentials.username },
  argTypes: {
    username: {
      control: "text",
      description: "Route param `/verify/[username]`",
    },
  },
  component: VerifyPage,
  parameters: {
    layout: "fullscreen",
    msw: { handlers: authPageHandlers.default },
    pageProviders: true,
  },
  tags: ["autodocs"],
  title: "Pages/Auth/Verify",
} satisfies Meta<typeof VerifyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const enterOtp = async (
  canvas: Parameters<NonNullable<Story["play"]>>[0]["canvas"],
  userEvent: Parameters<NonNullable<Story["play"]>>[0]["userEvent"]
) => {
  await userEvent.type(canvas.getByRole("textbox"), authCredentials.otp);
  await userEvent.click(canvas.getByRole("button", { name: SUBMIT_REGEX }));
};

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Check your email" })
    ).toBeVisible();
    await expect(canvas.getByText(RESEND_IN_REGEX)).toBeVisible();
  },
};

/** Design MobVerifySuccess: the link is live, then sign in. */
export const Verifies: Story = {
  play: async ({ canvas, userEvent }) => {
    await enterOtp(canvas, userEvent);
    await expect(
      await screen.findByRole(
        "heading",
        { level: 1, name: "You're in. Your link is live." },
        PAGE_LOAD
      )
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: SIGN_IN_REGEX })
    ).toHaveAttribute("href", "/sign-in");
  },
};

/** Design MobVerifyError: "That code isn't right." with the tries left. */
export const InvalidCode: Story = {
  parameters: { msw: { handlers: authPageHandlers.verifyInvalid } },
  play: async ({ canvas, userEvent }) => {
    await enterOtp(canvas, userEvent);
    await waitFor(
      () =>
        expect(canvas.getByRole("alert")).toHaveTextContent(
          "2 tries left. Check for the newest email."
        ),
      PAGE_LOAD
    );
    await expect(
      canvas.getByRole("button", { name: RESEND_IN_REGEX })
    ).toBeDisabled();
  },
};

/** No tries left: the slots lock and only a new code helps. */
export const Locked: Story = {
  parameters: { msw: { handlers: authPageHandlers.verifyLocked } },
  play: async ({ canvas, userEvent }) => {
    await enterOtp(canvas, userEvent);
    await waitFor(
      () =>
        expect(canvas.getByRole("alert")).toHaveTextContent("Too many tries."),
      PAGE_LOAD
    );
    await expect(canvas.getByRole("textbox")).toBeDisabled();
  },
};

export const Expired: Story = {
  parameters: { msw: { handlers: authPageHandlers.verifyExpired } },
  play: async ({ canvas, userEvent }) => {
    await enterOtp(canvas, userEvent);
    await waitFor(
      () =>
        expect(canvas.getByRole("alert")).toHaveTextContent(
          "That code has expired."
        ),
      PAGE_LOAD
    );
    // The first code went out on mount, so Resend waits out the cooldown.
    await expect(
      canvas.getByRole("button", { name: RESEND_IN_REGEX })
    ).toBeDisabled();
    await expect(
      canvas.queryByRole("button", { name: RESEND_REGEX })
    ).not.toBeInTheDocument();
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
