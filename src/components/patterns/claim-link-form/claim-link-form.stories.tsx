import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ClaimLinkForm } from "./claim-link-form";
import {
  defaultClaimLinkFormArgs,
  filledClaimLinkFormArgs,
} from "./claim-link-form.mock";

const meta = {
  args: {
    ...defaultClaimLinkFormArgs,
    onSubmit: fn(),
    onValueChange: fn(),
  },
  argTypes: {
    linkPrefix: { control: "text", description: "Host shown before input" },
    liveProfileHref: { control: "text", description: "Example profile link" },
    onSubmit: { description: "Called on submit" },
    onValueChange: { description: "Called on every keystroke" },
    value: { control: "text", description: "Typed username" },
  },
  component: ClaimLinkForm,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  title: "Patterns/ClaimLinkForm",
} satisfies Meta<typeof ClaimLinkForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Typing: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText("Claim your Public Profile Link"),
      "m"
    );
    await expect(args.onValueChange).toHaveBeenCalledWith("m");
  },
};

export const Submit: Story = {
  args: filledClaimLinkFormArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Get my link" }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
