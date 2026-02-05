import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "ESNext",
          moduleResolution: "Node",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!**/*.d.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "json-summary"],
  transformIgnorePatterns: [],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  watchman: false,
};

export default config;
