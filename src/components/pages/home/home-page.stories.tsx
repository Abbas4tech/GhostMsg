import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { scenarios, withScenario } from "@/mock/handlers";
import { HomePage } from "./home-page";

/** Page stories chain MSW worker start → session → lazy chunk → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const LOG_OUT_REGEX = /log out/i;

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
        name: "Say the honest thing. Stay a ghost.",
      })
    ).toBeVisible();
    await expect(
      await canvas.findByRole("link", { name: "Sign in" }, PAGE_LOAD)
    ).toBeVisible();
    await expect(
      canvas.getByRole("list", { name: "How GhostMsg works in four steps" })
    ).toBeVisible();
    await expect(
      canvas.getByRole("region", { name: "Safety" })
    ).toBeInTheDocument();
  },
};

export const ClaimLink: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText("Claim your Public Profile Link"),
      "maya"
    );
    await userEvent.click(canvas.getByRole("button", { name: "Get my link" }));
    await expect(
      canvas.getByLabelText("Claim your Public Profile Link")
    ).toHaveValue("maya");
  },
};

export const SignedIn: Story = {
  parameters: {
    msw: { handlers: withScenario(scenarios.session.authenticated) },
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("button", { name: LOG_OUT_REGEX }, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
