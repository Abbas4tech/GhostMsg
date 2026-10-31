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
A temporary, time-limited numerical one-time pass code sent via email to confirm ownership of an email address during registration. Valid for an hour and three tries; a new one can be requested once a minute.
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
An anonymous message flagged by content moderation as toxic, abusive, or spam, isolated into a separate inbox view rather than delivered to the primary inbox. It carries a **quarantine reason** (hurtful, spam or threat) shown as its tag.
_Avoid_: Spam, deleted message, hidden feedback

**Archived Message**:
An anonymous message the recipient set aside with Archive (`e`). It leaves All, Unread and Starred and is listed only under the Archived filter until moved back to the inbox. Archiving deletes nothing.
_Avoid_: Hidden message, deleted message, snoozed

**AMA Prompt**:
A recipient-defined theme, topic, or question displayed on their public profile link to guide visitor submissions.
_Avoid_: Bio, status, custom headline, bio title

**Sentiment Tag**:
A classification label representing the emotional tone of an anonymous message.
_Avoid_: Vibe, mood score, AI emotion, category

**Display Name**:
The optional name a recipient shows on their public profile instead of their username (max 40 characters; empty means the username).
_Avoid_: Nickname, full name, screen name

**Toxicity Level**:
The graded moderation verdict for an anonymous message: `none`, `borderline`, `hurtful` or `severe`. Decides quarantine together with the recipient's Quarantine Sensitivity.
_Avoid_: Toxicity score, spam score, abuse flag

**Quarantine Sensitivity**:
A recipient's chosen threshold for holding messages back: Relaxed (severe only), Balanced (hurtful and up, default) or Strict (borderline and up).
_Avoid_: Filter level, strictness, moderation mode

**Spicy Blur**:
A recipient preference that conceals messages tagged Spicy until the recipient taps to reveal them. A presentation choice, not moderation.
_Avoid_: NSFW filter, spicy quarantine

**Quiet Hours**:
A daily window, in the recipient's time zone, during which no email or push alerts are sent. Messages still arrive in the inbox.
_Avoid_: Do not disturb, mute, snooze

**Daily Digest**:
A once-a-day email (for recipients whose email alerts are set to "Daily digest") summarising new non-quarantined messages since the previous digest: a count, plus up to three previews unless message text is hidden.
_Avoid_: Newsletter, summary email, batch alert

**Hidden Preview**:
An alert that says "New Anonymous Message" instead of showing the message text. The default for every recipient.
_Avoid_: Private notification, redacted alert

**Smart Reply**:
An AI-drafted answer to an anonymous message. Opening Reply offers three drafts at once, one per tone (thoughtful, witty, wholesome); the recipient picks one and edits it before saving.
_Avoid_: Auto-reply, AI answer, canned response

**Story Card**:
A shareable PNG image (9:16 or 1:1) of an anonymous message and optionally its answer and the recipient's link, rendered from the live palette. Never shows the sender.
_Avoid_: Screenshot, share image, social card

**Blocked Sender**:
A Sender Hash on the recipient's blocklist, with the date it was blocked. Messages from it are silently dropped.
_Avoid_: Banned user, blocked account, blocked IP

**Danger Zone**:
The Settings section for irreversible actions: deleting all messages (with a 10-second undo) and deleting the account (typed username confirmation).
_Avoid_: Account deletion page, advanced settings

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

**Server module**:
Code under `src/server/` that may only run on the server (DB, mail, AI, secrets). Every file starts with `import "server-only"`.
_Avoid_: Backend util, helper, lib function

**Data layer**:
`src/data/`: the client API client, query keys, `queryOptions` factories, mutation hooks and live-update hooks. Imported only by page controllers.
_Avoid_: Services, API helpers, fetchers

**Utility (`*.utils.ts`)**:
A pure function colocated with the one module that uses it. Promoted to `src/lib/<domain>/` once two or more modules use it.
_Avoid_: Helper file, misc, common

**Controller test**:
A colocated `use-*.controller.test.ts` that renders one page controller with `renderHookWithProviders` and drives it against MSW scenarios. Only edges (router, toasts, `signIn`, browser side effects) are mocked (ADR 0019).
_Avoid_: Hook test, integration test (for this file type)

**Request recording**:
`recordRequests()` from `src/test/test-utils.tsx`: a per-test list of `"METHOD /path"` strings for every request MSW saw, used to assert that a controller did or did not call the API.
_Avoid_: Spy on fetch, mock the mutation

**Push subscription**:
One device's browser `PushSubscription` (`endpoint` + `keys`) stored in `User.pushSubscriptions`. Created when the recipient enables browser push, replaced on resubscribe, and pruned when the push service reports it gone (ADR 0020).
_Avoid_: Device token, FCM token

**Optimistic update**:
A cache change applied in `onMutate` before the server answers, rolled back from a snapshot in `onError`. Inbox messages use the helpers in `src/data/messages/messages-cache.ts` (ADR 0021, ADR 0030); settings-like resources use the Optimistic resource mutation.
_Avoid_: Fake update, local-only change

