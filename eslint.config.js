import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended, // ESLint Javascript base rules
  ...tseslint.configs.recommended, // ESLint Typescript base rules
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        HTMLInputElement: "readonly",
        setTimeout: "readonly",
        CustomEvent: "readonly",
      },
    },
  },
  {
    // Globally ignore the dist directory.
    ignores: ["dist/*"],
  },
);
