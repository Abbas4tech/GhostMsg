import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ShareLinkCard } from "./share-link-card";
import {
  defaultShareLinkCardArgs,
  longUrlShareLinkCardArgs,
} from "./share-link-card.mock";

const meta = {
  title: "Patterns/ShareLinkCard",
  component: ShareLinkCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: { ...defaultShareLinkCardArgs, onCopy: fn() },
  argTypes: {
    profileUrl: {
      control: "text",
      description: "Read-only public profile URL",
    },
    onCopy: { description: "Copy button clicked (page shows a toast)" },
  },
} satisfies Meta<typeof ShareLinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByLabelText("Your profile link");
    await expect(input).toHaveValue(defaultShareLinkCardArgs.profileUrl);
    await expect(input).toBeDisabled();
    await userEvent.click(
      canvas.getByRole("button", { name: "Copy to clipboard" })
    );
    await expect(args.onCopy).toHaveBeenCalledOnce();
  },
};

export const LongUrl: Story = { args: longUrlShareLinkCardArgs };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
