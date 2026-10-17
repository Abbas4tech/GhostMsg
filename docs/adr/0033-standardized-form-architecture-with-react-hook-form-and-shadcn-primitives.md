# ADR 0033: Standardized Form Architecture with React Hook Form and Shadcn Primitives

## Status

**Accepted** (2026-10-17).

---

## Context

GhostMsg manages multiple mission-critical user input flows: authentication (Credentials Sign In, Sign Up, Verification Code entry), anonymous message dispatching, profile configuration, and modal input dialogues. Previously, input patterns varied in their validation handling, ARIA association, and DOM structure. Inconsistent browser-native validation popups occasionally clashed with custom inline error styling, and component boundaries between controller business logic and presentational form markup risked blurring.

```mermaid
flowchart TD
    subgraph Controller["Page Controller (pages/<route>/use-*.controller.ts)"]
        A["useForm<TValues>({ resolver: zodResolver(schema), mode: 'onChange' })"]
        B["API Mutations / Side Effects (toasts, router.push, session.update)"]
    end

    subgraph Pattern["Pure Form Pattern (patterns/*-form/*.tsx)"]
        C["<Form {...form}> (FormProvider)"]
        D["<form noValidate onSubmit={form.handleSubmit(onSubmit)}>"]
        E["<FormField control={form.control} name='...' render={({ field }) => ( ... )}>"]
        F["<FormItem> (Context & IDs)"]
        G["<FormLabel> (Linked htmlFor)"]
        H["<FormControl> (Radix Slot.Root: id, aria-describedby, aria-invalid)"]
        I["<FormMessage> (Accessible error message)"]
    end

    A -->|form: UseFormReturn<TValues>| C
    B -->|onSubmit: (values) => void| D
    C --> D
    D --> E
    E --> F
    F --> G & H & I
```

## Decisions

| # | Decision |
| :-- | :--- |
| D1 | **Exclusive use of shadcn `<Form>` primitives with React Hook Form.** All validated user-facing input forms must strictly use the compound primitives in [`src/components/elements/form/form.tsx`](../../src/components/elements/form/form.tsx) (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`). Direct, ad-hoc inputs or raw HTML `<input>`/`<textarea>` elements rendered outside `<FormControl>` within forms are forbidden. |
| D2 | **Four-Tier Architecture boundary for forms.** Page controllers (`src/components/pages/<route>/use-*.controller.ts`) strictly own the form lifecycle: instantiating `useForm<TValues>`, wiring `zodResolver(schema)`, managing mutations, and executing post-submit side effects (toasts, navigation, session refresh). Form pattern components (`src/components/patterns/*-form/`) remain strictly pure: they receive `form: UseFormReturn<TValues>` and `onSubmit`, rendering the layout and invoking `form.handleSubmit(onSubmit)`. Patterns never call `useForm` directly. |
| D3 | **Suppression of native browser validation (`noValidate`).** All form patterns render `<form noValidate ...>`. This eliminates jarring, browser-dependent HTML5 validation popups and guarantees accessible, uniform inline validation messaging through shadcn's `<FormMessage>` component linked via ARIA descriptors. |
| D4 | **Radix Slot-based control contract (`<FormControl>`).** Inputs nested within a form field must be wrapped directly by `<FormControl>`, which uses Radix UI's `Slot.Root` to clone the child element and inject the generated `id`, `aria-describedby` (combining `${formDescriptionId} ${formMessageId}`), and `aria-invalid`. Compound inputs (such as `InputGroupInput`, `InputOTP`, and `Textarea`) must accept and forward these injected props cleanly. |
| D5 | **Clear architectural boundary between `form.tsx` and `field.tsx`.** `@/components/elements/form` is reserved exclusively for multi-field forms backed by React Hook Form schemas. Standalone, non-form inputs or simple confirmation dialogues that do not require multi-field validation (such as `DeleteAccountModal` or settings toggles) continue to use `@/components/elements/field` (`Field`, `FieldLabel`, `FieldDescription`), keeping them lightweight without artificial RHF overhead. |
| D6 | **Direct context consumption in `useFormField`.** `useFormField` derives `formState` directly from `useFormContext()`, removing redundant per-field subscriptions (`useFormState({ name })`) and ensuring that field validity, error states, and dirty indicators reflect the overarching form state accurately during reactive re-renders. |

## Considered options

- **Ad-hoc native HTML forms with controlled `useState`.** Rejected: lacks standardized accessible ARIA linkage, complicates schema validation, and scatters validation logic across multiple files.
- **Formik or TanStack Form.** Rejected: React Hook Form is deeply integrated into shadcn/ui and already established throughout GhostMsg with high performance (uncontrolled renders where appropriate) and zero bundle bloat.
- **Mixing `@/components/elements/field` and `@/components/elements/form` within form patterns.** Rejected: having two competing field container patterns inside validated forms causes confusing prop APIs and breaks `useFormField` context inheritance.

## Consequences

- Consistent visual and accessible behavior across all application forms (`SignInForm`, `SignUpForm`, `VerifyCodeForm`, and `SendMessageForm`).
- Screen reader users receive unambiguous feedback via `aria-describedby` pointing to `<FormDescription>` and `<FormMessage>` IDs.
- Submitting disabled states remain reactive to `form.formState.isValid` and `isSubmitting` without manual dirty-state plumbing.
- Documented in [Chapter 5: Component Architecture](../05-component-architecture.md), [Chapter 20: State Management](../20-state-management.md), and [Component Architecture for Agents](../agents/component-architecture.md).
