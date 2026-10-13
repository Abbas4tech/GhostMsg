import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor } from "storybook/test";
import { authCredentials, authPageHandlers } from "../shared/auth-pages.mock";
import { VerifyPage } from "./verify-page";

/** Page stories chain MSW worker start → session → lazy chunk → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const SUBMIT_REGEX = /^verify$/i;

const meta = {
  title: "Pages/Auth/Verify",
  component: VerifyPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    pageProviders: true,
    msw: { handlers: authPageHandlers.default },
  },
  args: { username: authCredentials.username },
  argTypes: {
    username: {
      control: "text",
      description: "Route param `/verify/[username]`",
    },
  },
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
  },
};

export const Verifies: Story = {
  play: async ({ canvas, userEvent }) => {
    await enterOtp(canvas, userEvent);
    await expect(
      await screen.findByText(
        "Account verified successfully",
        undefined,
        PAGE_LOAD
      )
    ).toBeVisible();
  },
};

export const InvalidCode: Story = {
  parameters: { msw: { handlers: authPageHandlers.verifyInvalid } },
  play: async ({ canvas, userEvent }) => {
    await enterOtp(canvas, userEvent);
    await waitFor(async () =>
      expect(
        await screen.findByText(
          "Incorrect verification code",
          undefined,
          PAGE_LOAD
        )
      ).toBeVisible()
    );
  },
};
