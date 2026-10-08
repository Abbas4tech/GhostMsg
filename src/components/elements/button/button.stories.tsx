import type { ButtonProps } from "./button";
import { Button } from "./button";

export default {
  title: "Elements/Button",
  component: Button,
};

export const Default = (args: ButtonProps) => (
  <Button {...args}>Default Button</Button>
);
export const Primary = (args: ButtonProps) => (
  <Button variant="primary" {...args}>
    Primary Button
  </Button>
);
export const Secondary = (args: ButtonProps) => (
  <Button variant="secondary" {...args}>
    Secondary Button
  </Button>
);
export const Destructive = (args: ButtonProps) => (
  <Button variant="destructive" {...args}>
    Destructive Button
  </Button>
);
export const Glass = (args: ButtonProps) => (
  <Button variant="glass" {...args}>
    Glass Button
  </Button>
);
