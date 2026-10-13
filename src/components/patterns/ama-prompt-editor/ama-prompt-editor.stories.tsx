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
  atLimitAmaPromptEditorArgs,
  defaultAmaPromptEditorArgs,
} from "./ama-prompt-editor.mock";

const SAVE_REGEX = /save topic banner/i;
const SAVING_REGEX = /saving/i;

/** Local state keeps the controlled input interactive (Storybook UI and tests). */
function StatefulAmaPromptEditor(args: AmaPromptEditorProps) {
  const [value, setValue] = useState(args.value);
  return (
    <AmaPromptEditor
      {...args}
      onChange={(next) => {
        args.onChange(next);
        setValue(next);
      }}
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
  args: { ...defaultAmaPromptEditorArgs, onChange: fn(), onSave: fn() },
  argTypes: {
    value: {
      control: "text",
      description: `Controlled prompt (max ${AMA_PROMPT_MAX_LENGTH} chars)`,
    },
    isSaving: {
      control: "boolean",
      description: "Shows the saving spinner and disables Save",
    },
    onChange: { description: "Input changed → new value" },
    onSave: { description: "Save Topic Banner clicked" },
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
    await userEvent.type(canvas.getByLabelText("AMA prompt"), "!");
    await expect(args.onChange).toHaveBeenCalledWith(`${FIXTURE_AMA_PROMPT}!`);
    await userEvent.click(canvas.getByRole("button", { name: SAVE_REGEX }));
    await expect(args.onSave).toHaveBeenCalledOnce();
  },
};

export const Saving: Story = {
  args: { isSaving: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SAVING_REGEX })
    ).toBeDisabled();
  },
};

export const Blank: Story = {
  args: { value: "   " },
  play: async ({ args, canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SAVE_REGEX })
    ).toBeDisabled();
    await expect(args.onSave).not.toHaveBeenCalled();
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
