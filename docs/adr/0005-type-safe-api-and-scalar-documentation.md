# Type-Safe API Routing with Zod OpenAPI, Scalar Documentation, and React Query

We use `@asteasolutions/zod-to-openapi` to generate OpenAPI 3.1 specifications from single-source-of-truth Zod schemas while maintaining standard Next.js Route Handlers. Interactive API documentation is served via Scalar at `/api/docs`. Client-server communication is modernized by deprecating Axios in favor of a type-safe Fetch client integrated with TanStack React Query (`@tanstack/react-query`) for declarative caching, automatic deduplication, and optimistic mutations.
