# Setup & Local Development Guide

Step-by-step instructions for configuring, running, and testing GhostMsg locally.

---

## 1. Prerequisites

- **Node.js**: v18.18+ or v20+ recommended
- **npm** / **pnpm** / **bun**
- **MongoDB**: Local MongoDB instance or free cloud cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Resend API Key**: Free account at [Resend](https://resend.com) for sending verification emails
- **Google AI Studio Key**: API key from [Google AI Studio](https://aistudio.google.com/) for Gemini message prompt generation
- **Google Cloud Console OAuth**: OAuth 2.0 Client Credentials (optional, for Google Sign-In)

---

## 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Database
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/ghostmsg?retryWrites=true&w=majority"

# NextAuth Configuration
NEXT_AUTH_SECRET="your-generated-random-32-byte-secret"
NEXTAUTH_URL="http://localhost:3000"

# Resend Email Delivery
RESEND_API_KEY="re_123456789abcdef"

# Google AI Studio (Gemini)
GOOGLE_AI_STUDIO_SECRET="AIzaSy..."

# Google OAuth 2.0 Credentials (Optional)
GOOGLE_OAUTH_CLIENT_ID="xxxx-xxxx.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-xxxx"
GOOGLE_OAUTH_CALLBACK_URL="http://localhost:3000/api/auth/callback/google"
```

> [!TIP]
> Generate a strong `NEXT_AUTH_SECRET` in your terminal with:
> ```bash
> openssl rand -base64 32
> ```

---

## 3. Installation & Running

```bash
# 1. Install project dependencies
npm install

# 2. Run development server with Turbopack
npm run dev

# 3. Open application
# Navigate to http://localhost:3000
```

---

---

## 4. API Type Generation & Interactive Documentation

GhostMsg automatically derives TypeScript types directly from OpenAPI 3.1 specifications:

```bash
# Regenerate TypeScript API types (src/generated/api-schema.d.ts)
npm run typegen
# or
pnpm typegen
```

- **Interactive API Documentation (Scalar)**: Start the dev server and navigate to `http://localhost:3000/docs` (or `http://localhost:3000/api/docs`).
- **Raw OpenAPI 3.1 JSON**: Available at `http://localhost:3000/api/openapi.json`.

---

## 5. Code Quality & Linting

GhostMsg uses **Ultracite** (powered by Biome) for ultra-fast zero-config linting and formatting.

```bash
# Check code formatting and type safety
npm run check

# Automatically fix linting and formatting errors
npm run fix
```

---

## 6. Build for Production

```bash
# Automatically runs typegen and compiles production bundle with Turbopack
npm run build

# Start production server
npm run start
```

