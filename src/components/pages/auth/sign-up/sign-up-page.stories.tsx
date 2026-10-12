import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor } from "storybook/test";
import { authCredentials, authPageHandlers } from "../shared/auth-pages.mock";
import { SignUpPage } from "./sign-up-page";

/** Page stories chain MSW worker start → session → lazy chunk → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const SIGN_UP_REGEX = /^sign up$/i;

const meta = {
  title: "Pages/Auth/SignUp",
  component: SignUpPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    pageProviders: true,
    msw: { handlers: authPageHandlers.default },
  },
} satisfies Meta<typeof SignUpPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 2, name: "Join GhostMsg" })
    ).toBeVisible();
  },
};

export const UsernameAvailable: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText("Username *"),
      authCredentials.username
    );
    await waitFor(() =>
      expect(canvasElement.querySelector(".text-green-500")).toBeInTheDocument()
    );
  },
};

export const UsernameTaken: Story = {
  parameters: { msw: { handlers: authPageHandlers.usernameTaken } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText("Username *"),
      authCredentials.username
    );
    await waitFor(() =>
      expect(canvasElement.querySelector(".text-red-500")).toBeInTheDocument()
    );
    await expect(
      await canvas.findByText("Username is already taken", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const SignsUp: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText("Username *"),
      authCredentials.username
    );
    await userEvent.type(
      canvas.getByLabelText("Email *"),
      authCredentials.email
    );
    await userEvent.type(
      canvas.getByLabelText("Password *"),
      authCredentials.password
    );
    const submit = canvas.getByRole("button", { name: SIGN_UP_REGEX });
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.click(submit);
    await expect(
      await screen.findByText(
        "User registered successfully. Please verify your email.",
        undefined,
        PAGE_LOAD
      )
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
