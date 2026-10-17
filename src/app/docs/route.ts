import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  darkMode: true,
  layout: "modern",
  spec: {
    url: "/api/openapi.json",
  },
  theme: "purple",
});
