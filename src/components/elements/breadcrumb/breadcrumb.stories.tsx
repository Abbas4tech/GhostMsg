import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { breadcrumbMockContent } from "./breadcrumb.mock";

const { parent, current } = breadcrumbMockContent;

const meta = {
  component: Breadcrumb,
  parameters: { layout: "centered" },
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={parent.href}>{parent.label}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  tags: ["autodocs"],
  title: "Elements/Breadcrumb",
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("navigation", { name: "breadcrumb" })
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: parent.label })
    ).toHaveAttribute("href", parent.href);
    await expect(canvas.getByText(current)).toHaveAttribute(
      "aria-current",
      "page"
    );
  },
};
