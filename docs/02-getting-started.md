# Chapter 2: Getting Started & Local Setup

This chapter guides you through setting up GhostMsg on your local development machine.

---

## 1. Prerequisites

Ensure you have the following installed and configured:
- **Node.js**: `v18.18+` or `v20+` (LTS recommended)
- **Package Manager**: `npm`, `pnpm`, or `bun`
- **MongoDB Database**: Local MongoDB instance or free cloud cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Resend Account**: Free account at [Resend](https://resend.com) for sending verification emails
- **Google AI Studio Key**: API key from [Google AI Studio](https://aistudio.google.com/) for Gemini message prompt generation
- **Google Cloud Console OAuth Credentials** *(optional)*: For Google OAuth 2.0 sign-in

---

## 2. Environment Variables Configuration

Create a `.env.local` file in the project root:

```bash
# ==============================================================================
# 1. Database Connection
# ==============================================================================
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/ghostmsg?retryWrites=true&w=majority"

# ==============================================================================
# 2. Authentication (NextAuth.js v4)
# ==============================================================================
# Generate with: openssl rand -base64 32
NEXT_AUTH_SECRET="your-generated-random-32-byte-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth 2.0 Credentials (Optional)
GOOGLE_OAUTH_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-your-google-client-secret"
GOOGLE_OAUTH_CALLBACK_URL="http://localhost:3000/api/auth/callback/google"

# ==============================================================================
# 3. Transactional Emails (Resend)
# ==============================================================================
RESEND_API_KEY="re_123456789abcdef"

# ==============================================================================
# 4. Google AI Studio (Gemini 2.5 Flash Lite)
# ==============================================================================
GOOGLE_AI_STUDIO_SECRET="AIzaSy..."
```

---

## 3. Installation & First Run

```bash
# 1. Clone the repository
git clone https://github.com/Abbas4tech/GhostMsg.git
cd GhostMsg

# 2. Install dependencies
pnpm install
# or: npm install

# 3. Generate TypeScript API types from OpenAPI spec
pnpm typegen

# 4. Start development server with Turbopack
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Key Local Endpoints

- **Web Application**: `http://localhost:3000`
- **Interactive API Documentation (Scalar)**: `http://localhost:3000/docs`
- **OpenAPI 3.1 Specification JSON**: `http://localhost:3000/api/openapi.json`
- **Dashboard (Authenticated)**: `http://localhost:3000/dashboard`

---

## 5. Next Chapter
Proceed to [Chapter 3: System Architecture](file:///d:/Projects/GhostMsg/docs/03-system-architecture.md) for technical architecture details.
