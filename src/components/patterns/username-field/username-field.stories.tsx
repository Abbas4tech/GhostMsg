import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect } from "storybook/test";
import { Form } from "@/components/elements/form";
import { UsernameField } from "./username-field";
import {
  defaultUsernameFieldArgs,
  takenUsernameFieldArgs,
  USERNAME_AVAILABILITIES,
  type UsernameFieldStoryArgs,
} from "./username-field.mock";

const IS_AVAILABLE_REGEX = /is available/;

/** Hosts the field inside a react-hook-form `Form`, as SignUpForm does. */
function UsernameFieldHarness({
  availability,
  availabilityMessage,
  defaultUsername,
}: UsernameFieldStoryArgs): React.JSX.Element {
  const form = useForm({ defaultValues: { username: defaultUsername } });
  return (
    <Form {...form}>
      <div className="w-80">
        <UsernameField
          availability={availability}
          availabilityMessage={availabilityMessage}
          control={form.control}
          name="username"
        />
      </div>
    </Form>
  );
}

const meta = {
  title: "Patterns/UsernameField",
  component: UsernameFieldHarness,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: defaultUsernameFieldArgs,
  argTypes: {
    availability: {
      control: "radio",
      options: USERNAME_AVAILABILITIES,
      description:
        "Availability computed by the page controller (debounced server check)",
    },
    availabilityMessage: {
      control: "text",
      description: "Tooltip shown on the taken icon",
    },
    defaultUsername: { control: "text", description: "Initial field value" },
  },
} satisfies Meta<typeof UsernameFieldHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Username")).toHaveValue("johndoe");
  },
};

export const Checking: Story = {
  args: { availability: "checking" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("Checking…");
  },
};

export const Available: Story = {
  args: { availability: "available" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Username is available" })
    ).toBeVisible();
    await expect(canvas.getByText("ghostmsg.app/u/johndoe")).toBeVisible();
    await expect(canvas.getByText(IS_AVAILABLE_REGEX)).toBeVisible();
  },
};

export const Taken: Story = {
  args: takenUsernameFieldArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Username is taken" })
    ).toBeVisible();
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Username is already taken"
    );
  },
};
