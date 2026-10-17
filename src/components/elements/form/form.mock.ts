export interface FormStoryValues {
  email: string;
}

export const formMockContent = {
  description: "We never share your email.",
  label: "Email *",
  placeholder: "you@example.com",
  requiredMessage: "Email is required",
};

export const defaultFormValues: FormStoryValues = { email: "" };
