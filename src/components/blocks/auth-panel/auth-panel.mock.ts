import type { AuthPanelProps } from "./auth-panel";

export const signInAuthPanelArgs: Omit<AuthPanelProps, "children"> = {
  description: "Sign in to read your Anonymous Messages.",
  title: "Welcome back",
};

export const signUpAuthPanelArgs = {
  description: undefined,
  title: "Make your link",
} satisfies Partial<AuthPanelProps>;
