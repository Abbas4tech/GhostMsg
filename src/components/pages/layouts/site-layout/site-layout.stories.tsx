import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { scenarios, withScenario } from "@/mock/handlers";
import { SiteLayout } from "./site-layout";

/** Page stories chain MSW worker start → session → lazy chunk → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const SIGN_UP_REGEX = /get your link/i;
const LOGOUT_REGEX = /log out/i;

/** Wires the real next-auth session (via MSW) into the SiteHeader block. */
const meta = {
  args: {
    children: (
      <main className="container mx-auto p-8 text-muted-foreground">
        Page content
      </main>
    ),
  },
  argTypes: {
    children: { control: false, description: "Page rendered under the header" },
  },
  component: SiteLayout,
  parameters: {
    layout: "fullscreen",
    msw: { handlers: withScenario(scenarios.session.authenticated) },
    pageProviders: true,
  },
  tags: ["autodocs"],
  title: "Pages/Layouts/SiteLayout",
} satisfies Meta<typeof SiteLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("button", { name: LOGOUT_REGEX }, PAGE_LOAD)
    ).toBeVisible();
    await expect(canvas.getByText("Page content")).toBeVisible();
  },
};

export const SignedOut: Story = {
  parameters: {
    msw: { handlers: withScenario(scenarios.session.unauthenticated) },
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("link", { name: SIGN_UP_REGEX }, PAGE_LOAD)
    ).toBeVisible();
  },
};
