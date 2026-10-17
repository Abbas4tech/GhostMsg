import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { tableMockContent } from "./table.mock";

const meta = {
  component: Table,
  parameters: { layout: "padded" },
  render: (args) => (
    <Table {...args} aria-label={tableMockContent.label}>
      <TableCaption>{tableMockContent.caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {tableMockContent.columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableMockContent.rows.map((row) => (
          <TableRow key={row.hash}>
            <TableCell className="font-semibold">{row.hash}</TableCell>
            <TableCell>{row.blockedAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  tags: ["autodocs"],
  title: "Elements/Table",
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: tableMockContent.label });
    await expect(table).toBeVisible();
    await expect(canvas.getAllByRole("row")).toHaveLength(
      tableMockContent.rows.length + 1
    );
  },
};
