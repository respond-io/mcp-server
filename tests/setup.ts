/**
 * Jest setup - runs after test framework is installed.
 * Ensures RESPONDIO_API_KEY is set for tests that need it.
 */
if (!process.env.RESPONDIO_API_KEY) {
  process.env.RESPONDIO_API_KEY = "test-api-key";
}
