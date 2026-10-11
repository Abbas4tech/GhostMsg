import type { UsernameAvailability } from "./username-field";

export const USERNAME_AVAILABILITIES: UsernameAvailability[] = [
  "idle",
  "checking",
  "available",
  "taken",
];

export interface UsernameFieldStoryArgs {
  availability: UsernameAvailability;
  availabilityMessage?: string;
  defaultUsername: string;
}

export const defaultUsernameFieldArgs: UsernameFieldStoryArgs = {
  availability: "idle",
  defaultUsername: "johndoe",
};

export const takenUsernameFieldArgs = {
  availability: "taken",
  availabilityMessage: "Username is already taken",
} satisfies Partial<UsernameFieldStoryArgs>;
