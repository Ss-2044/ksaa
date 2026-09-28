import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";

const config = [
  ...next,
  ...ts,
  {
    // Reading browser-only state (storage, matchMedia) after hydration is intentional here.
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  { ignores: [".next/**", "node_modules/**", "cms/**", "next-env.d.ts"] },
];

export default config;
