import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Load next.config + .env into the test environment.
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/e2e/",
  ],
  // Coverage focuses on business logic + reusable components (unit-tested).
  // Pages and feature flows are covered by the Playwright E2E suite.
  collectCoverageFrom: [
    "src/lib/rbac/**/*.ts",
    "src/lib/auth/session.ts",
    "src/lib/auth/users.ts",
    "src/lib/api/repositories/query.ts",
    "src/lib/api/services/**/*.ts",
    "src/lib/validation/**/*.ts",
    "src/lib/utils.ts",
    "src/components/data-table/**/*.{ts,tsx}",
    "src/components/shared/states.tsx",
    "src/components/shared/status-badge.tsx",
    "src/components/auth/**/*.tsx",
    "src/components/ui/button.tsx",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 78,
      branches: 72,
      functions: 55,
      lines: 78,
    },
  },
};

export default createJestConfig(config);
