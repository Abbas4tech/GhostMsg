import type { AuthPanelProps } from "./auth-panel";

/** Design MobSignIn: brand tile, "Welcome back", Back to the landing page. */
export const signInAuthPanelArgs: Omit<AuthPanelProps, "children" | "icon"> = {
  backHref: "/",
  description: "Your inbox missed you.",
  iconTone: "brand",
  title: "Welcome back",
};

/** Design MobSignUp: step 1 of 2. */
export const signUpAuthPanelArgs = {
  backHref: "/",
  description: "Pick a username. That's your link.",
  iconTone: undefined,
  step: { current: 1, total: 2 },
  title: "Make your link",
} satisfies Partial<AuthPanelProps>;
