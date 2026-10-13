# GhostMsg

GhostMsg is an anonymous messaging platform where users create personal profiles to receive unmoderated, identity-free feedback, confessions, and questions from the public.

## Language

**Anonymous Message**:
A piece of text content submitted by an unauthenticated visitor to a user's public profile without disclosing sender identity or metadata.
_Avoid_: Feedback, comment, post, submission, whisper

**Recipient**:
A registered user who owns a public profile and receives anonymous messages in their inbox.
_Avoid_: Target, receiver, host, account owner

**Public Profile Link**:
A unique, shareable URL path (`/u/[username]`) enabling anyone to send anonymous messages to a specific recipient.
_Avoid_: Inbox link, share link, profile URL, bio link

**Message Acceptance**:
A toggleable user preference controlling whether a recipient's public profile is open to receiving new anonymous messages.
_Avoid_: Active status, open inbox, message switch, receiving toggle

**Verification Code**:
A temporary, time-limited numerical one-time pass code sent via email to confirm ownership of an email address during registration.
_Avoid_: OTP, activation code, auth token, confirm PIN

**Suggested Message**:
A generated prompt or question presented to visitors on a recipient's profile to inspire message ideas.
_Avoid_: AI question, template, sample prompt, starter message

**Sender Hash**:
A one-way cryptographic fingerprint generated on submission to allow rate limiting and recipient blocklists without recording or exposing raw sender IP addresses.
_Avoid_: User ID, sender fingerprint, IP address, sender token

**Public Q&A**:
A published pairing of an anonymous message and the recipient's authored response, publicly visible on the recipient's profile or exported as a shareable card.
_Avoid_: Thread, post, broadcast, comment reply

**Quarantined Message**:
An anonymous message flagged by content moderation as toxic, abusive, or spam, isolated into a separate inbox view rather than delivered to the primary inbox.
_Avoid_: Spam, deleted message, hidden feedback

**AMA Prompt**:
A recipient-defined theme, topic, or question displayed on their public profile link to guide visitor submissions.
_Avoid_: Bio, status, custom headline, bio title

**Sentiment Tag**:
A classification label representing the emotional tone of an anonymous message.
_Avoid_: Vibe, mood score, AI emotion, category

## Engineering Language (UI architecture)

**Element**:
A domain-agnostic UI primitive in `src/components/elements/` (Button, Card, Tabs, Dialog, motion effects). Its default variant reproduces the original design exactly.
_Avoid_: UI component, atom, base component, shadcn component

**Pattern**:
A pure, domain-aware composition of elements in `src/components/patterns/` (MessageCard, SignInForm, FilterBar, modals).
_Avoid_: Molecule, widget, feature component

**Block**:
A pure page section in `src/components/blocks/` that composes patterns, often with slots (Inbox, SettingsPanel, DashboardShell, SiteHeader).
_Avoid_: Organism, section component, container

**Page (component)**:
A route-level component in `src/components/pages/<route>/` that owns all business logic through controllers and composes blocks. Rendered by a thin `src/app/**/page.tsx`.
_Avoid_: View, screen, container, smart component

**Controller**:
A `use-*.controller.ts` hook inside `pages/` holding queries, mutations, session, router and side-effect toasts, returning values plus `handle*` callbacks.
_Avoid_: Service hook, store, manager

**Pure (component)**:
Renders only from props and reports intent only through callbacks. Elements, patterns and blocks must be pure.
_Avoid_: Dumb component, presentational-only

**Fixture**:
A typed builder or named scenario in `src/mock/fixtures/` that produces domain data (messages, sessions, answers). The single source of mock data for stories, MSW handlers and tests.
_Avoid_: Fake data, dummy data, seed

**Component mock (`*.mock.ts`)**:
The args object(s) for one component, built from fixtures and colocated with it. Never imports another component's mock.
_Avoid_: Fixture file, stub props

**Handler (MSW)**:
A network-level request handler in `src/mock/handlers/`, typed by OpenAPI paths, that answers page and controller HTTP calls in stories and unit tests.
_Avoid_: Fake API, interceptor, mock server route

**Story test**:
A Storybook story executed by Vitest in headless Chromium: a smoke render plus its `play()` interactions and axe accessibility checks. The owner of component behaviour tests.
_Avoid_: Visual test, snapshot test, component unit test

**Scenario (MSW)**:
A named set of handlers in `scenarios` (`src/mock/handlers/index.ts`), e.g. `scenarios.inbox.empty`, composed with `withScenario(...)`, most specific first.
_Avoid_: Mock mode, fake state, stub set

**Story harness**:
A small component inside a stories file that supplies what a page controller would, typically a `useForm` with the real `zodResolver`, so a pure form pattern can be rendered and tested.
_Avoid_: Wrapper story, test container

**Component Registry**:
The generated inventory `docs/11-component-registry.md` (`pnpm docs:registry`) of every module, story, mock, controller, fixture and scenario.
_Avoid_: Component list, catalog doc
