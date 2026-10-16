import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect, fn } from "storybook/test";
import { Button } from "@/components/elements/button";
import { Input } from "@/components/elements/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import {
  defaultFormValues,
  type FormStoryValues,
  formMockContent,
} from "./form.mock";

interface FormDemoProps {
  defaultValues?: FormStoryValues;
  onSubmit: (values: FormStoryValues) => void;
}

/** react-hook-form wiring for the Form primitives (label, control, description, message). */
function FormDemo({
  defaultValues = defaultFormValues,
  onSubmit,
}: FormDemoProps): React.JSX.Element {
  const form = useForm<FormStoryValues>({ defaultValues });
  return (
    <Form {...form}>
      <form className="w-80 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{formMockContent.label}</FormLabel>
              <FormControl>
                <Input placeholder={formMockContent.placeholder} {...field} />
              </FormControl>
              <FormDescription>{formMockContent.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
          rules={{ required: formMockContent.requiredMessage }}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

const meta = {
  args: { defaultValues: defaultFormValues, onSubmit: fn() },
  argTypes: {
    defaultValues: { control: "object", description: "Initial form values" },
    onSubmit: { description: "Called with validated values" },
  },
  component: FormDemo,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/Form",
} satisfies Meta<typeof FormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: formMockContent.label });
    await expect(input).toHaveAccessibleDescription(
      formMockContent.description
    );
    await userEvent.type(input, "ghost@ghostmsg.app");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};

export const ValidationError: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(
      await canvas.findByText(formMockContent.requiredMessage)
    ).toBeVisible();
    await expect(
      canvas.getByRole("textbox", { name: formMockContent.label })
    ).toHaveAttribute("aria-invalid", "true");
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const Prefilled: Story = {
  args: { defaultValues: { email: "johndoe@example.com" } },
};
