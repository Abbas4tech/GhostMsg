import type { InputProps } from "./input";
import { Input } from "./input";

export default {
  title: "Elements/Input",
  component: Input,
};

export const Default = (args: InputProps) => (
  <Input placeholder="Type message..." {...args} />
);
export const Glass = (args: InputProps) => (
  <Input placeholder="Glass input..." variant="glass" {...args} />
);
