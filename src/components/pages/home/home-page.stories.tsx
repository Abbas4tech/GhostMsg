import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { scenarios, withScenario } from "@/mock/handlers";
import { HomePage } from "./home-page";

/** Page stories chain MSW worker start → session → lazy chunk → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const SIGN_UP_REGEX = /sign up/i;
const LOGOUT_REGEX = /logout/i;

const meta = {
  title: "Pages/Home",
  component: HomePage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    pageProviders: true,
    msw: { handlers: withScenario(scenarios.session.unauthenticated) },
  },
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: "Send Messages like a Ghost. 👻",
      })
    ).toBeVisible();
    await expect(
      await canvas.findByRole("link", { name: SIGN_UP_REGEX }, PAGE_LOAD)
    ).toBeVisible();
    await expect(canvas.getAllByRole("group").length).toBeGreaterThan(0);
  },
};

export const SignedIn: Story = {
  parameters: {
    msw: { handlers: withScenario(scenarios.session.authenticated) },
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("button", { name: LOGOUT_REGEX }, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
