// Stub for the `server-only` package — its real module throws on import in
// the browser/Node test env. Aliases here point to this file via vitest
// config, so any code that imports `server-only` is a no-op during tests.
export {};