**Optimistic resource mutation**:
The factory `useOptimisticResourceMutation` (`src/data/optimistic-resource-mutation.ts`) behind every settings-like save (acceptance, notifications, preferences, profile): optimistic, queued per resource (`scopeId`) so the last change wins, silent on success unless given a message, one error toast and a rollback on failure (ADR 0031).
_Avoid_: Settings hook, save mutation

**DTO**:
A client-facing data shape derived from the generated OpenAPI schema (`src/types/api.ts`), e.g. `MessageDto`. Distinct from the Mongoose model types on the server.
_Avoid_: Model (on the client), entity

**DTO mapper**:
A pure server function in `src/server/users/user-dto.ts` (`toUserProfile`, `toUserPreferences`, `toNotificationSettings`, `toBlockedSenders`) that turns a user document into an API shape and fills defaults for fields older documents lack.
_Avoid_: Serializer, transformer, presenter

**Policy (server)**:
A pure, unit-tested decision function used by a route: `shouldQuarantine` (quarantine policy) and `isWithinQuietHours` / `buildAlertPreview` (delivery policy).
_Avoid_: Rule engine, service, helper

## Design Language

**Palette**:
One of three colour, font, radius and shadow systems (`spectral` Soft spectral, `midnight` Midnight confessional, `paper` Playful paper), set as `data-palette` on `<html>` and stored per device.
_Avoid_: Theme (alone), skin, colour scheme

**Mode**:
Light, dark or system, owned by `next-themes` through the `.dark` class. Independent of the palette.
_Avoid_: Theme (alone), appearance

**Design token**:
A CSS variable in `src/app/globals.css` defined for all six palette × mode combinations and exposed as a Tailwind utility (`bg-primary`, `shadow-soft`, `font-display`).
_Avoid_: Hard-coded colour, Tailwind palette colour

**Variant (element)**:
An opt-in CVA option inside an element (`Badge variant="count"`, `ToggleGroup variant="segment"`) that carries a design look. The default variant always stays identical to upstream shadcn.
_Avoid_: Custom class, override, skin

**Draft (profile)**:
Unsaved Profile page edits: a react-hook-form form fed by the server profile, shown in the live preview until **Save changes** (one `PATCH` with only the changed fields) or **Discard**. Protected by the Leave guard.
_Avoid_: Pending state, dirty form

**Inbox counts**:
The server-computed number of messages per inbox filter plus the overall total (`GET /api/messages/counts`). Badges and "Delete all N" use these, never the loaded page.
_Avoid_: Local count, page length

**Inbox cursor**:
The opaque keyset position `"<ISO createdAt>_<id>"` of the last message on an inbox page, passed back as `cursor` to fetch the next page.
_Avoid_: Offset, page number

**Selection scope**:
The inbox filter + search a selection belongs to. Changing either starts a new selection, and only loaded messages count as selected, so a bulk action never reaches a message the Recipient can't see (`toggleScopedSelection`, `visibleSelection`).
_Avoid_: Global selection, checked ids

**Leave guard**:
The protection for unsaved edits (`useLeaveGuard`): the browser prompt on close/reload, and a "Discard unsaved changes?" dialog before following an in-app link.
_Avoid_: Navigation blocker, exit popup

**Undo window**:
The 10-second delay, with an Undo toast, between confirming Delete all and the request being sent. Leaving the page commits it.
_Avoid_: Soft delete, trash

**Documentation screenshot**:
A PNG in `docs/assets/screenshots/` generated from a Storybook story by `pnpm docs:screenshots`. Never hand-made.
_Avoid_: Mockup, hand-captured image

## Infrastructure Language

**HCP Terraform Workspace**:
The CLI-driven remote state backend in HCP Terraform (organization `PersonalAbbasSpace`, workspace `ghostmsg`) used by `terraform/` for state locking and shared team state without VCS auto-triggers.
_Avoid_: Local state, VCS workspace, Terraform Cloud project

**App Environment Variable (`app_env_vars`)**:
The Terraform map in `terraform/variables.tf` configuring per-environment (`production`, `preview`, `development`) values for Vercel, flattened into discrete `vercel_project_environment_variable` resources.
_Avoid_: Global env var, system variable

**Adopted Resource**:
A pre-existing cloud resource (Vercel project, MongoDB Atlas M0 cluster, existing production env vars) brought under Terraform management via `terraform import` rather than recreated.
_Avoid_: Recreated resource, orphan resource

**Database User Isolation**:
The security boundary wherein the shared Atlas cluster hosts two separate MongoDB database users (`honest-feedback-production` and `honest-feedback-preview`), each scoped exclusively with `readWrite` access to its own database (`honest_feedback` vs `honest_feedback_preview`).
_Avoid_: Shared database, cluster admin user

