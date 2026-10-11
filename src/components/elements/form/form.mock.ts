export interface FormStoryValues {
  email: string;
}

export const formMockContent = {
  label: "Email *",
  placeholder: "you@example.com",
  description: "We never share your email.",
  requiredMessage: "Email is required",
};

export const defaultFormValues: FormStoryValues = { email: "" };
