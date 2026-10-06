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
- 📧 **Transactional Verification Emails**: Clean, responsive HTML emails delivered via Resend with React Email templates.
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
| **State & Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod v4](https://zod.dev/) |
| **Database & ODM** | [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) (Credentials & Google Providers) |
| **AI Integration** | [Vercel AI SDK](https://sdk.vercel.ai/) (`@ai-sdk/google`) + Google Gemini 2.5 Flash Lite |
| **Email Service** | [Resend](https://resend.com/) + [@react-email/components](https://react.email/) |
| **Linter & Formatter** | [Ultracite](https://github.com/ultracite/ultracite) (Biome) |

---

## 📁 Project Structure

```
GhostMsg/
├── .agents/                    # Agent skills & workflows
├── docs/                       # Project architecture & API specifications
│   ├── adr/                    # Architecture Decision Records (ADRs)
│   ├── agents/                 # Agent integration documentation
│   ├── api-reference.md        # Complete REST API documentation
│   ├── architecture.md         # Technical architecture & data flows
│   └── setup-guide.md          # Local development guide
├── emails/                     # React Email verification templates
├── public/                     # Static media & assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Authenticated layout group
│   │   │   ├── (auth)/         # /sign-in, /sign-up, /verify
│   │   │   └── (dashboard)/    # /dashboard (inbox, profile, settings)
│   │   ├── api/                # REST API endpoints & NextAuth handler
│   │   ├── u/[username]/       # Public profile anonymous messaging page
│   │   ├── layout.tsx          # Root layout & providers
│   │   └── page.tsx            # Hero landing page
│   ├── components/             # Reusable UI & animated components
│   ├── context/                # Context providers
│   ├── helpers/                # Email dispatchers & helpers
│   ├── hooks/                  # Custom React hooks (dashboard, message toggles)
│   ├── lib/                    # Database singleton, Resend, and utility helpers
│   ├── model/                  # Mongoose models & schemas (User, Message)
│   ├── schemas/                # Zod validation schemas
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
- **Resend** account for transactional emails
- **Google AI Studio** API key for Gemini suggestions

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Abbas4tech/GhostMsg.git
cd GhostMsg
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXT_AUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Resend Email
RESEND_API_KEY=your_resend_api_key

# Google AI Studio (Gemini)
GOOGLE_AI_STUDIO_SECRET=your_google_ai_studio_api_key

# Google OAuth (Optional)
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback/google
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Runs the Next.js dev server with Turbopack |
| `build` | `npm run build` | Builds the optimized production bundle with Turbopack |
| `start` | `npm run start` | Runs the built production server |
| `check` | `npm run check` | Runs Ultracite (Biome) type checks and linting |
| `fix` | `npm run fix` | Automatically fixes code style and lint issues |

---

## 📖 Documentation & Architecture

- **[System Architecture](file:///docs/architecture.md)**: Technical design, security model, and data flow.
- **[API Reference](file:///docs/api-reference.md)**: Detailed documentation of all API routes and schemas.
- **[Setup & Local Development Guide](file:///docs/setup-guide.md)**: Detailed configuration instructions.
- **[Domain Glossary](file:///GLOSSARY.md)**: Canonical terminology for GhostMsg domain concepts.
- **[Architecture Decision Records (ADRs)](file:///docs/adr/)**: Documented architectural trade-offs:
  - [`0001-embedded-messages-schema.md`](file:///docs/adr/0001-embedded-messages-schema.md): Storing messages as subdocuments.
  - [`0002-dual-authentication-and-email-verification.md`](file:///docs/adr/0002-dual-authentication-and-email-verification.md): Credentials + Google OAuth strategy.
  - [`0003-edge-runtime-for-ai-suggestions.md`](file:///docs/adr/0003-edge-runtime-for-ai-suggestions.md): Edge Runtime with Gemini 2.5 Flash Lite.
  - [`0004-ultracite-and-biome-tooling.md`](file:///docs/adr/0004-ultracite-and-biome-tooling.md): Fast, strict code formatting via Biome.

---

## 📸 Screenshots

<img width="1918" height="870" alt="GhostMsg Landing Page" src="https://github.com/user-attachments/assets/f4117395-4db6-4302-8acf-dbb584f6a012" />

<img width="1916" height="866" alt="GhostMsg Dashboard" src="https://github.com/user-attachments/assets/8b8576e8-0f79-41e3-aa38-644e4816e08b" />

<img width="1918" height="868" alt="GhostMsg Public Profile" src="https://github.com/user-attachments/assets/e5606482-c450-4ef0-ac22-229e9ca6dedd" />

---

## 📄 License

This project is licensed under the MIT License.
