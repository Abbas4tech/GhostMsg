import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";
import { sidebarMockContent } from "./sidebar.mock";

const meta = {
  title: "Elements/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { collapsible: "offcanvas" },
  argTypes: {
    collapsible: {
      control: "radio",
      options: ["offcanvas", "icon", "none"],
      description: "How the desktop sidebar collapses",
    },
  },
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args} aria-label={sidebarMockContent.label}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>GhostMsg</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarMockContent.nav.map((item, index) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={index === 0}
                      size="nav"
                    >
                      <a href={item.href}>{item.label}</a>
                    </SidebarMenuButton>
                    {item.count ? (
                      <SidebarMenuBadge variant="count">
                        {item.count}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-4">
        <SidebarTrigger />
        <p className="pt-4">{sidebarMockContent.content}</p>
      </SidebarInset>
    </SidebarProvider>
  ),
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  play: async ({ canvas }) => {
    const sidebar = canvas.getByRole("complementary", {
      name: sidebarMockContent.label,
    });
    await expect(
      within(sidebar).getByRole("link", { name: "Inbox" })
    ).toHaveAttribute("data-active", "true");
    await expect(canvas.getByRole("main")).toHaveTextContent(
      sidebarMockContent.content
    );
  },
};

export const Collapses: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle Sidebar" })
    );
    await expect(
      canvas
        .getByRole("complementary", {
          name: sidebarMockContent.label,
          hidden: true,
        })
        .closest("[data-state]")
    ).toHaveAttribute("data-state", "collapsed");
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
