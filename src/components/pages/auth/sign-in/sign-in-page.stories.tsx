import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor } from "storybook/test";
import { authCredentials, authPageHandlers } from "../shared/auth-pages.mock";
import { SignInPage } from "./sign-in-page";

/** Page stories chain MSW worker start → session → lazy chunk → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const LOGIN_REGEX = /^sign in$/i;

const meta = {
  args: { redirectPath: "/dashboard" },
  argTypes: {
    redirectPath: {
      control: "text",
      description: "Where to go after a successful login",
    },
  },
  component: SignInPage,
  parameters: {
    layout: "fullscreen",
    msw: { handlers: authPageHandlers.default },
    pageProviders: true,
  },
  tags: ["autodocs"],
  title: "Pages/Auth/SignIn",
} satisfies Meta<typeof SignInPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Welcome back" })
    ).toBeVisible();
  },
};

const fillAndSubmit = async (
  canvas: Parameters<NonNullable<Story["play"]>>[0]["canvas"],
  userEvent: Parameters<NonNullable<Story["play"]>>[0]["userEvent"]
) => {
  await userEvent.type(
    canvas.getByLabelText("Username or email"),
    authCredentials.username
  );
  await userEvent.type(
    canvas.getByLabelText("Password"),
    authCredentials.password
  );
  const login = canvas.getByRole("button", { name: LOGIN_REGEX });
  await waitFor(() => expect(login).toBeEnabled());
  await userEvent.click(login);
};

export const SignsIn: Story = {
  play: async ({ canvas, userEvent }) => {
    await fillAndSubmit(canvas, userEvent);
    await expect(
      await screen.findByText("Login successful", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const InvalidCredentials: Story = {
  parameters: { msw: { handlers: authPageHandlers.invalidCredentials } },
  play: async ({ canvas, userEvent }) => {
    await fillAndSubmit(canvas, userEvent);
    await expect(
      await screen.findByText("CredentialsSignin", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
