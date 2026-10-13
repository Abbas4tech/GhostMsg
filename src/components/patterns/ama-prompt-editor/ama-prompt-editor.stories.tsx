import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { FIXTURE_AMA_PROMPT } from "@/mock/fixtures/public-profile.fixtures";
import {
  AMA_PROMPT_MAX_LENGTH,
  AmaPromptEditor,
  type AmaPromptEditorProps,
} from "./ama-prompt-editor";
import {
  aiIdeasAmaPromptEditorArgs,
  atLimitAmaPromptEditorArgs,
  defaultAmaPromptEditorArgs,
} from "./ama-prompt-editor.mock";

const SUGGEST_REGEX = /suggest with ai/i;

/** Local state keeps the controlled inputs interactive (Storybook UI and tests). */
function StatefulAmaPromptEditor(args: AmaPromptEditorProps) {
  const [value, setValue] = useState(args.value);
  const [showBanner, setShowBanner] = useState(args.showBanner);
  return (
    <AmaPromptEditor
      {...args}
      onChange={(next) => {
        args.onChange(next);
        setValue(next);
      }}
      onShowBannerChange={(next) => {
        args.onShowBannerChange(next);
        setShowBanner(next);
      }}
      showBanner={showBanner}
      value={value}
    />
  );
}

const meta = {
  title: "Patterns/AmaPromptEditor",
  component: AmaPromptEditor,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    ...defaultAmaPromptEditorArgs,
    onChange: fn(),
    onShowBannerChange: fn(),
    onSuggest: fn(),
  },
  argTypes: {
    value: {
      control: "text",
      description: `Controlled prompt (max ${AMA_PROMPT_MAX_LENGTH} chars)`,
    },
    showBanner: { control: "boolean", description: "Show the AMA banner" },
    isSuggesting: {
      control: "boolean",
      description: "AI ideas loading (spinner, disabled)",
    },
    aiIdeas: { control: "object", description: "Ideas from Suggest with AI" },
    onChange: { description: "Prompt changed → new value" },
    onShowBannerChange: { description: "Banner switch toggled" },
    onSuggest: { description: "Suggest with AI clicked" },
  },
  render: (args) => <StatefulAmaPromptEditor {...args} />,
} satisfies Meta<typeof AmaPromptEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByText(
        `${FIXTURE_AMA_PROMPT.length} / ${AMA_PROMPT_MAX_LENGTH}`
      )
    ).toBeVisible();
    await userEvent.type(
      canvas.getByLabelText("What do you want people to ask?"),
      "!"
    );
    await expect(args.onChange).toHaveBeenCalledWith(`${FIXTURE_AMA_PROMPT}!`);
    await userEvent.click(canvas.getByRole("button", { name: SUGGEST_REGEX }));
    await expect(args.onSuggest).toHaveBeenCalledOnce();
  },
};

export const PicksAnIdea: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("radio", { name: "Be honest with me" })
    );
    await expect(args.onChange).toHaveBeenCalledWith("Be honest with me");
  },
};

export const TogglesBanner: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("switch", { name: "Show the AMA banner" })
    );
    await expect(args.onShowBannerChange).toHaveBeenCalledWith(false);
  },
};

export const WithAiIdeas: Story = {
  args: aiIdeasAmaPromptEditorArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("radio", { name: "Roast my portfolio" })
    ).toBeVisible();
  },
};

export const Suggesting: Story = {
  args: { isSuggesting: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SUGGEST_REGEX })
    ).toBeDisabled();
  },
};

export const AtCharacterLimit: Story = {
  args: atLimitAmaPromptEditorArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(`${AMA_PROMPT_MAX_LENGTH} / ${AMA_PROMPT_MAX_LENGTH}`)
    ).toBeVisible();
  },
};
