import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ShareLinkCard } from "./share-link-card";
import {
  defaultShareLinkCardArgs,
  longUrlShareLinkCardArgs,
} from "./share-link-card.mock";

const meta = {
  args: { ...defaultShareLinkCardArgs, onCopy: fn(), onShare: fn() },
  argTypes: {
    onCopy: { description: "Copy clicked (page copies + toasts)" },
    onShare: { description: "Share sheet clicked" },
    profileUrl: {
      control: "text",
      description: "Public profile URL (shown without protocol)",
    },
  },
  component: ShareLinkCard,
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  title: "Patterns/ShareLinkCard",
} satisfies Meta<typeof ShareLinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByLabelText("Your profile link");
    await expect(input).toHaveValue("ghostmsg.app/u/johndoe");
    await expect(input).toHaveAttribute("readonly");
    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await expect(args.onCopy).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Share…" }));
    await expect(args.onShare).toHaveBeenCalledOnce();
  },
};

export const WithoutShare: Story = {
  args: { onShare: undefined },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("button", { name: "Share…" })
    ).not.toBeInTheDocument();
  },
};

export const LongUrl: Story = { args: longUrlShareLinkCardArgs };

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
