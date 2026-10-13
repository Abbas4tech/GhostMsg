import type { AuthPanelProps } from "./auth-panel";

export const signInAuthPanelArgs: Omit<AuthPanelProps, "children"> = {
  title: "Welcome back",
  description: "Sign in to read your Anonymous Messages.",
};

export const signUpAuthPanelArgs = {
  title: "Make your link",
  description: undefined,
} satisfies Partial<AuthPanelProps>;
