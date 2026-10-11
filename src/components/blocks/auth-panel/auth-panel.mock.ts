import type { AuthPanelProps } from "./auth-panel";

export const signInAuthPanelArgs: Omit<AuthPanelProps, "children"> = {
  title: "Login to your account",
  description: "Continue your journey with GhostMsg",
};

export const signUpAuthPanelArgs = {
  title: "Join GhostMsg",
  description: "Enter your details below to signup for your account",
} satisfies Partial<AuthPanelProps>;
