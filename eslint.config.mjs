import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // --- Strictness ---
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-undef": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }], // console.log not allowed
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error", // enforce let/const
      "prefer-const": "error",
      eqeqeq: ["error", "always"],

      // --- Import / Export hygiene ---
      "import/no-unresolved": "error",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: false,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
        },
      ],

      // --- Code Style ---
      curly: ["error", "all"], // require {} even for one-liners
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      "arrow-body-style": ["error", "as-needed"],
      "prefer-arrow-callback": "error",

      // --- React / JSX ---
      "react/jsx-uses-react": "off", // not needed in Next.js
      "react/react-in-jsx-scope": "off", // not needed in Next.js
      "react/jsx-no-useless-fragment": "error",
      "react/self-closing-comp": "error",

      // --- TypeScript Specific ---
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn", // allow but warn
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
];

export default eslintConfig;
