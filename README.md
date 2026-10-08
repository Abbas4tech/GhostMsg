# GhostMsg 👻

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash_Lite-orange?style=flat&logo=google)](https://aistudio.google.com/)
[![Ultracite](https://img.shields.io/badge/Ultracite-Biome-purple?style=flat)](https://biomejs.dev/)

GhostMsg is a modern, privacy-first anonymous messaging platform built with Next.js 15 App Router, React 19, and Tailwind CSS v4. Share your unique public profile link and receive honest thoughts, questions, and confessions from friends, followers, or colleagues without disclosing sender identities.

---

## ✨ Key Features

- 👤 **Unique Public Profile Links**: Custom shareable URLs (`/u/[username]`) for instant anonymous messaging.
- 🤖 **AI Prompt Suggestions**: Real-time message ideas powered by Google AI Studio (`gemini-2.5-flash-lite`) running on Next.js Edge Runtime.
- 🔐 **Dual Authentication**: Secure sign-in via Email/Password (bcrypt-hashed + 6-digit OTP verification) and one-click Google OAuth 2.0.
- 📬 **Interactive User Dashboard**: View chronologically sorted inboxes, copy share links with one tap, and manage settings.
- 🎛️ **Message Acceptance Toggle**: Instantly switch message reception on or off at any time.
- 📜 **Interactive Scalar Documentation**: OpenAPI 3.1 interactive API playground and reference hosted at `/docs` and `/api/docs`.
- ⚡ **End-to-End Type Safety**: `openapi-fetch` SDK and `@tanstack/react-query` replacing Axios with compile-time checked routes, auto-invalidation, and native `AbortSignal`.
- 📧 **Transactional Verification Emails**: Clean, responsive HTML emails delivered via Nodemailer & SMTP with React Email templates.
- 🧪 **Vitest Unit & Component Testing**: 100% type-safe unit & React 19 component testing suite with Happy-DOM and Testing Library.
- 🎨 **Modern Animated UI**: Rich aesthetic built with Tailwind CSS v4, Motion, Lucide icons, and Sonner toast notifications.
- 🌓 **Theme Support**: Seamless Dark & Light mode toggle with persisted preferences.
- ⚡ **Strict Code Standards**: Zero-config formatting and type safety enforced by Ultracite (Biome).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Turbopack, Edge Runtime) |
| **Frontend Library** | [React 19](https://react.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/), [Radix UI](https://www.radix-ui.com/), [Embla Carousel](https://www.embla-carousel.com/) |
| **API Client & State** | [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) + [@tanstack/react-query](https://tanstack.com/query) |
| **API Documentation** | [Scalar](https://scalar.com/) ([@scalar/nextjs-api-reference](https://github.com/scalar/scalar)) + OpenAPI 3.1 |
| **State & Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod v4](https://zod.dev/) + [@asteasolutions/zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi) |
| **Database & ODM** | [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) (Credentials & Google Providers) |
| **AI Integration** | [Vercel AI SDK](https://sdk.vercel.ai/) (`@ai-sdk/google`) + Google Gemini 2.5 Flash Lite |
| **Email Service** | [Nodemailer](https://nodemailer.com/) (SMTP) + [@react-email/components](https://react.email/) |
| **Testing Suite** | [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/) + Happy DOM |
| **Linter & Formatter** | [Ultracite](https://github.com/ultracite/ultracite) (Biome) |

---

## 📁 Project Structure

```
GhostMsg/
├── .agents/                    # Agent skills & workflows
├── docs/                       # 10-chapter engineering documentation suite
│   ├── 01-overview.md          # Chapter 1: Vision, philosophy, & domain language
│   ├── 02-getting-started.md   # Chapter 2: Local setup, environment, & Turbopack
│   ├── 03-system-architecture.md# Chapter 3: Topology, NextAuth, & data modeling
│   ├── 04-api-and-type-safety.md# Chapter 4: OpenAPI 3.1, Scalar docs, & openapi-fetch
│   ├── 05-component-architecture.md# Chapter 5: App Router & Tailwind CSS v4 design
│   ├── 06-dev-workflow.md      # Chapter 6: Development lifecycle & Changesets
│   ├── 07-testing-strategy.md  # Chapter 7: Vitest unit & component test architecture
│   ├── 08-code-quality.md      # Chapter 8: Ultracite (Biome) & TypeScript standards
│   ├── 09-deployment-and-operations.md# Chapter 9: Vercel & MongoDB operations
│   ├── 10-storybook-and-ui-catalog.md# Chapter 10: Component catalog & mock states
│   ├── adr/                    # Architecture Decision Records (ADRs)
│   ├── agents/                 # Agent integration & coding guardrails
│   └── README.md               # Master documentation table of contents
├── emails/                     # React Email verification templates
├── public/                     # Static media & assets
├── scripts/                    # Code generators (OpenAPI type generation)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Authenticated layout group
│   │   │   ├── (auth)/         # /sign-in, /sign-up, /verify
│   │   │   └── (dashboard)/    # /dashboard (inbox, profile, settings)
│   │   ├── api/                # REST API endpoints & OpenAPI JSON
│   │   ├── docs/               # Interactive Scalar documentation route
│   │   ├── u/[username]/       # Public profile anonymous messaging page
│   │   ├── layout.tsx          # Root layout & providers
│   │   └── page.tsx            # Hero landing page
│   ├── components/             # Reusable UI & animated components
│   ├── context/                # Context providers (Auth, Query, Theme)
│   ├── generated/              # Auto-generated TypeScript API types
│   ├── helpers/                # Email dispatchers & helpers
│   ├── hooks/                  # Custom React hooks (dashboard, message toggles)
│   ├── lib/                    # Database singleton, openapi-fetch client, OpenAPI registry
│   ├── model/                  # Mongoose models & schemas (User, Message)
│   ├── schemas/                # Zod validation schemas extended with OpenAPI metadata
│   ├── test/                   # Vitest setup & custom React Query render utilities
│   └── types/                  # TypeScript definitions & ambient declarations
├── AGENTS.md                   # Agent system guidelines
├── GLOSSARY.md                 # Domain model glossary
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.18+ or v20+)
- **MongoDB** cluster URL (e.g. MongoDB Atlas)
- **SMTP Account** credentials for transactional email dispatch via Nodemailer
- **Google AI Studio** API key for Gemini suggestions

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Abbas4tech/GhostMsg.git
cd GhostMsg
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXT_AUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Transactional Email (Nodemailer SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# Google AI Studio (Gemini)
GOOGLE_AI_STUDIO_SECRET=your_google_ai_studio_api_key

# Google OAuth (Optional)
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback/google
```

### 3. Run Development Server

```bash
# 1. Generate TypeScript API types from OpenAPI spec
pnpm typegen

# 2. Start development server with Turbopack
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `pnpm dev` | Runs the Next.js dev server with Turbopack |
| `typegen` | `pnpm typegen` | Generates TypeScript definitions from OpenAPI 3.1 contracts |
| `build` | `pnpm build` | Automatically generates API types and builds production bundle |
| `start` | `pnpm start` | Runs the built production server |
| `test` | `pnpm test` | Runs Vitest unit & component test suite once |
| `test:watch` | `pnpm test:watch` | Runs Vitest test suite in interactive watch mode |
| `test:coverage` | `pnpm test:coverage` | Generates Vitest code coverage report |
| `check` | `pnpm check` | Runs Ultracite (Biome) type checks and linting |
| `fix` | `pnpm fix` | Automatically fixes code style and lint issues |

---

## 📖 Documentation Suite

Explore the numbered engineering chapters in [`docs/`](file:///docs/README.md):

- [**Chapter 1: Project Overview**](file:///docs/01-overview.md) – Vision, ubiquitous language, and feature map.
- [**Chapter 2: Getting Started & Local Setup**](file:///docs/02-getting-started.md) – Prerequisites, `.env.local` config, and setup.
- [**Chapter 3: System Architecture**](file:///docs/03-system-architecture.md) – Topology, NextAuth flow, and data modeling.
- [**Chapter 4: API & Type-Safety Architecture**](file:///docs/04-api-and-type-safety.md) – OpenAPI 3.1 registry, Scalar UI (`/docs`), and `openapi-fetch`.
- [**Chapter 5: Component Architecture & UI**](file:///docs/05-component-architecture.md) – App router structure, Tailwind CSS v4, and Radix primitives.
- [**Chapter 6: Developer Workflow**](file:///docs/06-dev-workflow.md) – Daily commands, pre-commit hooks, and type generation.
- [**Chapter 7: Testing Strategy**](file:///docs/07-testing-strategy.md) – Vitest unit & component test suite and Playwright E2E.
- [**Chapter 8: Code Quality & Standards**](file:///docs/08-code-quality.md) – Ultracite (Biome) configuration and strict TypeScript rules.
- [**Chapter 9: Deployment & Operations**](file:///docs/09-deployment-and-operations.md) – Vercel deployment, connection pooling, and SMTP configuration.
- [**Chapter 10: Storybook & UI Catalog**](file:///docs/10-storybook-and-ui-catalog.md) – Component isolation and visual state preview.

### Architectural Decision Records (ADRs)
- [`0001-embedded-messages-schema.md`](file:///docs/adr/0001-embedded-messages-schema.md): Storing messages as subdocuments.
- [`0002-dual-authentication-and-email-verification.md`](file:///docs/adr/0002-dual-authentication-and-email-verification.md): Credentials + Google OAuth strategy.
- [`0003-edge-runtime-for-ai-suggestions.md`](file:///docs/adr/0003-edge-runtime-for-ai-suggestions.md): Edge Runtime with Gemini 2.5 Flash Lite.
- [`0004-ultracite-and-biome-tooling.md`](file:///docs/adr/0004-ultracite-and-biome-tooling.md): Fast, strict code formatting via Biome.
- [`0005-type-safe-api-and-scalar-documentation.md`](file:///docs/adr/0005-type-safe-api-and-scalar-documentation.md): OpenAPI 3.1 contracts, Scalar UI, and `openapi-fetch`.
- [`0006-standardized-api-calling-and-react-query-architecture.md`](file:///docs/adr/0006-standardized-api-calling-and-react-query-architecture.md): `openapi-fetch` + `@tanstack/react-query` integration.
- [`0007-dependency-reclassification-and-bundle-optimization.md`](file:///docs/adr/0007-dependency-reclassification-and-bundle-optimization.md): Moving dev tooling to `devDependencies`.
- [`0008-react-optimization-and-bundle-analysis.md`](file:///docs/adr/0008-react-optimization-and-bundle-analysis.md): React 19 compiler & bundle size analysis.
- [`0009-biome-suppression-elimination-and-lint-remediation.md`](file:///docs/adr/0009-biome-suppression-elimination-and-lint-remediation.md): Clean lint enforcement across codebase.
- [`0010-standalone-messages-schema-and-feature-architecture.md`](file:///docs/adr/0010-standalone-messages-schema-and-feature-architecture.md): Standalone message collection and abuse prevention.
- [`0011-openapi-sdk-smtp-mailer-and-sender-unblocking.md`](file:///docs/adr/0011-openapi-sdk-smtp-mailer-and-sender-unblocking.md): OpenAPI SDK enforcement, Nodemailer SMTP mailer, & sender unblocking.
- [`0012-vitest-unit-and-integration-testing-strategy.md`](file:///docs/adr/0012-vitest-unit-and-integration-testing-strategy.md): Vitest unit & component test architecture.

---

## 📸 Screenshots

<img width="1918" height="870" alt="GhostMsg Landing Page" src="https://github.com/user-attachments/assets/f4117395-4db6-4302-8acf-dbb584f6a012" />

<img width="1916" height="866" alt="GhostMsg Dashboard" src="https://github.com/user-attachments/assets/8b8576e8-0f79-41e3-aa38-644e4816e08b" />

<img width="1918" height="868" alt="GhostMsg Public Profile" src="https://github.com/user-attachments/assets/e5606482-c450-4ef0-ac22-229e9ca6dedd" />

---

## 📄 License

This project is licensed under the MIT License.

