# Chapter 12: Product Guide & Feature Catalog

What GhostMsg does, for whom, on which screen, and which code owns each behaviour. Read this before changing a feature so the change keeps the product's promises. Terms in **bold** are defined in [`GLOSSARY.md`](../GLOSSARY.md); use them verbatim in code, tests, issues and docs.

> **Snapshot date:** 2026-10-14, after the Claude Design redesign ([ADR 0022](adr/0022-palette-theming-and-claude-design-redesign.md)), the shadcn-first rebuild ([ADR 0023](adr/0023-shadcn-first-elements-and-profile-settings-backend.md)) and the Profile & Settings backend ([ADR 0024](adr/0024-profile-preferences-data-model-and-settings-api.md)–[0027](adr/0027-destructive-account-actions-undo-window-and-typed-confirmation.md)). Screens below are captured from Storybook with `pnpm docs:screenshots` ([Chapter 14](14-ui-screens-and-user-flows.md#10-how-screenshots-are-produced)).

---

## 1. The product in one paragraph

A **Recipient** signs up, claims a **Public Profile Link** (`/u/<username>`) and shares it in a bio. Anyone who opens the link (a **visitor**, who never signs in) writes an **Anonymous Message**. Before it reaches the inbox the message is classified with a **Sentiment Tag** and a graded toxicity, and may become a **Quarantined Message**. The Recipient triages the inbox, answers messages (optionally with AI **Smart Reply** drafts), publishes answers as **Public Q&A** on their profile, and shares them as a **Story Card** image. The sender's identity is never stored; only a per-recipient **Sender Hash** exists, so the Recipient can block a sender without ever learning who they are.

```mermaid
flowchart LR
    V["Visitor<br/>(no account)"] -->|"opens /u/maya"| PP["Public Profile"]
    PP -->|"writes"| AM["Anonymous Message"]
    AM -->|"moderation + Sentiment Tag"| GATE{"Quarantine<br/>policy"}
    GATE -->|"clean"| INBOX["Inbox"]
    GATE -->|"held"| Q["Quarantined"]
    INBOX -->|"answer"| QA["Public Q&A"]
    QA -->|"shown on"| PP
    QA -->|"export"| SC["Story Card<br/>(9:16 / 1:1 PNG)"]
    SC -->|"posted to socials"| V
```

The loop on the right is the growth engine: answered messages become shareable content that sends new visitors to the link.

## 2. Personas and promises

| Persona | Who | What we promise them | Where the promise is enforced |
| :--- | :--- | :--- | :--- |
| **Recipient** | Registered, verified user who owns a link. | Control: what arrives, when they're notified, what's public, what's hidden, and the ability to leave with their data. | Settings ([§5.7](#57-settings-dashboardsettings)), quarantine policy ([Chapter 17](17-trust-safety-and-privacy.md)), danger zone ([ADR 0027](adr/0027-destructive-account-actions-undo-window-and-typed-confirmation.md)). |
| **Visitor / sender** | Anyone with the link. No account, no sign-in. | Anonymity: the Recipient never sees who they are. Low friction: one text box, optional ideas. | Sender Hash instead of IP ([Chapter 17 §2](17-trust-safety-and-privacy.md#2-anonymity-model)), `/u/[username]` needs no session. |
| **Operator** (us) | Maintainers. | Abuse is contained without reading messages. | Rate limiting, AI moderation, silent blocking ([Chapter 17](17-trust-safety-and-privacy.md)). |

**Product principles**, which settle design arguments:

1. **Anonymous by design.** Never store or show anything that identifies a sender: no IP, no user agent, no account. The Sender Hash is per Recipient and one-way.
2. **The Recipient is in control and calm.** Harmful content is held back, blurred or silenced, never auto-deleted. Pausing is a "breather", not an error. Every destructive action is either undoable or typed-to-confirm.
3. **Senders never hit a wall they can learn from.** A blocked sender still sees "Sent." (silent shadowban). A paused profile says so up front, before they type.
4. **Answers are opt-in public.** Nothing becomes public without an explicit "Show in my Public Q&A" choice (default: `publishByDefault` preference, off).
5. **Accessible and themeable everywhere.** Every screen works in 3 palettes × light/dark, at 44px touch targets, with keyboard paths and AA contrast ([Chapter 13](13-design-system-and-theming.md)).

## 3. Surface map (routes)

| Route | Audience | Auth | Page component (`src/components/pages/…`) | Controllers | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Everyone | Signed-in users are redirected to `/dashboard` by `src/middleware.ts` | `home/home-page.tsx` | `use-claim-link` | [landing](assets/screenshots/landing.png) |
| `/sign-up` | Guests | Guest-only (middleware) | `auth/sign-up/` | `use-sign-up`, `use-google-sign-in` | [sign-up](assets/screenshots/sign-up.png) |
| `/verify/[username]` | New users | Guest-only | `auth/verify/` | `use-verify` | [verify](assets/screenshots/verify.png) |
| `/sign-in` | Guests | Guest-only | `auth/sign-in/` | `use-sign-in`, `use-google-sign-in` | [sign-in](assets/screenshots/sign-in.png) |
| `/dashboard` | Recipient | Session (middleware + `DashboardLayout` gate) | `dashboard/inbox-page.tsx` | `use-inbox` (= `use-inbox-filters` + `use-inbox-data`), `use-inbox-keyboard`, `use-smart-reply` | [inbox](assets/screenshots/dashboard-inbox.png) |
| `/dashboard?filter=unread\|starred\|answered\|quarantined` | Recipient | Session | same | `initialStatus` / `initialQuery` from `?filter=` / `?q=` | — |
| `/dashboard/profile` | Recipient | Session | `dashboard/profile-page.tsx` | `use-profile`, `use-change-username`, `use-profile-link` | [profile](assets/screenshots/dashboard-profile.png) |
| `/dashboard/settings` | Recipient | Session | `dashboard/settings-page.tsx` | `use-settings`, `use-appearance`, `use-danger-zone` | [settings](assets/screenshots/dashboard-settings.png) |
| `/u/[username]` | Visitors | None | `public-profile/public-profile-page.tsx` | `use-public-answers`, `use-send-message` | [public profile](assets/screenshots/public-profile.png) |
| `/docs` | Developers | None | Scalar API reference over `/api/openapi.json` | — | — |
| any unknown path | Everyone | None | `not-found/not-found-page.tsx` | — | — |

Every dashboard route renders inside `DashboardLayout` (`pages/dashboard/dashboard-layout.tsx`): session gate → `DashboardShell` (shadcn Sidebar) → routed page, plus the ⌘K `CommandPalette`. The route layout (`app/(dashboard)/dashboard/layout.tsx`) reads the session on the server and hands it to `SessionProvider`, so a signed-in visit renders without a loading flash. See [Chapter 14](14-ui-screens-and-user-flows.md) for the composition of every screen.

## 4. Core journeys

### 4.1 Recipient onboarding

```mermaid
sequenceDiagram
    autonumber
    actor R as Recipient
    participant L as Landing (/)
    participant SU as /sign-up
    participant API as API
    participant M as SMTP
    participant V as /verify/[username]
    participant D as /dashboard

    R->>L: Types a username in "Claim your link"
    L->>SU: router.push(/sign-up?username=maya)
    SU->>API: GET /api/check-username-unique (debounced)
    R->>SU: Email + password (or Continue with Google)
    SU->>API: POST /api/sign-up
    API->>M: 6-digit Verification Code (expires in 1 hour)
    SU->>V: redirect
    R->>V: Enters the code (3 tries per code)
    V->>API: POST /api/verify-code
    opt Wrong, expired or locked
        V->>API: POST /api/verify-code/resend (after the 60 s cooldown)
        API->>M: New code, tries reset
    end
    V->>R: "You're in. Your link is live." + Copy / Share…
    R->>D: Sign in to open your inbox → /sign-in → /dashboard
```

Google sign-in skips the code: `controlGoogleSignInFlow` creates or links the account ([ADR 0002](adr/0002-dual-authentication-and-email-verification.md)).

### 4.2 A visitor sends a message

```mermaid
sequenceDiagram
    autonumber
    actor S as Visitor
    participant P as /u/maya
    participant A as GET /api/public/maya/answers
    participant SG as GET /api/suggest-messages
    participant SM as POST /api/send-message

    S->>P: Opens the link
    P->>A: Profile + Public Q&A + settings
    alt username unknown
        P-->>S: "Nobody's home at this link." + Claim /u/maya
    else Message Acceptance is off
        P-->>S: "maya is taking a breather." (form disabled, answers still visible)
    else accepting
        opt offerSuggestions = true
            P->>SG: 3 Suggested Messages (after the profile loads)
        end
        S->>SM: { username, content } (10–300 chars)
        SM-->>S: 200 "Sent. maya will never know it was you."
    end
```

The server pipeline behind `POST /api/send-message` (rate limit → Sender Hash → blocklist → moderation → quarantine policy → store → live event → alerts) is in [Chapter 17 §3](17-trust-safety-and-privacy.md#3-the-send-pipeline).

### 4.3 Triage, answer, publish, share

```mermaid
stateDiagram-v2
    [*] --> Unread: new message (SSE pushes it into open tabs)
    [*] --> Quarantined: quarantine policy held it
    Quarantined --> Revealed: Reveal (dialog, "Keep hidden" has focus)
    Unread --> Read: opened / Mark read / bulk
    Read --> Starred: s / star button
    Starred --> Read: unstar
    Read --> Answered: Reply → Save answer
    Answered --> PublicQA: "Show in my Public Q&A" on
    PublicQA --> Answered: toggle off
    PublicQA --> StoryCard: Share as Story Card
    Unread --> [*]: Delete / Block sender (+ delete)
    Read --> [*]: Delete
    Answered --> [*]: Delete (the public answer goes too)
```

`Revealed` is client state only (`revealedIds` in `use-inbox.controller.ts`); a reload hides the message again. Quarantined messages never alert ([Chapter 18](18-notifications-and-realtime.md)).

## 5. Feature catalog

Each entry lists **what**, **rules** (invariants to keep), and **where** (UI → controller → data hook → API). File paths are relative to `src/`.

### 5.1 Claim your link (landing)

- **What:** The hero's `ClaimLinkForm` shows `<host>/u/` and a username box; submitting opens `/sign-up?username=<name>`. The landing also has How it works, Trust, a Q&A showcase and a CTA banner ([screenshot](assets/screenshots/landing.png), [phone](assets/screenshots/landing-mobile.png)). Phones follow MobLanding: full-width "Get my link", a How it works carousel with a step counter and pill dots, trust as icon rows, the Story Card alone (no Q&A sample), and a split CTA.
- **Rules:** The landing is marketing only; it never calls the API. Copy for the illustrations lives in `content/landing.ts` and is example data, never real users. "See a live profile" shows only when `NEXT_PUBLIC_LIVE_PROFILE_USERNAME` names a real public profile. Landing sections switch layouts with CSS only, so the server-rendered page never changes after hydration.
- **Where:** `pages/home/home-page.tsx` → `use-claim-link.controller.ts` (`buildClaimHref`, `buildLinkPrefix`, `buildLiveProfileHref` in `home.utils.ts`).

### 5.2 Sign up, verify, sign in

- **What:** Username (live availability), email, password (Show / Hide); or Google. A 6-digit **Verification Code** is emailed (1-hour expiry). The verify screen counts down to **Resend code** (60 s), shows the tries left after a wrong code ("That code isn't right. 2 tries left."), and ends on **"You're in. Your link is live."** with the new link, Copy / Share… and **Sign in to open your inbox** (verifying doesn't sign in). Sign in accepts email **or** username. Phones: no site header; each screen has its own Back arrow (sign-up and verify add "1 / 2", "2 / 2" progress) and the primary action pinned to the bottom.
- **Rules:**
  - Unverified credential accounts can't sign in. Google accounts have no password (sign-in says "Please sign in with Google").
  - Three wrong guesses lock the code (429, `reason: "locked"`); an expired code answers 400 `reason: "expired"`. Both need a new code.
  - Resend waits 60 s after the last code (429 with `retryAfterSeconds`), is limited to 5 per username per 10 minutes, and resets the tries. Rules live in `lib/users/verification.ts`; codes come from `server/users/verification-code.ts` (`crypto.randomInt`).
- **Where:** `pages/auth/*` → `data/auth/*` → `/api/check-username-unique`, `/api/sign-up`, `/api/verify-code`, `/api/verify-code/resend`, NextAuth `/api/auth/*`. Verify: `use-verify.controller.ts`, `use-resend-cooldown.controller.ts`, `verify.utils.ts` → `patterns/verify-code-form`, `blocks/verify-panel`, `blocks/verify-success`. Username availability logic: `lib/users/username-availability.ts` (shared with Change username).

### 5.3 Public profile (`/u/[username]`)

- **What:** Identity (photo or initial, **Display Name** or username, "@handle · Accepting" / "@handle · Paused"), the **AMA Prompt** banner, the send form with **Suggested Messages**, and the **Public Q&A** feed. States: sending; **sent** (the whole page becomes "Sent. maya will never know it was you." with the message under "You sent", Send another and Get your own link, and a "‹ Name" back); **paused** (a calm card and one "Make your own link"); **not found** (Claim /u/name, Go to GhostMsg) ([screens](14-ui-screens-and-user-flows.md#5-public-profile-uusername)).
- **Rules:**
  - The AMA banner shows only when `showAmaBanner` is on. Suggested Messages show and load only when `offerSuggestions` is on, and only after the profile has loaded.
  - When paused, answers stay readable and the form is replaced, never silently broken.
  - A 404 renders the not-found state without retries.
- **Where:** `pages/public-profile/` → `use-public-answers.controller.ts` (`messagesQueries.publicAnswers`), `use-send-message.controller.ts` (`useSendMessageMutation`, `publicQueries.suggestions`) → `GET /api/public/{username}/answers`, `GET /api/suggest-messages` (Edge), `POST /api/send-message`.

### 5.4 Inbox (`/dashboard`)

| Capability | Behaviour | Code |
| :--- | :--- | :--- |
| **Filters** | All · Unread · Starred · Answered · Quarantined, plus **Archived** once anything is archived, with counts from the server (Quarantined shows an attention badge). A ToggleGroup of chips. Each filter is fetched from the server; `?filter=` deep-links one. Archived messages appear only under Archived. | `patterns/filter-bar`, `messagesQueries.inbox` / `messagesQueries.counts`, rules in `lib/messages/inbox-filter.ts` ([ADR 0030](adr/0030-server-side-inbox-filtering-paging-and-counts.md)) |
| **Search** | Server-side, case-insensitive match on the message or its answer, 250 ms after typing stops; `/` focuses the box. The filter and search are kept in the URL (`?filter=&q=`), so refresh and shared links restore the view. | `searchFilter` in `server/messages/inbox-query.ts`, `use-inbox-filters.controller.ts` |
| **Paging** | 12 messages per page, newest first; **Load more** fetches the next page. Counts and "Delete all N" use server totals, not the loaded page. | `useInfiniteQuery`, keyset cursor (`lib/messages/inbox-cursor.ts`) |
| **Read state** | A card that stays at least 60% on screen for 600 ms is marked read (never quarantined or blurred ones). Opening Reply or the Story Card, revealing and starring also mark it read (optimistic); answering marks it read on the server too. Bulk **Mark read** and the phone sheet's Mark as unread/read still work. | `markRead` / `handleSeen` in `use-inbox.controller.ts`, `useMarkSeen` in `patterns/message-card` |
| **Archive** | `e`, the card's Archive icon or the phone sheet. The card leaves the list at once with a plain "Message archived" toast (no Undo); in the Archived view the same action says "Moved back to Inbox". | `use-archive-message-mutation.ts` → `PATCH /api/messages/{id}` (`isArchived`) |
| **Layouts** | Grid or list (segmented ToggleGroup), remembered on this device. | `viewMode` (`localStorage`) in `use-inbox.controller.ts` |
| **Live updates** | New messages appear at once through Server-Sent Events (inserted into the list and counts, then re-synced). Scrolled down, a "1 new Anonymous Message" pill appears instead of the list jumping. If the stream drops, the inbox polls every 30 s; it also refreshes when the tab regains focus. The subtitle says when the list last came back ("3 unread · last checked a moment ago"). | `data/messages/use-live-messages.ts` → `/api/messages/stream`, `use-inbox-data.controller.ts` |
| **Keyboard triage** | `j`/`k` move, `⇧J`/`⇧K` extend the selection, `x` select, `s` star, `r` reply, `e` archive, `⇧B` block, `#` delete (confirms), `esc` clear the selection, `/` search, `⌘K`/`Ctrl+K` command palette. Anywhere in the dashboard: `g i` / `g p` / `g s` go to Inbox / Profile / Settings, `⇧C` copies your link, `?` opens the shortcut sheet. Ignored while typing or when a dialog is open; never acts on a quarantined message. Tooltips on card actions show their key. | `use-inbox-keyboard.controller.ts`, `use-global-shortcuts.controller.ts`, `inbox.utils.ts` (`resolveInboxShortcut`), `lib/browser/shortcuts.ts`, `patterns/shortcut-sheet` |
| **Bulk actions** | Select cards → Mark read, Star, Export CSV/JSON, Delete. Mark read / Star are optimistic with rollback. **Delete asks first** ("Delete N messages?", counting public answers that go too, "This can't be undone."), then deletes at once, optimistic with rollback; there is no Undo ([ADR 0034](adr/0034-confirmed-message-deletes-undo-for-delete-all-and-phone-dashboard-chrome.md)). The selection belongs to the current filter + search: changing either clears it, so an action never reaches a hidden message. Phones: tap **Select** in the top bar for checkboxes, a "N selected · Select all" header and a bottom bar (Mark read, Star, Export, Delete). | `patterns/bulk-action-toolbar` (`layout="pill"` / `"bar"`), `patterns/modals/delete-selected-modal.tsx`, `bulkDelete` in `use-inbox.controller.ts` → `POST /api/messages/bulk` |
| **Message card** | Sentiment Tag, relative time, star, answer preview with Public badge, Reply/Edit answer, Story Card, Archive, Block, Delete (tooltips show `s`, `r`, `e`, `⇧B`, `#`). States: default, unread (accent bar), selected, answered (✓, "✓ Answered" once the card is 24rem wide; tinted card), quarantined (dashed + hidden body, tagged with its reason: Hurtful language, Spam or Threat; older ones say Quarantined). Phones: tonal Reply, Share, and a **More actions** sheet (Reply, Star, Share as Story Card, Archive / Move to Inbox, Mark as unread/read, Block sender…, Delete); quarantined cards show Reveal + Block sender (or Delete). | `patterns/message-card`, `patterns/message-actions-menu` |
| **Empty / error / loading** | Four empty states (design Feedback board): first run ("No Anonymous Messages yet", floating ghost, Copy link), an empty filter ("Nothing unread · You're all caught up." + Clear filter), nothing quarantined ("Nothing held back"), and no search matches (`No matches for "q"`). Skeletons appear only after 150 ms. A failed load shows the empty state and the error toasts on **Refresh** (the initial load fails quietly). | `blocks/inbox` (`InboxEmptyState`, `useDelayedFlag`), `handleRefresh` in `use-inbox-data.controller.ts` |

**Sentiment Tags** (set by moderation, never by the Recipient): 💖 Sweet · 🤔 Curious · 🔥 Spicy · 💡 Advice · 👻 Note (`neutral`).

### 5.5 Message actions (dialogs)

| Dialog | Trigger | Rules | Code |
| :--- | :--- | :--- | :--- |
| **Smart Reply** | Reply / Edit answer / `r` | Opening it loads **three drafts, one per tone** (thoughtful, witty, wholesome) from **one** AI request, cached per message for the session (never refetched on focus or retried); three skeleton rows while loading, "Try again" if it fails. Picking an idea fills the answer; the Recipient edits freely. "Show in my Public Q&A" starts at the `publishByDefault` preference. Save answer, or Answer + Story Card. Phones: a "Reply" drawer, ideas scroll sideways, Save + Story Card side by side. | `patterns/modals/smart-reply-modal.tsx`, `use-smart-reply.controller.ts`, `data/messages/smart-reply.queries.ts` → `POST /api/ai/smart-reply`, `POST /api/messages/{id}/reply` |
| **Story Card** | Share icon | Renders the exact PNG: Story 9:16 or Square 1:1, Gradient or Plain, include answer, show link. Uses the live palette tokens. Native share when the browser supports files, else Save image. Never shows the sender. Phones (MobDrawerStory): the preview, Format, "Include my answer", then Save + Share…; Look and the link keep their defaults. | `patterns/modals/story-card-modal.tsx`, `story-card.canvas.ts` |
| **Reveal** | Reveal on a quarantined (or blurred Spicy) card | Quarantined: confirm dialog where **Keep hidden** has initial focus. Spicy blur reveals without a dialog. | `reveal-message-modal.tsx` |
| **Block sender** | Block icon | Blocks the Sender Hash (silent to the sender) and optionally deletes the message. Not offered for legacy messages without a hash. | `block-sender-modal.tsx` → `POST /api/block-sender` |
| **Delete message** | Trash icon / `#` / Delete in the phone sheet | **Asks first** ("Delete this message? … This can't be undone."), then deletes at once, optimistic: the dialog closes and the card goes before the server answers; a failure brings it back with an error toast. No Undo ([ADR 0034](adr/0034-confirmed-message-deletes-undo-for-delete-all-and-phone-dashboard-chrome.md)). | `delete-message-modal.tsx`, `handleDeleteConfirm` in `use-inbox.controller.ts` → `DELETE /api/delete-message/{id}` |

### 5.6 Profile (`/dashboard/profile`)

![Profile page](assets/screenshots/dashboard-profile.png)

| Card | Controls | Rules | API |
| :--- | :--- | :--- | :--- |
| **Identity** | Photo (Change / Remove), Display Name (0–40), Username with **Change** | The photo is center-cropped and resized in the browser to 256px WebP (JPEG fallback) and stored as a data URL ≤ 350,000 chars. An empty Display Name falls back to the username. | `PATCH /api/user/profile` |
| **Change username** dialog | New username with live availability (✓ / ✗ / spinner) | Saving updates the NextAuth session (`update({ username })`) and refreshes the router. **The old link stops working**: there is no redirect ([ADR 0027](adr/0027-destructive-account-actions-undo-window-and-typed-confirmation.md)). | `PATCH /api/user/username` (409 when taken) |
| **Your Public Profile Link** | Copy, Share… (native share sheet when available) | Shown without protocol. | — |
| **AMA Prompt** | Text (≤120, counter warns from 100), idea chips, **Suggest with AI**, **Show the AMA banner** | AI ideas riff on the current prompt; fixed fallbacks when AI is unavailable. | `PATCH /api/user/profile` (with the rest of the profile), `POST /api/ai/ama-suggestions` |
| **What visitors see** | Live preview | Mirrors the draft before saving; not interactive. | — |
| **Unsaved changes bar** | Discard / Save changes | Edits are a **draft** (react-hook-form) until saved; Save sends only the changed fields in one request. Leaving with unsaved edits asks first (**Discard unsaved changes?**, "Keep editing" focused); closing the tab shows the browser prompt. | `PATCH /api/user/profile` |

### 5.7 Settings (`/dashboard/settings`)

![Settings page](assets/screenshots/dashboard-settings.png)

A scroll-spy **section nav** (desktop) follows the sections. Every control saves immediately and optimistically (no Save button) and quietly: the control moving is the confirmation, so there is no success toast. Rapid changes to one section are sent in order and the last one wins; a failure rolls back and shows one error toast.

| Section | Setting | Stored as | Effect |
| :--- | :--- | :--- | :--- |
| Messages | **Message Acceptance** | `User.isAcceptingMessage` | Off → the public profile shows the paused state; `POST /api/send-message` answers 404 "not accepting". Also in the sidebar footer and ⌘K. |
| Messages | Offer Suggested Messages to visitors | `messagePreferences.offerSuggestions` | Hides and skips AI suggestions on `/u/[username]`. |
| Messages | Publish answers to my Public Q&A by default | `messagePreferences.publishByDefault` | Initial state of the publish switch in Smart Reply. |
| Safety | Quarantine toxic and spam | `safetySettings.quarantineEnabled` | Off → everything goes to the main inbox. |
| Safety | Sensitivity: Relaxed · Balanced · Strict | `safetySettings.sensitivity` | Threshold on the graded toxicity ([Chapter 17 §4](17-trust-safety-and-privacy.md#4-moderation-and-the-quarantine-policy)). Disabled while quarantine is off. |
| Safety | Blur Spicy 🔥 messages until opened | `safetySettings.blurSpicy` | Spicy cards render concealed ("Spicy 🔥 Reveal to read."). Client-side only. |
| Safety | Blocked senders table | `blockedSenderHashes` + `blockedSenders[{hash, blockedAt}]` | Shows `#01a8…e4` handles and dates; Unblock per row. |
| Notifications | Email me about new Anonymous Messages: Instant · Daily digest · Off | `notificationSettings.emailAlerts` | Instant sends one email per message. Daily digest sends one summary a day (17:00 UTC) of new non-quarantined messages since the last digest ([ADR 0029](adr/0029-daily-digest-scheduling-and-alert-privacy-fixes.md)). |
| Notifications | Push notifications (this device) | this browser's subscription + `pushSubscriptions[]` (`webPushEnabled` = any device) | On only when this browser is subscribed. Turning it off removes this device only; other devices keep receiving pushes ([ADR 0020](adr/0020-web-push-delivery-vapid-and-subscription-lifecycle.md), [ADR 0030](adr/0030-server-side-inbox-filtering-paging-and-counts.md) D9). |
| Notifications | Hide message text in notifications (default **on**) | `notificationSettings.hideMessageText` | Alerts say "New Anonymous Message" instead of the text. |
| Notifications | Quiet hours (switch + start/end, 30-min steps) | `notificationSettings.quietHours{enabled,start,end,timeZone}` | No email or push inside the window; the browser's IANA time zone is saved with it. |
| Appearance | Mode: Light · Dark · System | `next-themes` (browser storage) | Per device, not per account. |
| Appearance | Palette: Soft spectral · Midnight confessional · Playful paper | `localStorage["ghostmsg-palette"]` | Per device ([Chapter 13](13-design-system-and-theming.md)). |
| Data & account | Export all messages (CSV / JSON) | — | Pages through the server for **every** message (quarantined included) and builds the file in the browser. Both formats use an allow-list of fields; Sender Hashes are never included. |
| Danger zone | Delete all messages | — | Confirm dialog → **10-second Undo toast** (with a time-left bar) → `DELETE /api/messages` when the toast closes without Undo. Leaving the page commits immediately. |
| Danger zone | Delete account and link | — | Type the username to enable → `DELETE /api/user` → sign out to `/`. |

### 5.8 Dashboard shell

- **Sidebar** (desktop): brand, **Jump to… ⌘K**, nav (Inbox with unread count, Profile, Settings), the link card with Copy (and a Share icon where the browser can share), **Message Acceptance** switch with status, and a user row (avatar, light/dark toggle, log out). Palettes are chosen in Settings → Appearance only.
- **Phones:** a 52px top bar (brand tile plus the page's own actions) and a bottom tab bar ([screenshot](assets/screenshots/dashboard-inbox-mobile.png)); Message Acceptance and Sign out live in Settings.
- **Command palette (⌘K):** Copy my link (`⇧C`), Pause/Resume Message Acceptance, View my public profile, Inbox (`g i`), Inbox · Unread, Inbox · Starred, Profile (`g p`), Settings (`g s`). Typing filters by substring.
- **Shortcut sheet (`?`):** every key, grouped Inbox / Message / Anywhere.
- **Toasts:** through `notify` (success 3 s, info/warning 5 s, errors 6 s or until dismissed when they carry an action; errors are also announced assertively).
- **Where:** `blocks/dashboard-shell`, `patterns/command-palette`, `patterns/shortcut-sheet`, `pages/dashboard/use-dashboard-shell.controller.ts`, `use-global-shortcuts.controller.ts`, `elements/sonner/notify.ts`.

## 6. Known gaps and non-goals

Record of what is intentionally **not** built, so nobody "fixes" an expected absence or promises it to users.

| Gap | Status | Why / next step |
| :--- | :--- | :--- |
| Unblock all | `DELETE /api/block-sender { senderHash: "ALL" }` and `handleUnblockAll` exist; no button in the redesigned Settings. | Design omitted it. Add a row action if users ask. |
| Forgot password | Not built; the sign-in screen has no "Forgot?" link. | Left out on purpose until a reset flow exists. |
| Undo for single and bulk message deletes | Not offered: those deletes confirm first. | Product decision ([ADR 0034](adr/0034-confirmed-message-deletes-undo-for-delete-all-and-phone-dashboard-chrome.md)); only Delete all keeps an Undo. |
| Rate limiting / live events across instances | In-memory per server instance. | Fine on a single long-lived Node server; on multi-instance serverless each instance limits and broadcasts separately ([Chapter 18 §5](18-notifications-and-realtime.md#scaling-limits)). |
| Avatar storage | Base64 data URL inside the User document. | Small (≈15–40 KB) and simple; move to object storage before profile pictures get larger ([ADR 0024](adr/0024-profile-preferences-data-model-and-settings-api.md)). |
| Username redirects | Old links 404 after a rename. | Deliberate privacy choice ([ADR 0027](adr/0027-destructive-account-actions-undo-window-and-typed-confirmation.md)). |
| Server-side theme preference | Palette and mode are per device. | No account field; keep it client-only unless sync is requested. |

## 7. Where to go next

| You want to… | Read |
| :--- | :--- |
| See every screen and how it's composed | [Chapter 14: UI Screens & User Flows](14-ui-screens-and-user-flows.md) |
| Change colours, fonts, variants | [Chapter 13: Design System & Theming](13-design-system-and-theming.md) |
| Change stored data | [Chapter 15: Data Model & Database](15-data-model-and-database.md) |
| Call or add an endpoint | [Chapter 16: API Reference](16-api-reference.md) |
| Touch moderation, blocking, privacy | [Chapter 17: Trust, Safety & Privacy](17-trust-safety-and-privacy.md) |
| Touch alerts, push, live updates | [Chapter 18: Notifications & Real-Time Delivery](18-notifications-and-realtime.md) |
| See what changed in this release | [Chapter 19: Redesign Change Summary](19-redesign-change-summary.md) |
